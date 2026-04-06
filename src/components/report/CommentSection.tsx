"use client";

import { useState } from "react";
import type { CommentTargetType, ManagerComment } from "@/types";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

interface CommentSectionProps {
  reportId: number;
  targetType: CommentTargetType;
  comments: ManagerComment[];
  canComment: boolean;
}

export function CommentSection({
  reportId,
  targetType,
  comments,
  canComment,
}: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [localComments, setLocalComments] = useState(comments);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);

    const result = await apiFetch<ManagerComment>(`/reports/${reportId}/comments`, {
      method: "POST",
      body: JSON.stringify({ target_type: targetType, content: content.trim() }),
    });

    if (result.ok) {
      setLocalComments([...localComments, result.data]);
      setContent("");
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <h4 className="mb-2 text-sm font-medium text-gray-500">コメント</h4>
      {localComments.length === 0 ? (
        <p className="text-sm text-gray-400">コメントなし</p>
      ) : (
        <div className="space-y-2">
          {localComments.map((comment) => (
            <div key={comment.id} className="text-sm">
              <span className="font-medium text-gray-700">[{comment.user.name}]</span>{" "}
              <span className="text-gray-600">{comment.content}</span>
              <span className="ml-2 text-xs text-gray-400">
                ({new Date(comment.createdAt).toLocaleString("ja-JP")})
              </span>
            </div>
          ))}
        </div>
      )}
      {canComment && (
        <div className="mt-3 flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            rows={2}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="コメントを入力..."
          />
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            size="sm"
            className="self-end"
          >
            {submitting ? "送信中..." : "送信"}
          </Button>
        </div>
      )}
    </div>
  );
}
