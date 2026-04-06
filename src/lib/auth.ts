import type { User } from "@/src/types";

/**
 * モック認証: 現在ログイン中のユーザーを返す。
 * DB未接続時のフォールバックとして使用。
 * 将来的にはcookieのトークンからユーザー情報を取得するよう置き換える。
 */
export function getCurrentUser(): User {
  return {
    id: 1,
    name: "佐藤 管理太郎",
    email: "sato@example.com",
    role: "manager",
    department: { id: 1, name: "東京営業部" },
  };
}

/**
 * クライアントサイド用認証フック。
 * 現在はモックデータを返す。DB接続後はトークンから
 * ユーザー情報を取得するよう修正予定。
 */
export function useAuth(): { user: User } {
  return {
    user: getCurrentUser(),
  };
}
