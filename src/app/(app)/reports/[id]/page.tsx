"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth";
import { CommentSection } from "@/src/components/report/CommentSection";
import type { Report, Comment } from "@/src/types/report";

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${params.id}`);
        if (!res.ok) {
          throw new Error("日報の取得に失敗しました。");
        }
        const json = (await res.json()) as { data: Report };
        setReport(json.data);
      } catch {
        setError("日報の取得に失敗しました。再度お試しください。");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [params.id]);

  const handleCommentAdded = useCallback((newComment: Comment) => {
    setReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: [...prev.comments, newComment],
      };
    });
  }, []);

  const canComment = user.role === "manager";
  const canEdit =
    report !== null &&
    report.status === "draft" &&
    user.role === "sales" &&
    user.id === report.user.id;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error ?? "日報が見つかりません。"}</p>
          <button
            onClick={() => router.push("/reports")}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            一覧へ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push("/reports")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          aria-label="日報一覧へ戻る"
        >
          <span aria-hidden="true">&larr;</span> 一覧へ
        </button>
        <h1 className="text-lg font-bold text-gray-900">日報詳細</h1>
        <span className="text-sm text-gray-500">
          {report.user.name} / {report.report_date}
        </span>
      </div>

      {/* 訪問記録 */}
      <section aria-labelledby="visit-records-heading" className="mb-8">
        <h2 id="visit-records-heading" className="mb-3 text-base font-semibold text-gray-800">
          訪問記録
        </h2>
        {report.visit_records.length === 0 ? (
          <p className="text-sm text-gray-400">訪問記録なし</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="px-3 py-2 font-medium" scope="col">
                    顧客名
                  </th>
                  <th className="px-3 py-2 font-medium" scope="col">
                    訪問内容
                  </th>
                  <th className="px-3 py-2 font-medium" scope="col">
                    時刻
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.visit_records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">{record.customer.company_name}</td>
                    <td className="px-3 py-2">{record.content}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{record.visited_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 課題・相談 (problem) */}
      <section aria-labelledby="problem-heading" className="mb-8">
        <h2 id="problem-heading" className="mb-3 text-base font-semibold text-gray-800">
          今の課題・相談
        </h2>
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-sm whitespace-pre-wrap text-gray-800">
            {report.problem || "記載なし"}
          </p>
        </div>
        <CommentSection
          reportId={report.id}
          targetType="problem"
          comments={report.comments}
          canComment={canComment}
          onCommentAdded={handleCommentAdded}
        />
      </section>

      {/* 明日やること (plan) */}
      <section aria-labelledby="plan-heading" className="mb-8">
        <h2 id="plan-heading" className="mb-3 text-base font-semibold text-gray-800">
          明日やること
        </h2>
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-sm whitespace-pre-wrap text-gray-800">{report.plan || "記載なし"}</p>
        </div>
        <CommentSection
          reportId={report.id}
          targetType="plan"
          comments={report.comments}
          canComment={canComment}
          onCommentAdded={handleCommentAdded}
        />
      </section>

      {/* 編集ボタン */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => router.push(`/reports/${report.id}/edit`)}
            className="rounded bg-gray-800 px-6 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            編集する
          </button>
        </div>
      )}
    </main>
  );
}
