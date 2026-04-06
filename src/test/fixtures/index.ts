/**
 * テスト用フィクスチャデータ
 * seed.ts と同じデータ構造を、テスト内で直接参照できる形で提供する
 */

export const departments = {
  tokyo: { id: 1, name: "東京営業部" },
  osaka: { id: 2, name: "大阪営業部" },
} as const;

export const users = {
  admin: {
    id: 1,
    name: "管理者",
    email: "admin@example.com",
    role: "admin" as const,
    departmentId: departments.tokyo.id,
  },
  manager: {
    id: 2,
    name: "田中部長",
    email: "tanaka@example.com",
    role: "manager" as const,
    departmentId: departments.tokyo.id,
  },
  sales1: {
    id: 3,
    name: "山田太郎",
    email: "yamada@example.com",
    role: "sales" as const,
    departmentId: departments.tokyo.id,
  },
  sales2: {
    id: 4,
    name: "佐藤花子",
    email: "sato@example.com",
    role: "sales" as const,
    departmentId: departments.osaka.id,
  },
} as const;

export const customers = {
  abc: {
    id: 1,
    name: "山田 一郎",
    companyName: "株式会社ABC",
    phone: "03-1234-5678",
    email: "yamada@abc.co.jp",
    address: "東京都千代田区丸の内1-1-1",
  },
  def: {
    id: 2,
    name: "鈴木 次郎",
    companyName: "合同会社DEF",
    phone: "06-9876-5432",
    email: "suzuki@def.co.jp",
    address: "大阪府大阪市北区梅田2-2-2",
  },
  ghi: {
    id: 3,
    name: "高橋 三郎",
    companyName: "株式会社GHI",
    phone: "03-5555-1234",
    email: "takahashi@ghi.co.jp",
    address: "東京都新宿区西新宿3-3-3",
  },
} as const;

export const reports = {
  draft: {
    id: 1,
    userId: users.sales1.id,
    reportDate: "2026-04-01",
    status: "draft" as const,
    submittedAt: null,
    problem: "ABC社担当者が来月異動予定。後任担当者への引き継ぎ方法を要検討。",
    plan: "・ABC社フォローアップ連絡\n・提案書の修正",
  },
  submitted: {
    id: 2,
    userId: users.sales1.id,
    reportDate: "2026-03-31",
    status: "submitted" as const,
    submittedAt: "2026-03-31T18:30:00+09:00",
    problem: "GHI社の予算が厳しい状況。値引き交渉の余地を確認したい。",
    plan: "・GHI社へ見積もり再提出\n・新規顧客リストの整理",
  },
} as const;

export const visitRecords = [
  {
    id: 1,
    reportId: reports.draft.id,
    customerId: customers.abc.id,
    content: "新製品の提案を実施。先方の反応は良好。",
    visitedAt: "10:00",
  },
  {
    id: 2,
    reportId: reports.draft.id,
    customerId: customers.def.id,
    content: "契約更新の確認。来週再訪の約束。",
    visitedAt: "14:30",
  },
  {
    id: 3,
    reportId: reports.submitted.id,
    customerId: customers.ghi.id,
    content: "見積もり提出。先方は社内検討に入る予定。",
    visitedAt: "11:00",
  },
] as const;

export const comments = [
  {
    id: 1,
    reportId: reports.submitted.id,
    userId: users.manager.id,
    targetType: "problem" as const,
    content: "来週の会議で共有してください。",
  },
] as const;

/** テスト用の共通パスワード（seed.tsと同じ） */
export const TEST_PASSWORD = "password123";
