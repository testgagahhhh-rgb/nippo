"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Role, ReportUser } from "@/src/types";

interface FilterBarProps {
  role: Role;
  users: ReportUser[];
}

export function FilterBar({ role, users }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentYearMonth = searchParams.get("year_month") ?? "";
  const currentUserId = searchParams.get("user_id") ?? "";
  const currentStatus = searchParams.get("status") ?? "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change
      params.delete("page");
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams],
  );

  const showUserFilter = role === "manager" || role === "admin";

  // Generate year-month options (past 12 months)
  const yearMonthOptions = generateYearMonthOptions();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <span className="text-sm font-medium text-gray-700">絞り込み:</span>

      <select
        aria-label="年月"
        value={currentYearMonth}
        onChange={(e) => updateFilter("year_month", e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">全期間</option>
        {yearMonthOptions.map((ym) => (
          <option key={ym.value} value={ym.value}>
            {ym.label}
          </option>
        ))}
      </select>

      {showUserFilter && (
        <select
          aria-label="営業担当"
          value={currentUserId}
          onChange={(e) => updateFilter("user_id", e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">全担当者</option>
          {users.map((user) => (
            <option key={user.id} value={String(user.id)}>
              {user.name}
            </option>
          ))}
        </select>
      )}

      <select
        aria-label="ステータス"
        value={currentStatus}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">全ステータス</option>
        <option value="draft">下書き</option>
        <option value="submitted">提出済み</option>
      </select>
    </div>
  );
}

function generateYearMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    options.push({
      value: `${year}-${month}`,
      label: `${year}年${date.getMonth() + 1}月`,
    });
  }

  return options;
}
