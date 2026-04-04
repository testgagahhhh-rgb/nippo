/**
 * APIレスポンスのステータスコードに応じた処理
 * 401の場合はログインページにリダイレクトする
 */
export function handleApiResponse(status: number): void {
  if (status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}
