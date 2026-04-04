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
};

export type VisitRecord = {
  id?: number;
  customer_id: number | "";
  content: string;
  visited_at: string;
};

export type ReportFormData = {
  report_date: string;
  visit_records: VisitRecord[];
  problem: string;
  plan: string;
};

export type Report = {
  id: number;
  report_date: string;
  status: "draft" | "submitted";
  submitted_at: string | null;
  user: { id: number; name: string };
  visit_records: Array<{
    id: number;
    customer: Customer;
    content: string;
    visited_at: string;
  }>;
  problem: string;
  plan: string;
  has_unread_comment: boolean;
  created_at: string;
  updated_at: string;
};
