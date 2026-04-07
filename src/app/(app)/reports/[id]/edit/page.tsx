"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { mapReportResponse } from "@/lib/api/mappers";
import { ReportForm } from "@/components/report/ReportForm";
import type { DailyReport } from "@/types";

export default function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/reports/${id}`).then((result) => {
      if (result.ok) {
        setReport(mapReportResponse(result.data));
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="py-8 text-center text-gray-500">読み込み中...</div>;
  }

  if (!report) {
    notFound();
  }

  return <ReportForm report={report} />;
}
