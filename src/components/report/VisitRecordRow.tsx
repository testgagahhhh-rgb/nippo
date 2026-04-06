"use client";

import type { Customer, VisitRecord } from "@/src/types";

type VisitRecordRowProps = {
  index: number;
  record: VisitRecord;
  customers: Customer[];
  onChange: (index: number, field: keyof VisitRecord, value: string | number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  error?: { customer_id?: string; content?: string };
};

export function VisitRecordRow({
  index,
  record,
  customers,
  onChange,
  onRemove,
  canRemove,
  error,
}: VisitRecordRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Customer select */}
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`customer-${index}`} className="text-sm font-medium text-gray-700">
            顧客名
          </label>
          <select
            id={`customer-${index}`}
            value={record.customer_id}
            onChange={(e) => {
              const val = e.target.value;
              onChange(index, "customer_id", val === "" ? "" : Number(val));
            }}
            className={`rounded-md border px-3 py-2 text-sm ${
              error?.customer_id ? "border-red-500" : "border-gray-300"
            } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
          >
            <option value="">顧客を選択</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name} - {c.name}
              </option>
            ))}
          </select>
          {error?.customer_id && (
            <p className="text-sm text-red-600" role="alert">
              {error.customer_id}
            </p>
          )}
        </div>

        {/* Content textarea */}
        <div className="flex flex-[2] flex-col gap-1">
          <label htmlFor={`content-${index}`} className="text-sm font-medium text-gray-700">
            訪問内容
          </label>
          <textarea
            id={`content-${index}`}
            value={record.content}
            onChange={(e) => onChange(index, "content", e.target.value)}
            maxLength={1000}
            rows={2}
            className={`rounded-md border px-3 py-2 text-sm ${
              error?.content ? "border-red-500" : "border-gray-300"
            } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
            placeholder="訪問内容を入力"
          />
          {error?.content && (
            <p className="text-sm text-red-600" role="alert">
              {error.content}
            </p>
          )}
        </div>

        {/* Time input */}
        <div className="flex flex-col gap-1">
          <label htmlFor={`time-${index}`} className="text-sm font-medium text-gray-700">
            訪問時刻
          </label>
          <input
            id={`time-${index}`}
            type="time"
            value={record.visited_at}
            onChange={(e) => onChange(index, "visited_at", e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Remove button */}
        <div className="flex flex-col justify-end">
          <span className="text-sm font-medium text-transparent sm:block">削除</span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            aria-label={`訪問記録 ${index + 1} を削除`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}
