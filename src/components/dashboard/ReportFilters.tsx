"use client";

import type { User } from "@/types";

interface ReportFiltersProps {
  yearMonth: string;
  onYearMonthChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  showAuthorFilter: boolean;
  authorId: string;
  onAuthorChange: (value: string) => void;
  salesUsers: User[];
}

export function ReportFilters({
  yearMonth,
  onYearMonthChange,
  status,
  onStatusChange,
  showAuthorFilter,
  authorId,
  onAuthorChange,
  salesUsers,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm text-gray-600">絞り込み:</label>
      <input
        type="month"
        value={yearMonth}
        onChange={(e) => onYearMonthChange(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
      />
      {showAuthorFilter && (
        <select
          value={authorId}
          onChange={(e) => onAuthorChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">全営業担当</option>
          {salesUsers.map((u) => (
            <option key={u.id} value={String(u.id)}>
              {u.name}
            </option>
          ))}
        </select>
      )}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
      >
        <option value="">全ステータス</option>
        <option value="draft">下書き</option>
        <option value="submitted">提出済み</option>
      </select>
    </div>
  );
}
