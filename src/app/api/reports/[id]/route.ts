import { NextRequest, NextResponse } from "next/server";
import { requireAuth, forbiddenResponse } from "@/src/lib/middleware/auth";
import { updateReportSchema } from "@/src/lib/schemas/report";
import { ZodError } from "zod";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function notFoundResponse(): NextResponse {
  return NextResponse.json(
    { error: { code: "NOT_FOUND", message: "日報が存在しません" } },
    { status: 404 },
  );
}

function parseId(rawId: string): number | null {
  const n = Number(rawId);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ---------------------------------------------------------------------------
// GET /api/reports/:id
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 認証チェック
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;
  const { user } = authResult;

  const { id: rawId } = await params;
  const reportId = parseId(rawId);
  if (reportId === null) return notFoundResponse();

  const { prisma } = await import("@/src/lib/prisma");

  const report = await prisma.dailyReport.findUnique({
    where: { id: reportId },
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

  if (!report) return notFoundResponse();

  // アクセス制御
  if (user.role === "sales") {
    // 自分の日報のみ
    if (report.userId !== user.id) {
      return forbiddenResponse();
    }
  } else if (user.role === "manager") {
    // 同一部署のユーザーの日報のみ
    if (user.departmentId === null || report.user.departmentId !== user.departmentId) {
      return forbiddenResponse();
    }
  }
  // admin はすべてアクセス可

  return NextResponse.json({
    data: {
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
    },
  });
}

// ---------------------------------------------------------------------------
// PUT /api/reports/:id  (sales 本人・draft のみ)
// ---------------------------------------------------------------------------

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 認証チェック
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;
  const { user } = authResult;

  // sales のみ更新可能
  if (user.role !== "sales") {
    return forbiddenResponse();
  }

  const { id: rawId } = await params;
  const reportId = parseId(rawId);
  if (reportId === null) return notFoundResponse();

  const { prisma } = await import("@/src/lib/prisma");

  const report = await prisma.dailyReport.findUnique({
    where: { id: reportId },
    select: { id: true, userId: true, status: true },
  });

  if (!report) return notFoundResponse();

  // 本人チェック
  if (report.userId !== user.id) {
    return forbiddenResponse();
  }

  // 提出済みチェック
  if (report.status === "submitted") {
    return NextResponse.json(
      {
        error: {
          code: "REPORT_ALREADY_SUBMITTED",
          message: "提出済みの日報は更新できません",
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
  const customerIds: number[] = [
    ...new Set(input.visit_records.map((r: { customer_id: number }) => r.customer_id)),
  ];
  const existingCustomers = await prisma.customer.findMany({
    where: { id: { in: customerIds } },
    select: { id: true },
  });
  const existingCustomerIds = new Set(existingCustomers.map((c) => c.id));
  const invalidCustomerIds = customerIds.filter((id: number) => !existingCustomerIds.has(id));
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

  // トランザクション: 訪問記録を全件削除して再挿入
  const updated = await prisma.$transaction(async (tx) => {
    // 既存の訪問記録を全削除
    await tx.visitRecord.deleteMany({ where: { reportId } });

    // 日報本体と訪問記録を更新
    return tx.dailyReport.update({
      where: { id: reportId },
      data: {
        reportDate,
        problem: input.problem ?? null,
        plan: input.plan ?? null,
        visitRecords: {
          create: input.visit_records.map(
            (r: { customer_id: number; content: string; visited_at?: string }) => ({
              customerId: r.customer_id,
              content: r.content,
              visitedAt: r.visited_at ?? null,
            }),
          ),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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
          include: { user: { select: { id: true, name: true } } },
          orderBy: { id: "asc" },
        },
      },
    });
  });

  return NextResponse.json({
    data: {
      id: updated.id,
      report_date: updated.reportDate.toISOString().slice(0, 10),
      status: updated.status,
      submitted_at: updated.submittedAt?.toISOString() ?? null,
      user: {
        id: updated.user.id,
        name: updated.user.name,
        department: updated.user.department
          ? { id: updated.user.department.id, name: updated.user.department.name }
          : null,
      },
      visit_records: updated.visitRecords.map((vr) => ({
        id: vr.id,
        customer: {
          id: vr.customer.id,
          name: vr.customer.name,
          company_name: vr.customer.companyName,
        },
        content: vr.content,
        visited_at: vr.visitedAt ?? null,
      })),
      problem: updated.problem ?? null,
      plan: updated.plan ?? null,
      comments: updated.comments.map((c) => ({
        id: c.id,
        target_type: c.targetType,
        content: c.content,
        user: { id: c.user.id, name: c.user.name },
        created_at: c.createdAt.toISOString(),
      })),
      created_at: updated.createdAt.toISOString(),
      updated_at: updated.updatedAt.toISOString(),
    },
  });
}
