"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { reports, users } from "@/lib/mockData";
import { ReportTable } from "@/components/dashboard/ReportTable";
import { ReportFilters } from "@/components/dashboard/ReportFilters";

export default function DashboardPage() {
  const authUser = getAuthUser();
  const isSales = authUser?.role === "sales";

  const [yearMonth, setYearMonth] = useState("");
  const [status, setStatus] = useState("");
  const [authorId, setAuthorId] = useState("");

  const salesUsers = useMemo(() => users.filter((u) => u.role === "sales"), []);

  const filteredReports = useMemo(() => {
    let result = [...reports];

    // 営業は自分の日報のみ
    if (isSales && authUser) {
      result = result.filter((r) => r.userId === authUser.id);
    }

    // 上長は未コメントを優先表示
    if (authUser?.role === "manager") {
      result.sort((a, b) => {
        const aUncommented = a.status === "submitted" && a.comments.length === 0 ? 0 : 1;
        const bUncommented = b.status === "submitted" && b.comments.length === 0 ? 0 : 1;
        return aUncommented - bUncommented;
      });
    }

    // フィルター: 年月
    if (yearMonth) {
      result = result.filter((r) => r.reportDate.startsWith(yearMonth));
    }

    // フィルター: 担当者
    if (authorId) {
      result = result.filter((r) => r.userId === Number(authorId));
    }

    // フィルター: ステータス
    if (status) {
      result = result.filter((r) => r.status === status);
    }

    return result;
  }, [isSales, authUser, yearMonth, authorId, status]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">日報一覧</h1>
        {isSales && (
          <Link
            href="/reports/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + 日報を作成
          </Link>
        )}
      </div>

      <div className="mb-4">
        <ReportFilters
          yearMonth={yearMonth}
          onYearMonthChange={setYearMonth}
          status={status}
          onStatusChange={setStatus}
          showAuthorFilter={!isSales}
          authorId={authorId}
          onAuthorChange={setAuthorId}
          salesUsers={salesUsers}
        />
      </div>

      <ReportTable reports={filteredReports} showAuthor={!isSales} />
    </div>
  );
}
