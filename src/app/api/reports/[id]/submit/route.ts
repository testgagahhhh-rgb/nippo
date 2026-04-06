import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, type AuthUser } from "@/lib/middleware/auth";
import { formatReportResponse } from "@/app/api/reports/route";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
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
    include: { _count: { select: { visitRecords: true } } },
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
      { error: { code: "REPORT_ALREADY_SUBMITTED", message: "既に提出済みです" } },
      { status: 422 },
    );
  }

  if (existing._count.visitRecords === 0) {
    return NextResponse.json(
      { error: { code: "VISIT_RECORD_REQUIRED", message: "訪問記録が0件の日報は提出できません" } },
      { status: 422 },
    );
  }

  const report = await prisma.dailyReport.update({
    where: { id: reportId },
    data: {
      status: "submitted",
      submittedAt: new Date(),
    },
    include: {
      user: { select: { id: true, name: true } },
      visitRecords: {
        include: {
          customer: { select: { id: true, name: true, companyName: true } },
        },
      },
      comments: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  return NextResponse.json({ data: formatReportResponse(report) });
}
