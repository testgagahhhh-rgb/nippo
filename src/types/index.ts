export type Role = "sales" | "manager" | "admin";

export type ReportStatus = "draft" | "submitted";

export interface Department {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: Department;
}

export interface ReportUser {
  id: number;
  name: string;
}

export interface Report {
  id: number;
  report_date: string;
  status: ReportStatus;
  submitted_at: string | null;
  user: ReportUser;
  has_unread_comment: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
}

export interface ReportsResponse {
  data: Report[];
  meta: PaginationMeta;
}

export interface RoleLabelMap {
  sales: string;
  manager: string;
  admin: string;
}

export const ROLE_LABELS: RoleLabelMap = {
  sales: "営業",
  manager: "上長",
  admin: "管理者",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: "下書き",
  submitted: "提出済み",
};
