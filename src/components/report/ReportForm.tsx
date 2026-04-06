"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer, DailyReport, ReportStatus } from "@/types";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VisitRecordInput {
  id?: number;
  customerId: string;
  content: string;
  visitedAt: string;
}

interface ReportFormProps {
  report?: DailyReport;
}

export function ReportForm({ report }: ReportFormProps) {
  const router = useRouter();
  const isEdit = !!report;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [visitRecords, setVisitRecords] = useState<VisitRecordInput[]>(
    report
      ? report.visitRecords.map((vr) => ({
          id: vr.id,
          customerId: String(vr.customerId),
          content: vr.content,
          visitedAt: vr.visitedAt ?? "",
        }))
      : [{ customerId: "", content: "", visitedAt: "" }],
  );
  const [problem, setProblem] = useState(report?.problem ?? "");
  const [plan, setPlan] = useState(report?.plan ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<Customer[]>("/customers?per_page=100").then((result) => {
      if (result.ok) setCustomers(result.data);
    });
  }, []);

  const addRow = () => {
    setVisitRecords([...visitRecords, { customerId: "", content: "", visitedAt: "" }]);
  };

  const removeRow = (index: number) => {
    setVisitRecords(visitRecords.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof VisitRecordInput, value: string) => {
    setVisitRecords(visitRecords.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (visitRecords.length === 0) {
      errs.push("訪問記録を1行以上入力してください");
    }
    visitRecords.forEach((row, i) => {
      if (!row.customerId) errs.push(`訪問記録${i + 1}: 顧客を選択してください`);
      if (!row.content.trim()) errs.push(`訪問記録${i + 1}: 訪問内容を入力してください`);
    });
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = async (status: ReportStatus) => {
    if (status === "submitted" && !validate()) return;
    setSubmitting(true);

    const body = {
      report_date: report?.reportDate ?? new Date().toISOString().slice(0, 10),
      visit_records: visitRecords.map((vr) => ({
        ...(vr.id ? { id: vr.id } : {}),
        customer_id: Number(vr.customerId),
        content: vr.content,
        visited_at: vr.visitedAt || null,
      })),
      problem: problem || null,
      plan: plan || null,
    };

    if (isEdit) {
      const result = await apiFetch(`/reports/${report.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (!result.ok) {
        setErrors([result.error.message]);
        setSubmitting(false);
        return;
      }
      if (status === "submitted") {
        await apiFetch(`/reports/${report.id}/submit`, { method: "POST" });
      }
      router.push(status === "submitted" ? `/reports/${report.id}` : "/dashboard");
    } else {
      const result = await apiFetch<{ id: number }>("/reports", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!result.ok) {
        setErrors([result.error.message]);
        setSubmitting(false);
        return;
      }
      if (status === "submitted") {
        await apiFetch(`/reports/${result.data.id}/submit`, { method: "POST" });
      }
      router.push(status === "submitted" ? `/reports/${result.data.id}` : "/dashboard");
    }
  };

  const today = report ? report.reportDate : new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">
        {isEdit ? "日報編集" : "日報作成"}
        <span className="ml-4 text-base font-normal text-gray-500">{today}</span>
      </h1>

      {errors.length > 0 && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-600">
              {err}
            </p>
          ))}
        </div>
      )}

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">訪問記録</h2>
        <div className="space-y-3">
          {visitRecords.map((row, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex-1 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label>顧客名</Label>
                    <select
                      value={row.customerId}
                      onChange={(e) => updateRow(index, "customerId", e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">顧客を選択</option>
                      {customers.map((c: Customer) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.companyName} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-28">
                    <Label>訪問時刻</Label>
                    <Input
                      type="time"
                      value={row.visitedAt}
                      onChange={(e) => updateRow(index, "visitedAt", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>訪問内容</Label>
                  <textarea
                    value={row.content}
                    onChange={(e) => updateRow(index, "content", e.target.value)}
                    maxLength={1000}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="訪問内容を入力..."
                  />
                </div>
              </div>
              {visitRecords.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="mt-6 text-red-500 hover:text-red-700"
                  aria-label="行を削除"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          + 行を追加
        </button>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">今の課題・相談</h2>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          maxLength={2000}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="課題や相談事項を入力..."
        />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">明日やること</h2>
        <textarea
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          maxLength={2000}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="明日の計画を入力..."
        />
      </section>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => handleSave("draft")} disabled={submitting}>
          下書き保存
        </Button>
        <Button onClick={() => handleSave("submitted")} disabled={submitting}>
          {submitting ? "送信中..." : "提出する"}
        </Button>
      </div>
    </div>
  );
}
