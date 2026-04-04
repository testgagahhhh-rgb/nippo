import { getDb, nextId } from "@/src/lib/db";
import type { DbComment } from "@/src/lib/db";

export type CreateCommentInput = {
  target_type: string;
  content: string;
};

/**
 * コメントを投稿する
 */
export function createComment(
  reportId: number,
  userId: number,
  input: CreateCommentInput,
): DbComment {
  const db = getDb();

  const report = db.daily_reports.find((r) => r.id === reportId);
  if (!report) {
    throw new Error("日報が見つかりません");
  }

  const comment: DbComment = {
    id: nextId("comments"),
    report_id: reportId,
    user_id: userId,
    target_type: input.target_type,
    content: input.content,
    created_at: new Date().toISOString(),
  };

  db.comments.push(comment);
  return comment;
}
