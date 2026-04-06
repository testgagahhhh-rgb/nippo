export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, authorizeRole, type AuthUser } from "@/lib/middleware/auth";
import { createCommentSchema } from "@/lib/schemas/comment";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;
  const user: AuthUser = authResult;

  const roleError = authorizeRole(user, ["manager", "admin"]);
  if (roleError) return roleError;

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
  });

  if (!report) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "日報が見つかりません" } },
      { status: 404 },
    );
  }

  if (report.status !== "submitted") {
    return NextResponse.json(
      {
        error: { code: "REPORT_NOT_SUBMITTED", message: "下書き状態の日報にはコメントできません" },
      },
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

  const parsed = createCommentSchema.safeParse(body);
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

  const comment = await prisma.managerComment.create({
    data: {
      reportId,
      userId: user.sub,
      targetType: parsed.data.target_type,
      content: parsed.data.content,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(
    {
      data: {
        id: comment.id,
        report_id: comment.reportId,
        target_type: comment.targetType,
        content: comment.content,
        user: { id: comment.user.id, name: comment.user.name },
        created_at: comment.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
