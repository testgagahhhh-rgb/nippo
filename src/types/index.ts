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
