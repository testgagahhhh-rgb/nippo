import { notFound } from "next/navigation";
import { ReportForm } from "@/src/components/report/ReportForm";
import { getCustomers, getReportById } from "@/src/lib/mockData";
import type { ReportFormData } from "@/src/types";

export const metadata = {
  title: "日報編集 | 営業日報システム",
};

type EditReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditReportPage({ params }: EditReportPageProps) {
  const { id } = await params;
  const report = getReportById(id);

  if (!report) {
    notFound();
  }

  const { data: customers } = getCustomers();

  const initialData: ReportFormData = {
    report_date: report.report_date,
    visit_records: report.visit_records.map(
      (vr: { customer: { id: number }; content: string; visited_at: string | null }) => ({
        customer_id: vr.customer.id,
        content: vr.content,
        visited_at: vr.visited_at,
      }),
    ),
    problem: report.problem,
    plan: report.plan,
  };

  return <ReportForm mode="edit" customers={customers} initialData={initialData} reportId={id} />;
}
