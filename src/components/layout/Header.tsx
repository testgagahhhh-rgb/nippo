import Link from "next/link";
import type { User } from "@/src/types";

type HeaderProps = {
  user: User;
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold text-gray-900">営業日報システム</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/customers"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              顧客管理
            </Link>
            {user.role === "admin" && (
              <Link href="/users" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                ユーザー管理
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user.department.name} / {user.name}
          </span>
          <button
            type="button"
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
