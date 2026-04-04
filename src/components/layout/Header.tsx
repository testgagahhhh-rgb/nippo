"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { User } from "@/src/types";
import { ROLE_LABELS } from "@/src/types";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Proceed to redirect even if the API call fails
    }
    router.push("/login");
  }, [router]);

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <h1 className="text-lg font-bold text-gray-900">営業日報システム</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">
            {user.name}({ROLE_LABELS[user.role]})
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
