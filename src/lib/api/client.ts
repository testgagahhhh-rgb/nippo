/**
 * APIクライアント。
 * クライアントサイド・サーバーサイド両方で動作する。
 * cookieから auth-token を取得して Authorization ヘッダーに付与する。
 * 401レスポンス時はログイン画面にリダイレクトする。
 */

const API_BASE = "/api";

function getAuthTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === "auth-token") {
      return value ?? null;
    }
  }
  return null;
}

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthTokenFromCookie();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("認証エラー: ログインが必要です");
  }

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
