import { getDb } from "@/src/lib/db";
import type { DbCustomer } from "@/src/lib/db";

export type GetCustomersResult = {
  data: DbCustomer[];
  meta: { total: number; page: number; per_page: number };
};

/**
 * 顧客一覧を取得する（検索・ページネーション付き）
 */
export function getCustomers(params?: {
  q?: string;
  page?: number;
  per_page?: number;
}): GetCustomersResult {
  const db = getDb();
  const q = params?.q?.toLowerCase() ?? "";
  const page = params?.page ?? 1;
  const perPage = params?.per_page ?? 50;

  let filtered = db.customers;
  if (q) {
    filtered = filtered.filter(
      (c) => c.name.toLowerCase().includes(q) || c.company_name.toLowerCase().includes(q),
    );
  }

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const data = filtered.slice(start, start + perPage);

  return {
    data,
    meta: { total, page, per_page: perPage },
  };
}
