"use client";

import Link from "next/link";
import type { DailyReport } from "@/types";

interface ReportTableProps {
  reports: DailyReport[];
  showAuthor: boolean;
}

function getCommentLabel(report: DailyReport): React.ReactNode {
  if (report.status === "draft") {
    return <span className="text-gray-400">—</span>;
  }
  if (report.comments.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-orange-600">
        未コメント
        <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
      </span>
    );
  }
  return <span className="text-green-600">コメント済み</span>;
}

function getStatusBadge(status: string) {
  if (status === "submitted") {
    return (
      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        提出済み
      </span>
    );
  }
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      下書き
    </span>
  );
}

export function ReportTable({ reports, showAuthor }: ReportTableProps) {
  if (reports.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">日報がありません</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">日付</th>
            {showAuthor && (
              <th className="px-4 py-3 text-left font-medium text-gray-700">担当者</th>
            )}
            <th className="px-4 py-3 text-left font-medium text-gray-700">ステータス</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">コメント</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/reports/${report.id}`} className="text-blue-600 hover:underline">
                  {report.reportDate}
                </Link>
              </td>
              {showAuthor && <td className="px-4 py-3 text-gray-700">{report.user.name}</td>}
              <td className="px-4 py-3">{getStatusBadge(report.status)}</td>
              <td className="px-4 py-3">{getCommentLabel(report)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
