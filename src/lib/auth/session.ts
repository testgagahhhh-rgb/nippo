/**
 * クライアントサイドの認証トークン管理。
 * document.cookie を使用して auth-token を読み書きする。
 */

const AUTH_TOKEN_KEY = "auth-token";
const TOKEN_MAX_AGE = 3600; // 1時間

/**
 * 認証トークンをcookieに保存する
 */
export function setAuthToken(token: string): void {
  document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=${TOKEN_MAX_AGE}; SameSite=Lax`;
}

/**
 * cookieから認証トークンを取得する
 */
export function getAuthToken(): string | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === AUTH_TOKEN_KEY) {
      return value ?? null;
    }
  }
  return null;
}

/**
 * cookieから認証トークンを削除する
 */
export function removeAuthToken(): void {
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
}
