"use client";

import { useState } from "react";
import type { Comment } from "@/src/types/report";

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

interface CommentSectionProps {
  reportId: number;
  targetType: "problem" | "plan";
  comments: Comment[];
  canComment: boolean;
  onCommentAdded: (comment: Comment) => void;
}

const MAX_COMMENT_LENGTH = 1000;

export function CommentSection({
  reportId,
  targetType,
  comments,
  canComment,
  onCommentAdded,
}: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredComments = comments.filter((c) => c.target_type === targetType);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) return;

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setError(`コメントは${MAX_COMMENT_LENGTH}文字以内で入力してください。`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: targetType, content: trimmed }),
      });

      if (!res.ok) {
        throw new Error("コメントの投稿に失敗しました。");
      }

      const json = (await res.json()) as { data: Comment };
      onCommentAdded(json.data);
      setContent("");
    } catch {
      setError("コメントの投稿に失敗しました。再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-3">
      <h4 className="mb-2 text-sm font-medium text-gray-600">コメント</h4>

      {filteredComments.length === 0 ? (
        <p className="text-sm text-gray-400">コメントなし</p>
      ) : (
        <ul className="space-y-2">
          {filteredComments.map((comment) => (
            <li key={comment.id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium text-gray-700">{comment.user.name}</span>
                <time dateTime={comment.created_at}>{formatDateTime(comment.created_at)}</time>
              </div>
              <p className="mt-1 text-sm whitespace-pre-wrap text-gray-800">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}

      {canComment && (
        <form onSubmit={handleSubmit} className="mt-3">
          <label htmlFor={`comment-${targetType}`} className="sr-only">
            {targetType === "problem" ? "課題へのコメント" : "計画へのコメント"}
          </label>
          <textarea
            id={`comment-${targetType}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="コメントを入力..."
            maxLength={MAX_COMMENT_LENGTH}
            rows={2}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            aria-describedby={error ? `comment-error-${targetType}` : undefined}
          />
          <div className="mt-1 flex items-center justify-between">
            <div>
              {error && (
                <p id={`comment-error-${targetType}`} className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {content.length}/{MAX_COMMENT_LENGTH}
              </span>
              <button
                type="submit"
                disabled={isSubmitting || content.trim().length === 0}
                className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "送信中..." : "送信"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
