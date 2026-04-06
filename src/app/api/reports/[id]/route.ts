export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, type AuthUser } from "@/lib/middleware/auth";
import { updateReportSchema } from "@/lib/schemas/report";
import { formatReportResponse } from "@/app/api/reports/route";

type RouteParams = { params: Promise<{ id: string }> };

const reportInclude = {
  user: { select: { id: true, name: true, department: { select: { id: true, name: true } } } },
  visitRecords: {
    include: {
      customer: { select: { id: true, name: true, companyName: true } },
    },
  },
  comments: {
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

async function checkReportAccess(
  user: AuthUser,
  report: { userId: number; user: { department?: { id: number } } },
) {
  if (user.role === "sales" && report.userId !== user.sub) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "権限がありません" } },
      { status: 403 },
    );
  }
  if (user.role === "manager") {
    const reportUser = await prisma.user.findUnique({
      where: { id: report.userId },
      select: { departmentId: true },
    });
    if (!reportUser || reportUser.departmentId !== user.departmentId) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "権限がありません" } },
        { status: 403 },
      );
    }
  }
  return null;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;
  const user: AuthUser = authResult;

  const { id } = await params;
  const reportId = Number(id);
  if (isNaN(reportId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "IDが不正です" } },
      { status: 400 },
    );
  }

  const report = await prisma.dailyReport.findUnique({
    where: { id: reportId },
    include: reportInclude,
  });

  if (!report) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "日報が見つかりません" } },
      { status: 404 },
    );
  }

  const accessError = await checkReportAccess(user, report);
  if (accessError) return accessError;

  return NextResponse.json({ data: formatDetailResponse(report) });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;
  const user: AuthUser = authResult;

  if (user.role !== "sales") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "権限がありません" } },
      { status: 403 },
    );
  }

  const { id } = await params;
  const reportId = Number(id);
  if (isNaN(reportId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "IDが不正です" } },
      { status: 400 },
    );
  }

  const existing = await prisma.dailyReport.findUnique({
    where: { id: reportId },
    include: { visitRecords: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "日報が見つかりません" } },
      { status: 404 },
    );
  }

  if (existing.userId !== user.sub) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "権限がありません" } },
      { status: 403 },
    );
  }

  if (existing.status === "submitted") {
    return NextResponse.json(
      { error: { code: "REPORT_ALREADY_SUBMITTED", message: "提出済みの日報は更新できません" } },
      { status: 422 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "リクエストボディが不正です" } },
      { status: 400 },
    );
  }

  const parsed = updateReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "入力値が不正です",
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  const { visit_records, problem, plan, report_date } = parsed.data;

  const report = await prisma.$transaction(async (tx) => {
    // 訪問記録の差分更新: idありは更新、idなしは新規、送信されなかったものは削除
    const incomingIds = visit_records.filter((vr) => vr.id).map((vr) => vr.id!);
    const existingIds = existing.visitRecords.map((vr) => vr.id);
    const toDelete = existingIds.filter((eid) => !incomingIds.includes(eid));

    if (toDelete.length > 0) {
      await tx.visitRecord.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const vr of visit_records) {
      if (vr.id) {
        await tx.visitRecord.update({
          where: { id: vr.id },
          data: {
            customerId: vr.customer_id,
            content: vr.content,
            visitedAt: vr.visited_at ?? null,
          },
        });
      } else {
        await tx.visitRecord.create({
          data: {
            reportId: reportId,
            customerId: vr.customer_id,
            content: vr.content,
            visitedAt: vr.visited_at ?? null,
          },
        });
      }
    }

    return tx.dailyReport.update({
      where: { id: reportId },
      data: {
        ...(report_date && { reportDate: new Date(report_date) }),
        problem: problem ?? existing.problem,
        plan: plan ?? existing.plan,
      },
      include: reportInclude,
    });
  });

  return NextResponse.json({ data: formatDetailResponse(report) });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatDetailResponse(report: any) {
  const base = formatReportResponse(report);
  return {
    ...base,
    user: {
      ...base.user,
      department: report.user.department
        ? { id: report.user.department.id, name: report.user.department.name }
        : undefined,
    },
  };
}
