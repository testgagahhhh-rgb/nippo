export type Role = "sales" | "manager" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: { id: number; name: string };
};

export type Customer = {
  id: number;
  name: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
};

export type CustomerFormData = {
  name: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  per_page: number;
};

export type VisitRecord = {
  customer_id: number | null;
  content: string;
  visited_at: string | null;
};

export type ReportStatus = "draft" | "submitted";

export type Report = {
  id: number;
  report_date: string;
  status: ReportStatus;
  user: { id: number; name: string };
  has_unread_comment: boolean;
};

export type ReportFormData = {
  report_date: string;
  visit_records: VisitRecord[];
  problem: string;
  plan: string;
};

export type ReportUser = {
  id: number;
  name: string;
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: "下書き",
  submitted: "提出済み",
};
