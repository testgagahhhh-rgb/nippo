"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api/client";
import { ReportTable } from "@/components/dashboard/ReportTable";
import { ReportFilters } from "@/components/dashboard/ReportFilters";
import type { DailyReport, User } from "@/types";

export default function DashboardPage() {
  const authUser = getAuthUser();
  const isSales = authUser?.role === "sales";

  const [reports, setReports] = useState<DailyReport[]>([]);
  const [salesUsers, setSalesUsers] = useState<User[]>([]);
  const [yearMonth, setYearMonth] = useState("");
  const [status, setStatus] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    const params = new URLSearchParams();
    if (yearMonth) params.set("year_month", yearMonth);
    if (status) params.set("status", status);
    if (authorId) params.set("user_id", authorId);
    params.set("per_page", "100");

    const result = await apiFetch<DailyReport[]>(`/reports?${params}`);
    if (result.ok) {
      setReports(result.data);
    }
    setLoading(false);
  }, [yearMonth, status, authorId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (!isSales) {
      apiFetch<User[]>("/users?per_page=100").then((result) => {
        if (result.ok) {
          setSalesUsers(result.data.filter((u) => u.role === "sales"));
        }
      });
    }
  }, [isSales]);

  const sortedReports = useMemo(() => {
    if (authUser?.role !== "manager") return reports;
    return [...reports].sort((a, b) => {
      const aUncommented = a.status === "submitted" && a.comments.length === 0 ? 0 : 1;
      const bUncommented = b.status === "submitted" && b.comments.length === 0 ? 0 : 1;
      return aUncommented - bUncommented;
    });
  }, [reports, authUser?.role]);

  if (loading) {
    return <div className="py-8 text-center text-gray-500">読み込み中...</div>;
  }

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

      <ReportTable reports={sortedReports} showAuthor={!isSales} />
    </div>
  );
}
