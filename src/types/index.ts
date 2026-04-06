/** ロール定義 */
export type Role = "sales" | "manager" | "admin";

/** ユーザー */
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  departmentId: number;
  department: Department;
}

/** 部署 */
export interface Department {
  id: number;
  name: string;
}

/** 顧客 */
export interface Customer {
  id: number;
  name: string;
  companyName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

/** 訪問記録 */
export interface VisitRecord {
  id: number;
  reportId: number;
  customerId: number;
  content: string;
  visitedAt: string | null;
  customer: Customer;
}

/** 日報ステータス */
export type ReportStatus = "draft" | "submitted";

/** 日報 */
export interface DailyReport {
  id: number;
  userId: number;
  reportDate: string;
  status: ReportStatus;
  submittedAt: string | null;
  problem: string | null;
  plan: string | null;
  user: User;
  visitRecords: VisitRecord[];
  comments: ManagerComment[];
}

/** コメント対象 */
export type CommentTargetType = "problem" | "plan";

/** 上長コメント */
export interface ManagerComment {
  id: number;
  reportId: number;
  userId: number;
  targetType: CommentTargetType;
  content: string;
  createdAt: string;
  user: User;
}

/** 認証ユーザー（ログイン中のユーザー情報） */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  departmentId: number;
}
