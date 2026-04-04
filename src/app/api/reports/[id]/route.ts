import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  forbiddenResponse,
} from "@/src/lib/middleware/auth";
import { updateReportSchema } from "@/src/lib/schemas/report";
import { ZodError } from "zod";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function notFoundResponse(): NextResponse {
  return NextResponse.json(
    { error: { code: "NOT_FOUND", message: "日報が見つかりません" } },
    { status: 404 },
  );
}

function parseReportId(idParam: string): number | null {
  const id = parseInt(idParam, 10);
  return Number.isNaN(id) || id <= 0 ? null : id;
}

/** 日報を Prisma で取得する（user / visitRecords / comments を含む） */
async function fetchReport(id: number) {
  const { prisma } = await import("@/src/lib/prisma");
  return prisma.dailyReport.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          departmentId: true,
          department: { select: { id: true, name: true } },
        },
      },
      visitRecords: {
        include: {
          customer: { select: { id: true, name: true, companyName: true } },
        },
        orderBy: { id: "asc" },
      },
      comments: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { id: "asc" },
      },
    },
  });
}

type ReportWithRelations = NonNullable<Awaited<ReturnType<typeof fetchReport>>>;

/** レスポンス用にシリアライズする */
function serializeReport(report: ReportWithRelations) {
  return {
    id: report.id,
    report_date: report.reportDate.toISOString().slice(0, 10),
    status: report.status,
    submitted_at: report.submittedAt?.toISOString() ?? null,
    user: {
      id: report.user.id,
      name: report.user.name,
      department: report.user.department
        ? { id: report.user.department.id, name: report.user.department.name }
        : null,
    },
    visit_records: report.visitRecords.map((vr) => ({
      id: vr.id,
      customer: {
        id: vr.customer.id,
        name: vr.customer.name,
        company_name: vr.customer.companyName,
      },
      content: vr.content,
      visited_at: vr.visitedAt ?? null,
    })),
    problem: report.problem ?? null,
    plan: report.plan ?? null,
    comments: report.comments.map((c) => ({
      id: c.id,
      target_type: c.targetType,
      content: c.content,
      user: { id: c.user.id, name: c.user.name },
      created_at: c.createdAt.toISOString(),
    })),
    created_at: report.createdAt.toISOString(),
    updated_at: report.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// GET /api/reports/:id
// ---------------------------------------------------------------------------

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;
  const { user } = authResult;

  const { id: idParam } = await params;
  const reportId = parseReportId(idParam);
  if (reportId === null) return notFoundResponse();

  const report = await fetchReport(reportId);
  if (!report) return notFoundResponse();

  // アクセス制御
  if (user.role === "sales") {
    if (report.userId !== user.id) return forbiddenResponse();
  } else if (user.role === "manager") {
    // 同一部署チェック
    if (
      report.user.departmentId === null ||
      user.departmentId === null ||
      report.user.departmentId !== user.departmentId
    ) {
      return forbiddenResponse();
    }
  }
  // admin は全日報アクセス可

  return NextResponse.json({ data: serializeReport(report) });
}

// ---------------------------------------------------------------------------
// PUT /api/reports/:id
// ---------------------------------------------------------------------------

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;
  const { user } = authResult;

  // sales 本人のみ（manager / admin も不可）
  if (user.role !== "sales") {
    return forbiddenResponse();
  }

  const { id: idParam } = await params;
  const reportId = parseReportId(idParam);
  if (reportId === null) return notFoundResponse();

  const { prisma } = await import("@/src/lib/prisma");

  // 日報の存在と所有者チェック
  const existing = await prisma.dailyReport.findUnique({
    where: { id: reportId },
    select: { id: true, userId: true, status: true },
  });
  if (!existing) return notFoundResponse();

  if (existing.userId !== user.id) return forbiddenResponse();

  if (existing.status === "submitted") {
    return NextResponse.json(
      {
        error: {
          code: "REPORT_ALREADY_SUBMITTED",
          message: "提出済みの日報は編集できません",
        },
      },
      { status: 422 },
    );
  }

  // リクエストボディのパース
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "リクエストボディが不正です" } },
      { status: 400 },
    );
  }

  // Zod バリデーション
  let input;
  try {
    input = updateReportSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "入力値が不正です",
            details: err.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
        },
        { status: 400 },
      );
    }
    throw err;
  }

  // 顧客IDの存在チェック
  const customerIds = [
    ...new Set(input.visit_records.map((r) => r.customer_id)),
  ];
  const existingCustomers = await prisma.customer.findMany({
    where: { id: { in: customerIds } },
    select: { id: true },
  });
  const existingCustomerIds = new Set(existingCustomers.map((c) => c.id));
  const invalidCustomerIds = customerIds.filter(
    (id) => !existingCustomerIds.has(id),
  );
  if (invalidCustomerIds.length > 0) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: `存在しない顧客IDが含まれています: ${invalidCustomerIds.join(", ")}`,
        },
      },
      { status: 400 },
    );
  }

  const reportDate = new Date(input.report_date);

  // トランザクション: 訪問記録を全件削除→再挿入
  const updated = await prisma.$transaction(async (tx) => {
    // 訪問記録を全件削除
    await tx.visitRecord.deleteMany({ where: { reportId } });

    // 日報本体と訪問記録を更新・再挿入
    return tx.dailyReport.update({
      where: { id: reportId },
      data: {
        reportDate,
        problem: input.problem ?? null,
        plan: input.plan ?? null,
        visitRecords: {
          create: input.visit_records.map((r) => ({
            customerId: r.customer_id,
            content: r.content,
            visitedAt: r.visited_at ?? null,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            departmentId: true,
            department: { select: { id: true, name: true } },
          },
        },
        visitRecords: {
          include: {
            customer: { select: { id: true, name: true, companyName: true } },
          },
          orderBy: { id: "asc" },
        },
        comments: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { id: "asc" },
        },
      },
    });
  });

  return NextResponse.json({ data: serializeReport(updated) });
}
