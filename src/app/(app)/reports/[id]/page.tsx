"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api/client";
import { CommentSection } from "@/components/report/CommentSection";
import type { DailyReport } from "@/types";

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    apiFetch<DailyReport>(`/reports/${id}`).then((result) => {
      if (result.ok) {
        setReport(result.data);
      } else {
        setNotFoundState(true);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="py-8 text-center text-gray-500">読み込み中...</div>;
  }

  if (notFoundState || !report) {
    notFound();
  }

  const authUser = getAuthUser();
  const isOwner = authUser?.id === report.userId;
  const isManager = authUser?.role === "manager";
  const canComment = isManager;
  const canEdit = isOwner && report.status === "draft";

  const problemComments = report.comments.filter((c) => c.targetType === "problem");
  const planComments = report.comments.filter((c) => c.targetType === "plan");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            &larr; 一覧へ
          </Link>
          <h1 className="text-2xl font-bold">日報詳細</h1>
          <span className="text-sm text-gray-500">
            {report.user.name} / {report.reportDate}
          </span>
        </div>
        {canEdit && (
          <Link
            href={`/reports/${report.id}/edit`}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            編集する
          </Link>
        )}
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">訪問記録</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">顧客名</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">訪問内容</th>
                <th className="w-20 px-4 py-3 text-left font-medium text-gray-700">時刻</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {report.visitRecords.map((vr) => (
                <tr key={vr.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{vr.customer.companyName}</td>
                  <td className="px-4 py-3 text-gray-700">{vr.content}</td>
                  <td className="px-4 py-3 text-gray-500">{vr.visitedAt ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">今の課題・相談</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm whitespace-pre-wrap text-gray-700">
            {report.problem || "（記載なし）"}
          </p>
          <CommentSection
            reportId={report.id}
            targetType="problem"
            comments={problemComments}
            canComment={canComment}
          />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">明日やること</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm whitespace-pre-wrap text-gray-700">
            {report.plan || "（記載なし）"}
          </p>
          <CommentSection
            reportId={report.id}
            targetType="plan"
            comments={planComments}
            canComment={canComment}
          />
        </div>
      </section>
    </div>
  );
}
