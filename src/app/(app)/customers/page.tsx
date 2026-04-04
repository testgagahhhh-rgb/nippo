import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth";
import { getCustomers } from "@/src/lib/mockData";
import { CustomerSearchBar } from "./CustomerSearchBar";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function CustomersPage({ searchParams }: PageProps) {
  const { q, page: pageStr } = await searchParams;
  const user = getCurrentUser();
  const canEdit = user.role === "manager" || user.role === "admin";

  const page = pageStr ? Number(pageStr) : 1;
  const { data: customers, meta } = getCustomers({ q, page });

  const totalPages = Math.ceil(meta.total / meta.per_page);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">顧客マスタ</h2>
        {canEdit && (
          <Link
            href="/customers/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            + 顧客を追加
          </Link>
        )}
      </div>

      <Suspense fallback={<div className="h-10" />}>
        <CustomerSearchBar defaultValue={q} />
      </Suspense>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                顧客名
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                会社名
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                電話番号
              </th>
              {canEdit && (
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {customers.length === 0 ? (
              <tr>
                <td
                  colSpan={canEdit ? 4 : 3}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  顧客が見つかりませんでした
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {customer.company_name}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {customer.phone}
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                      <Link
                        href={`/customers/${customer.id}/edit`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        編集
                      </Link>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="ページネーション" className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            全 {meta.total} 件中 {(page - 1) * meta.per_page + 1} -{" "}
            {Math.min(page * meta.per_page, meta.total)} 件を表示
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={{
                  pathname: "/customers",
                  query: { ...(q ? { q } : {}), page: String(page - 1) },
                }}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                前へ
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={{
                  pathname: "/customers",
                  query: { ...(q ? { q } : {}), page: String(page + 1) },
                }}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                次へ
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
