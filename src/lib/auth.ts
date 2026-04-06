import type { User } from "@/src/types";

/** モック認証: 現在ログイン中のユーザーを返す */
export function getCurrentUser(): User {
  return {
    id: 1,
    name: "佐藤 管理太郎",
    email: "sato@example.com",
    role: "manager",
    department: { id: 1, name: "東京営業部" },
  };
}

/** クライアントサイド用モック認証フック */
export function useAuth(): { user: User } {
  return {
    user: getCurrentUser(),
  };
}
