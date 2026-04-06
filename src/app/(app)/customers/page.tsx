"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { customers } from "@/lib/mockData";

export default function CustomersPage() {
  const authUser = getAuthUser();
  const canEdit = authUser?.role === "manager" || authUser?.role === "admin";

  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    if (!keyword.trim()) return customers;
    const q = keyword.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.companyName.toLowerCase().includes(q),
    );
  }, [keyword]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">顧客マスタ</h1>
        {canEdit && (
          <Link
            href="/customers/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + 顧客を追加
          </Link>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="検索キーワード"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">顧客名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">会社名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">電話番号</th>
              {canEdit && (
                <th className="w-20 px-4 py-3 text-left font-medium text-gray-700">操作</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-700">{c.companyName}</td>
                <td className="px-4 py-3 text-gray-500">{c.phone ?? "—"}</td>
                {canEdit && (
                  <td className="px-4 py-3">
                    <Link
                      href={`/customers/${c.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      編集
                    </Link>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 4 : 3} className="px-4 py-8 text-center text-gray-500">
                  該当する顧客がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
