import { NextRequest, NextResponse } from "next/server";
import { requireAuth, forbiddenResponse } from "@/src/lib/middleware/auth";

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

// ---------------------------------------------------------------------------
// POST /api/reports/:id/submit
// ---------------------------------------------------------------------------

export async function POST(
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

  // 日報の存在・所有者・訪問記録件数をまとめて取得
  const report = await prisma.dailyReport.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      userId: true,
      status: true,
      _count: { select: { visitRecords: true } },
    },
  });

  if (!report) return notFoundResponse();

  // 所有者チェック
  if (report.userId !== user.id) return forbiddenResponse();

  // 提出済みチェック
  if (report.status === "submitted") {
    return NextResponse.json(
      {
        error: {
          code: "REPORT_ALREADY_SUBMITTED",
          message: "既に提出済みの日報です",
        },
      },
      { status: 422 },
    );
  }

  // 訪問記録が0件の場合は提出不可
  if (report._count.visitRecords === 0) {
    return NextResponse.json(
      {
        error: {
          code: "VISIT_RECORD_REQUIRED",
          message: "提出には訪問記録が1件以上必要です",
        },
      },
      { status: 422 },
    );
  }

  // status を submitted に更新
  const updated = await prisma.dailyReport.update({
    where: { id: reportId },
    data: {
      status: "submitted",
      submittedAt: new Date(),
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
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { id: "asc" },
      },
    },
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
          ? {
              id: updated.user.department.id,
              name: updated.user.department.name,
            }
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
