import type { AuthUser } from "@/types";

const AUTH_STORAGE_KEY = "nippo_auth_user";

/** ログイン中のユーザーを取得（クライアントサイド） */
export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

/** ユーザー情報を保存 */
export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

/** ログアウト */
export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/** ロールの日本語表示 */
export function getRoleLabel(role: string): string {
  switch (role) {
    case "sales":
      return "営業";
    case "manager":
      return "上長";
    case "admin":
      return "管理者";
    default:
      return role;
  }
}
