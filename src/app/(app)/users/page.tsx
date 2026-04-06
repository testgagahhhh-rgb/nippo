"use client";

import Link from "next/link";
import { users } from "@/lib/mockData";
import { getRoleLabel } from "@/lib/auth";

export default function UsersPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ユーザーマスタ</h1>
        <Link
          href="/users/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + ユーザーを追加
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">氏名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">メールアドレス</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">ロール</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">部署</th>
              <th className="w-20 px-4 py-3 text-left font-medium text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-700">{u.email}</td>
                <td className="px-4 py-3 text-gray-700">{getRoleLabel(u.role)}</td>
                <td className="px-4 py-3 text-gray-700">{u.department.name}</td>
                <td className="px-4 py-3">
                  <Link href={`/users/${u.id}/edit`} className="text-blue-600 hover:underline">
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
