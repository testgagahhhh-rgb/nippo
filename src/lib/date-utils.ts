/**
 * YYYY-MM-DD 形式の文字列を Date オブジェクトに変換する。
 * 形式が不正または存在しない日付の場合はエラーを投げる。
 */
export function parseReportDate(str: string): Date {
  // 形式チェック: YYYY-MM-DD のみ許可
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!match) {
    throw new Error(`不正な日付形式です: ${str}（YYYY-MM-DD形式で入力してください）`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // 月の範囲チェック
  if (month < 1 || month > 12) {
    throw new Error(`不正な月です: ${month}`);
  }

  // Date コンストラクタで生成し、ラウンドトリップチェックで存在する日付か検証
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(`存在しない日付です: ${str}`);
  }

  return date;
}

/**
 * Date オブジェクトを YYYY-MM-DD 形式の文字列に変換する。
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
