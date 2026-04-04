import { NextRequest, NextResponse } from "next/server";
import { requireAuth, forbiddenResponse } from "@/src/lib/middleware/auth";
import { createCommentSchema } from "@/src/lib/schemas/report";
import { ZodError } from "zod";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseId(rawId: string): number | null {
  const n = Number(rawId);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ---------------------------------------------------------------------------
// POST /api/reports/:id/comments  (manager, admin のみ)
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 認証チェック
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;
  const { user } = authResult;

  // ロールチェック: manager / admin のみ
  if (user.role === "sales") {
    return forbiddenResponse("コメントを投稿する権限がありません");
  }

  const { id: rawId } = await params;
  const reportId = parseId(rawId);
  if (reportId === null) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "日報が存在しません" } },
      { status: 404 },
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
  let input: { target_type: "problem" | "plan"; content: string };
  try {
    input = createCommentSchema.parse(body);
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

  const { prisma } = await import("@/src/lib/prisma");

  // 日報の存在確認とステータスチェック
  const report = await prisma.dailyReport.findUnique({
    where: { id: reportId },
    select: { id: true, status: true },
  });

  if (!report) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "日報が存在しません" } },
      { status: 404 },
    );
  }

  // 提出済みのみコメント可能
  if (report.status !== "submitted") {
    return NextResponse.json(
      {
        error: {
          code: "REPORT_NOT_SUBMITTED",
          message: "提出前の日報にはコメントできません",
        },
      },
      { status: 422 },
    );
  }

  // コメント作成
  const comment = await prisma.comment.create({
    data: {
      reportId,
      userId: user.id,
      targetType: input.target_type,
      content: input.content,
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
        user: {
          id: comment.user.id,
          name: comment.user.name,
        },
        created_at: comment.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
