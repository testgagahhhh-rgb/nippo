import type { Customer, PaginationMeta, Report, ReportUser } from "@/src/types";

const customers: Customer[] = [
  {
    id: 1,
    name: "山田 一郎",
    company_name: "株式会社ABC",
    phone: "03-1234-5678",
    email: "yamada@abc.co.jp",
    address: "東京都千代田区丸の内1-1-1",
    created_at: "2026-01-15T09:00:00+09:00",
  },
  {
    id: 2,
    name: "鈴木 次郎",
    company_name: "有限会社XYZ",
    phone: "06-9876-5432",
    email: "suzuki@xyz.co.jp",
    address: "大阪府大阪市北区梅田2-2-2",
    created_at: "2026-01-20T10:30:00+09:00",
  },
  {
    id: 3,
    name: "佐藤 三郎",
    company_name: "株式会社テクノ",
    phone: "052-111-2222",
    email: "sato@techno.co.jp",
    address: "愛知県名古屋市中区栄3-3-3",
    created_at: "2026-02-01T11:00:00+09:00",
  },
  {
    id: 4,
    name: "田中 花子",
    company_name: "合同会社グリーン",
    phone: "011-333-4444",
    email: "tanaka@green.co.jp",
    address: "北海道札幌市中央区北1条4-4-4",
    created_at: "2026-02-10T13:00:00+09:00",
  },
  {
    id: 5,
    name: "高橋 五郎",
    company_name: "株式会社マリン",
    phone: "092-555-6666",
    email: "takahashi@marine.co.jp",
    address: "福岡県福岡市博多区5-5-5",
    created_at: "2026-02-15T14:00:00+09:00",
  },
  {
    id: 6,
    name: "伊藤 六助",
    company_name: "有限会社サンライズ",
    phone: "022-777-8888",
    email: "ito@sunrise.co.jp",
    address: "宮城県仙台市青葉区6-6-6",
    created_at: "2026-03-01T09:30:00+09:00",
  },
  {
    id: 7,
    name: "渡辺 七美",
    company_name: "株式会社フューチャー",
    phone: "045-999-0000",
    email: "watanabe@future.co.jp",
    address: "神奈川県横浜市西区7-7-7",
    created_at: "2026-03-05T10:00:00+09:00",
  },
  {
    id: 8,
    name: "中村 八郎",
    company_name: "合同会社ウインド",
    phone: "075-222-3333",
    email: "nakamura@wind.co.jp",
    address: "京都府京都市中京区8-8-8",
    created_at: "2026-03-10T11:30:00+09:00",
  },
  {
    id: 9,
    name: "小林 九太",
    company_name: "株式会社スカイ",
    phone: "048-444-5555",
    email: "kobayashi@sky.co.jp",
    address: "埼玉県さいたま市大宮区9-9-9",
    created_at: "2026-03-15T08:00:00+09:00",
  },
  {
    id: 10,
    name: "加藤 十蔵",
    company_name: "有限会社リバー",
    phone: "082-666-7777",
    email: "kato@river.co.jp",
    address: "広島県広島市中区10-10-10",
    created_at: "2026-03-20T15:00:00+09:00",
  },
];

const PER_PAGE = 50;

export function getCustomers(params?: { q?: string; page?: number }): {
  data: Customer[];
  meta: PaginationMeta;
} {
  const q = params?.q?.toLowerCase() ?? "";
  const page = params?.page ?? 1;

  const filtered = q
    ? customers.filter(
        (c) => c.name.toLowerCase().includes(q) || c.company_name.toLowerCase().includes(q),
      )
    : customers;

  const start = (page - 1) * PER_PAGE;
  const paginated = filtered.slice(start, start + PER_PAGE);

  return {
    data: paginated,
    meta: {
      total: filtered.length,
      page,
      per_page: PER_PAGE,
    },
  };
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((c) => c.id === Number(id));
}

// ---------------------------------------------------------------------------
// Mock Reports
// ---------------------------------------------------------------------------

const mockReports: Report[] = [
  {
    id: 1,
    report_date: "2026-04-01",
    status: "submitted",
    user: { id: 1, name: "佐藤 管理太郎" },
    has_unread_comment: false,
  },
  {
    id: 2,
    report_date: "2026-04-02",
    status: "draft",
    user: { id: 2, name: "田中 営業一郎" },
    has_unread_comment: false,
  },
  {
    id: 3,
    report_date: "2026-04-03",
    status: "submitted",
    user: { id: 2, name: "田中 営業一郎" },
    has_unread_comment: true,
  },
];

export function getReports(params?: {
  page?: number;
  per_page?: number;
  year_month?: string;
  user_id?: number;
  status?: string;
}): { data: Report[]; meta: PaginationMeta } {
  const page = params?.page ?? 1;
  const perPage = params?.per_page ?? 20;

  let filtered = mockReports;

  if (params?.year_month) {
    filtered = filtered.filter((r) => r.report_date.startsWith(params.year_month!));
  }
  if (params?.user_id !== undefined) {
    filtered = filtered.filter((r) => r.user.id === params.user_id);
  }
  if (params?.status) {
    filtered = filtered.filter((r) => r.status === params.status);
  }

  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  return {
    data: paginated,
    meta: { total: filtered.length, page, per_page: perPage },
  };
}

export function getFilterUsers(): ReportUser[] {
  return [
    { id: 1, name: "佐藤 管理太郎" },
    { id: 2, name: "田中 営業一郎" },
  ];
}

type MockReportDetail = {
  id: number;
  report_date: string;
  status: string;
  visit_records: {
    id: number;
    customer: { id: number; name: string; company_name: string };
    content: string;
    visited_at: string | null;
  }[];
  problem: string;
  plan: string;
};

const mockReportDetails: MockReportDetail[] = [
  {
    id: 1,
    report_date: "2026-04-01",
    status: "submitted",
    visit_records: [
      {
        id: 1,
        customer: { id: 1, name: "山田 一郎", company_name: "株式会社ABC" },
        content: "新製品の提案",
        visited_at: "10:00",
      },
    ],
    problem: "競合他社の価格が下がっている",
    plan: "新しい価格表を作成する",
  },
];

export function getReportById(id: string): MockReportDetail | undefined {
  return mockReportDetails.find((r) => r.id === Number(id));
}
