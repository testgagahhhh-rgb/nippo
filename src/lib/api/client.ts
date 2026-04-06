const TOKEN_KEY = "nippo_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

type ApiError = {
  error: { code: string; message: string; details?: { field: string; message: string }[] };
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError["error"] };

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, { ...options, headers });

  const json = await res.json();

  if (!res.ok) {
    return { ok: false, error: json.error ?? { code: "UNKNOWN", message: "エラーが発生しました" } };
  }

  return { ok: true, data: json.data as T };
}
