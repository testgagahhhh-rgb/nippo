"use client";

import { useRouter } from "next/navigation";
import type { Report, Role } from "@/src/types";
import { STATUS_LABELS } from "@/src/types";

interface ReportListProps {
  reports: Report[];
  role: Role;
}

export function ReportList({ reports, role }: ReportListProps) {
  const router = useRouter();
  const showUserColumn = role === "manager" || role === "admin";

  if (reports.length === 0) {
    return <div className="py-12 text-center text-gray-500">日報がありません。</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              日付
            </th>
            {showUserColumn && (
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                担当者
              </th>
            )}
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              ステータス
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              コメント
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {reports.map((report) => (
            <tr
              key={report.id}
              onClick={() => router.push(`/reports/${report.id}`)}
              className="cursor-pointer transition-colors hover:bg-gray-50"
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/reports/${report.id}`);
                }
              }}
            >
              <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900">
                {formatDate(report.report_date)}
              </td>
              {showUserColumn && (
                <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900">
                  {report.user.name}
                </td>
              )}
              <td className="px-4 py-3 text-sm whitespace-nowrap">
                <StatusBadge status={report.status} />
              </td>
              <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-500">
                <CommentIndicator report={report} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: Report["status"] }) {
  const label = STATUS_LABELS[status];
  const className =
    status === "submitted"
      ? "inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold leading-5 text-green-800"
      : "inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold leading-5 text-gray-800";

  return <span className={className}>{label}</span>;
}

function CommentIndicator({ report }: { report: Report }) {
  if (report.status === "draft") {
    return <span className="text-gray-400">&mdash;</span>;
  }

  if (report.has_unread_comment) {
    return (
      <span className="flex items-center gap-1">
        未コメント
        <span className="text-red-500" aria-label="未読コメントあり">
          ●
        </span>
      </span>
    );
  }

  return <span>コメント済み</span>;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}/${month}/${day}`;
}
