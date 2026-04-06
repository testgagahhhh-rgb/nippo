"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer, ReportFormData, VisitRecord } from "@/src/types";
import { VisitRecordRow } from "@/src/components/report/VisitRecordRow";

type ReportFormProps = {
  mode: "new" | "edit";
  customers: Customer[];
  initialData?: ReportFormData;
  reportId?: string;
};

function createEmptyVisitRecord(): VisitRecord {
  return { customer_id: "", content: "", visited_at: "" };
}

function formatToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type FieldErrors = Record<string, string>;
type VisitRecordErrors = Record<number, { customer_id?: string; content?: string }>;

export function ReportForm({ mode, customers, initialData, reportId }: ReportFormProps) {
  const router = useRouter();

  const [reportDate, setReportDate] = useState(initialData?.report_date ?? formatToday());
  const [visitRecords, setVisitRecords] = useState<VisitRecord[]>(
    initialData?.visit_records ?? [createEmptyVisitRecord()],
  );
  const [problem, setProblem] = useState(initialData?.problem ?? "");
  const [plan, setPlan] = useState(initialData?.plan ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [visitErrors, setVisitErrors] = useState<VisitRecordErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVisitChange = useCallback(
    (index: number, field: keyof VisitRecord, value: string | number) => {
      setVisitRecords((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    },
    [],
  );

  const handleAddRow = useCallback(() => {
    setVisitRecords((prev) => [...prev, createEmptyVisitRecord()]);
  }, []);

  const handleRemoveRow = useCallback((index: number) => {
    setVisitRecords((prev) => prev.filter((_, i) => i !== index));
  }, []);

  function validate(): boolean {
    const newErrors: FieldErrors = {};
    const newVisitErrors: VisitRecordErrors = {};
    let valid = true;

    if (visitRecords.length === 0) {
      newErrors.visitRecords = "訪問記録を1件以上入力してください。";
      valid = false;
    }

    visitRecords.forEach((record, i) => {
      const recErr: { customer_id?: string; content?: string } = {};
      if (record.customer_id === "") {
        recErr.customer_id = "顧客を選択してください。";
        valid = false;
      }
      if (record.content.trim() === "") {
        recErr.content = "訪問内容を入力してください。";
        valid = false;
      }
      if (recErr.customer_id || recErr.content) {
        newVisitErrors[i] = recErr;
      }
    });

    if (problem.length > 2000) {
      newErrors.problem = "2000文字以内で入力してください。";
      valid = false;
    }
    if (plan.length > 2000) {
      newErrors.plan = "2000文字以内で入力してください。";
      valid = false;
    }

    setErrors(newErrors);
    setVisitErrors(newVisitErrors);
    return valid;
  }

  function buildPayload(status: "draft" | "submitted"): ReportFormData & { status: string } {
    return {
      report_date: reportDate,
      visit_records: visitRecords,
      problem,
      plan,
      status,
    };
  }

  async function handleDraft() {
    setIsSubmitting(true);
    try {
      const payload = buildPayload("draft");
      // eslint-disable-next-line no-console
      console.log(
        mode === "edit" ? `PUT /api/v1/reports/${reportId}` : "POST /api/v1/reports",
        payload,
      );
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit() {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = buildPayload("submitted");
      const mockId = reportId ?? "new-1";
      // eslint-disable-next-line no-console
      console.log(
        mode === "edit" ? `PUT /api/v1/reports/${reportId}` : "POST /api/v1/reports",
        payload,
      );
      router.push(`/reports/${mockId}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = mode === "new" ? "日報作成" : "日報編集";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      noValidate
      aria-label={title}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="report-date" className="text-sm font-medium text-gray-700">
            日付
          </label>
          <input
            id="report-date"
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Visit Records Section */}
      <section className="mb-6" aria-labelledby="visit-records-heading">
        <h3 id="visit-records-heading" className="mb-3 text-base font-semibold text-gray-800">
          訪問記録
        </h3>
        {errors.visitRecords && (
          <p className="mb-2 text-sm text-red-600" role="alert">
            {errors.visitRecords}
          </p>
        )}
        <div className="flex flex-col gap-3">
          {visitRecords.map((record, index) => (
            <VisitRecordRow
              key={record.id ?? index}
              index={index}
              record={record}
              customers={customers}
              onChange={handleVisitChange}
              onRemove={handleRemoveRow}
              canRemove={visitRecords.length > 1}
              error={visitErrors[index]}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddRow}
          className="mt-3 rounded-md border border-dashed border-gray-400 px-4 py-2 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600"
        >
          + 行を追加
        </button>
      </section>

      {/* Problem Section */}
      <section className="mb-6">
        <label htmlFor="problem" className="mb-1 block text-base font-semibold text-gray-800">
          今の課題・相談
        </label>
        <textarea
          id="problem"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          maxLength={2000}
          rows={4}
          className={`w-full rounded-md border px-3 py-2 text-sm ${
            errors.problem ? "border-red-500" : "border-gray-300"
          } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
          placeholder="課題や相談事項を入力"
        />
        {errors.problem && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.problem}
          </p>
        )}
      </section>

      {/* Plan Section */}
      <section className="mb-6">
        <label htmlFor="plan" className="mb-1 block text-base font-semibold text-gray-800">
          明日やること
        </label>
        <textarea
          id="plan"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          maxLength={2000}
          rows={4}
          className={`w-full rounded-md border px-3 py-2 text-sm ${
            errors.plan ? "border-red-500" : "border-gray-300"
          } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
          placeholder="明日の予定・やることを入力"
        />
        {errors.plan && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.plan}
          </p>
        )}
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => void handleDraft()}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          下書き保存
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          提出する
        </button>
      </div>
    </form>
  );
}
