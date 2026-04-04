import { NextRequest, NextResponse } from "next/server";
import { requireAuth, forbiddenResponse } from "@/src/lib/middleware/auth";

// ---------------------------------------------------------------------------
// POST /api/reports/:id/submit  (sales 本人・draft のみ)
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 認証チェック
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;
  const { user } = authResult;

  // sales のみ提出可能
  if (user.role !== "sales") {
    return forbiddenResponse();
  }

  const { id: rawId } = await params;
  const reportId = Number(rawId);
  if (!Number.isInteger(reportId) || reportId <= 0) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "日報が存在しません" } },
      { status: 404 },
    );
  }

  const { prisma } = await import("@/src/lib/prisma");

  const report = await prisma.dailyReport.findUnique({
    where: { id: reportId },
    include: {
      visitRecords: { select: { id: true } },
    },
  });

  if (!report) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "日報が存在しません" } },
      { status: 404 },
    );
  }

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
          message: "既に提出済みの日報です",
        },
      },
      { status: 422 },
    );
  }

  // 訪問記録が0件チェック
  if (report.visitRecords.length === 0) {
    return NextResponse.json(
      {
        error: {
          code: "VISIT_RECORD_REQUIRED",
          message: "訪問記録が1件以上必要です",
        },
      },
      { status: 422 },
    );
  }

  // ステータスを submitted に更新
  const submitted = await prisma.dailyReport.update({
    where: { id: reportId },
    data: {
      status: "submitted",
      submittedAt: new Date(),
    },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    data: {
      id: submitted.id,
      status: submitted.status,
      submitted_at: submitted.submittedAt?.toISOString() ?? null,
      updated_at: submitted.updatedAt.toISOString(),
    },
  });
}
