import { ReportForm } from "@/src/components/report/ReportForm";
import { getCustomers } from "@/src/lib/mockData";

export const metadata = {
  title: "日報作成 | 営業日報システム",
};

export default function NewReportPage() {
  const customers = getCustomers();

  return <ReportForm mode="new" customers={customers} />;
}
