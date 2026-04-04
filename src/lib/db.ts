import type { Role } from "@/src/types";
import { hashPassword } from "@/src/lib/password";

// ---- テーブル型定義 ----

export type DbUser = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  department_id: number;
};

export type DbDepartment = {
  id: number;
  name: string;
};

export type DbDailyReport = {
  id: number;
  user_id: number;
  report_date: string;
  status: "draft" | "submitted";
  problem: string;
  plan: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbVisitRecord = {
  id: number;
  report_id: number;
  customer_id: number;
  content: string;
  visited_at: string | null;
};

export type DbCustomer = {
  id: number;
  name: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
};

export type DbComment = {
  id: number;
  report_id: number;
  user_id: number;
  target_type: string;
  content: string;
  created_at: string;
};

// ---- インメモリストア ----

export type InMemoryDb = {
  users: DbUser[];
  departments: DbDepartment[];
  daily_reports: DbDailyReport[];
  visit_records: DbVisitRecord[];
  customers: DbCustomer[];
  comments: DbComment[];
  _nextIds: {
    users: number;
    daily_reports: number;
    visit_records: number;
    customers: number;
    comments: number;
  };
};

const db: InMemoryDb = {
  users: [],
  departments: [],
  daily_reports: [],
  visit_records: [],
  customers: [],
  comments: [],
  _nextIds: {
    users: 100,
    daily_reports: 1000,
    visit_records: 100,
    customers: 100,
    comments: 100,
  },
};

// ---- シードデータ投入 ----

export async function seedDb(): Promise<void> {
  db.departments = [
    { id: 1, name: "東京営業部" },
    { id: 2, name: "大阪営業部" },
  ];

  db.users = [
    {
      id: 1,
      name: "山田太郎",
      email: "yamada@example.com",
      password_hash: await hashPassword("password123"),
      role: "sales",
      department_id: 1,
    },
    {
      id: 2,
      name: "鈴木花子",
      email: "suzuki@example.com",
      password_hash: await hashPassword("password123"),
      role: "sales",
      department_id: 1,
    },
    {
      id: 3,
      name: "田中部長",
      email: "tanaka@example.com",
      password_hash: await hashPassword("password123"),
      role: "manager",
      department_id: 1,
    },
    {
      id: 4,
      name: "佐藤部長",
      email: "sato@example.com",
      password_hash: await hashPassword("password123"),
      role: "manager",
      department_id: 2,
    },
    {
      id: 5,
      name: "管理者",
      email: "admin@example.com",
      password_hash: await hashPassword("password123"),
      role: "admin",
      department_id: 1,
    },
  ];

  db.customers = [
    {
      id: 10,
      name: "顧客A",
      company_name: "株式会社ABC",
      phone: "03-1234-5678",
      email: "a@abc.co.jp",
      address: "東京都千代田区",
    },
    {
      id: 11,
      name: "顧客B",
      company_name: "有限会社XYZ",
      phone: "06-9876-5432",
      email: "b@xyz.co.jp",
      address: "大阪府大阪市",
    },
    {
      id: 12,
      name: "ABCホールディングス",
      company_name: "ABCホールディングス",
      phone: "03-0000-0000",
      email: "info@abch.co.jp",
      address: "東京都港区",
    },
  ];

  db.daily_reports = [];
  db.visit_records = [];
  db.comments = [];
  db._nextIds = {
    users: 100,
    daily_reports: 1000,
    visit_records: 100,
    customers: 100,
    comments: 100,
  };
}

export async function resetDb(): Promise<void> {
  await seedDb();
}

// ---- CRUD ヘルパー ----

export function getDb(): InMemoryDb {
  return db;
}

export function nextId(table: keyof InMemoryDb["_nextIds"]): number {
  const id = db._nextIds[table];
  db._nextIds[table] = id + 1;
  return id;
}
