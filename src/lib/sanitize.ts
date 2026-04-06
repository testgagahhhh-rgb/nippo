/**
 * XSS対策のサニタイズ関数
 *
 * HTMLの特殊文字をエスケープして、スクリプトインジェクションを防ぐ。
 * ユーザー入力をHTMLに埋め込む前に使用する。
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

const HTML_ESCAPE_REGEX = /[&<>"'`/]/g;

/**
 * 文字列のHTML特殊文字をエスケープする
 */
export function escapeHtml(input: string): string {
  return input.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

/**
 * オブジェクトの全文字列プロパティを再帰的にサニタイズする
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === "string") {
    return escapeHtml(obj) as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T;
  }
  if (obj !== null && typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized as T;
  }
  return obj;
}

/**
 * scriptタグやイベントハンドラなどの危険なパターンを除去する
 */
export function stripDangerousPatterns(input: string): string {
  let result = input;
  // scriptタグの除去
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // イベントハンドラ属性の除去
  result = result.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");
  // javascript: プロトコルの除去
  result = result.replace(/javascript\s*:/gi, "");
  return result;
}
