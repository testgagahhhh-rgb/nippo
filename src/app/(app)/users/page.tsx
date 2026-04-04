import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth";
import { getUsers } from "@/src/lib/mockData";

const ROLE_LABELS: Record<string, string> = {
  sales: "営業",
  manager: "上長",
  admin: "管理者",
};

export default function UsersPage() {
  const user = getCurrentUser();

  if (user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">アクセス権限がありません</h2>
        <p className="mt-2 text-sm text-gray-600">このページは管理者のみアクセスできます。</p>
      </div>
    );
  }

  const users = getUsers();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ユーザーマスタ</h2>
        <Link
          href="/users/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          + ユーザーを追加
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                氏名
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                メールアドレス
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                ロール
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                部署
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  ユーザーが見つかりませんでした
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                    {u.name}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {ROLE_LABELS[u.role] ?? u.role}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {u.department.name}
                  </td>
                  <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                    <Link
                      href={`/users/${u.id}/edit`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
