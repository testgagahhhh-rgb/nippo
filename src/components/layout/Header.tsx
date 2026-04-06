"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthUser, getRoleLabel, clearAuthUser } from "@/lib/auth";

export function Header() {
  const router = useRouter();
  const user = getAuthUser();

  const handleLogout = () => {
    clearAuthUser();
    router.push("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-bold text-gray-900">
            営業日報システム
          </Link>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              日報一覧
            </Link>
            <Link href="/customers" className="text-sm text-gray-600 hover:text-gray-900">
              顧客マスタ
            </Link>
            {user?.role === "admin" && (
              <Link href="/users" className="text-sm text-gray-600 hover:text-gray-900">
                ユーザーマスタ
              </Link>
            )}
          </nav>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name}（{getRoleLabel(user.role)}）
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
