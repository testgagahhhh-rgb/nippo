"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { reports } from "@/lib/mockData";
import { ReportForm } from "@/components/report/ReportForm";

export default function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const report = reports.find((r) => r.id === Number(id));

  if (!report) {
    notFound();
  }

  return <ReportForm report={report} />;
}
