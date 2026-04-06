import type { AuthUser, Customer, DailyReport, Department, User } from "@/types";

// --- 部署 ---
export const departments: Department[] = [
  { id: 1, name: "営業1課" },
  { id: 2, name: "営業2課" },
];

// --- ユーザー ---
export const users: User[] = [
  {
    id: 1,
    name: "山田太郎",
    email: "yamada@example.com",
    role: "sales",
    departmentId: 1,
    department: departments[0],
  },
  {
    id: 2,
    name: "鈴木花子",
    email: "suzuki@example.com",
    role: "sales",
    departmentId: 1,
    department: departments[0],
  },
  {
    id: 3,
    name: "田中部長",
    email: "tanaka@example.com",
    role: "manager",
    departmentId: 1,
    department: departments[0],
  },
  {
    id: 4,
    name: "佐藤管理者",
    email: "sato@example.com",
    role: "admin",
    departmentId: 2,
    department: departments[1],
  },
];

// --- 顧客 ---
export const customers: Customer[] = [
  {
    id: 1,
    name: "山田 一郎",
    companyName: "株式会社ABC",
    phone: "03-1234-5678",
    email: "ichiro@abc.co.jp",
    address: "東京都千代田区1-1-1",
  },
  {
    id: 2,
    name: "鈴木 次郎",
    companyName: "有限会社XYZ",
    phone: "06-9876-5432",
    email: "jiro@xyz.co.jp",
    address: "大阪府大阪市2-2-2",
  },
  {
    id: 3,
    name: "佐藤 三郎",
    companyName: "株式会社DEF",
    phone: "052-111-2222",
    email: null,
    address: null,
  },
];

// --- 日報 ---
export const reports: DailyReport[] = [
  {
    id: 1,
    userId: 1,
    reportDate: "2026-04-01",
    status: "submitted",
    submittedAt: "2026-04-01T18:00:00",
    problem: "ABC社の担当者が来月異動予定。引き継ぎ先の確認が必要。",
    plan: "・ABC社へのフォローアップ連絡\n・提案書の修正",
    user: users[0],
    visitRecords: [
      {
        id: 1,
        reportId: 1,
        customerId: 1,
        content: "新製品の提案を実施。先方の反応は良好で、来週見積もりを提出予定。",
        visitedAt: "10:00",
        customer: customers[0],
      },
      {
        id: 2,
        reportId: 1,
        customerId: 2,
        content: "契約更新の確認。来週中に最終回答をもらえる見込み。",
        visitedAt: "14:30",
        customer: customers[1],
      },
    ],
    comments: [
      {
        id: 1,
        reportId: 1,
        userId: 3,
        targetType: "problem",
        content: "来週の会議で共有してください。",
        createdAt: "2026-04-01T18:30:00",
        user: users[2],
      },
    ],
  },
  {
    id: 2,
    userId: 1,
    reportDate: "2026-03-31",
    status: "submitted",
    submittedAt: "2026-03-31T17:30:00",
    problem: null,
    plan: "・DEF社への初回訪問準備",
    user: users[0],
    visitRecords: [
      {
        id: 3,
        reportId: 2,
        customerId: 3,
        content: "市場調査のヒアリング。業界動向について有益な情報を入手。",
        visitedAt: "11:00",
        customer: customers[2],
      },
    ],
    comments: [
      {
        id: 2,
        reportId: 2,
        userId: 3,
        targetType: "plan",
        content: "初回訪問の資料を事前に確認させてください。",
        createdAt: "2026-03-31T18:00:00",
        user: users[2],
      },
    ],
  },
  {
    id: 3,
    userId: 2,
    reportDate: "2026-04-01",
    status: "draft",
    submittedAt: null,
    problem: null,
    plan: null,
    user: users[1],
    visitRecords: [
      {
        id: 4,
        reportId: 3,
        customerId: 1,
        content: "既存顧客のフォロー訪問。",
        visitedAt: "09:30",
        customer: customers[0],
      },
    ],
    comments: [],
  },
  {
    id: 4,
    userId: 2,
    reportDate: "2026-03-28",
    status: "submitted",
    submittedAt: "2026-03-28T18:00:00",
    problem: "XYZ社の予算承認が遅れている。",
    plan: "・予算承認の進捗確認\n・代替プランの準備",
    user: users[1],
    visitRecords: [
      {
        id: 5,
        reportId: 4,
        customerId: 2,
        content: "予算の進捗確認。来月まで延期の可能性あり。",
        visitedAt: "13:00",
        customer: customers[1],
      },
    ],
    comments: [],
  },
];

// --- 認証用モックユーザー ---
export const mockAuthUsers: Record<string, { password: string; user: AuthUser }> = {
  "yamada@example.com": {
    password: "password123",
    user: { id: 1, name: "山田太郎", email: "yamada@example.com", role: "sales", departmentId: 1 },
  },
  "tanaka@example.com": {
    password: "password123",
    user: {
      id: 3,
      name: "田中部長",
      email: "tanaka@example.com",
      role: "manager",
      departmentId: 1,
    },
  },
  "sato@example.com": {
    password: "password123",
    user: { id: 4, name: "佐藤管理者", email: "sato@example.com", role: "admin", departmentId: 2 },
  },
};
