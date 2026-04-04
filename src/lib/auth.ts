import type { User } from "@/src/types";

/** モック認証: 現在ログイン中のユーザーを返す */
export function getCurrentUser(): User {
  return {
    id: 1,
    name: "佐藤 管理太郎",
    email: "sato@example.com",
    role: "admin",
    department: { id: 1, name: "東京営業部" },
  };
}
