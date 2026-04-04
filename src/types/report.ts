export type Role = "sales" | "manager" | "admin";

export interface Department {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  department?: Department;
}

export interface Customer {
  id: number;
  name: string;
  company_name: string;
}

export interface VisitRecord {
  id: number;
  customer: Customer;
  content: string;
  visited_at: string;
}

export interface Comment {
  id: number;
  target_type: "problem" | "plan";
  content: string;
  user: User;
  created_at: string;
}

export type ReportStatus = "draft" | "submitted";

export interface Report {
  id: number;
  report_date: string;
  status: ReportStatus;
  submitted_at: string | null;
  user: User;
  visit_records: VisitRecord[];
  problem: string;
  plan: string;
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

export interface ReportDetailResponse {
  data: Report;
}

export interface CommentCreateRequest {
  target_type: "problem" | "plan";
  content: string;
}

export interface CommentCreateResponse {
  data: Comment & { report_id: number };
}
