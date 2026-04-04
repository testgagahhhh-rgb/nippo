/**
 * DateオブジェクトをYYYY-MM-DD形式の文字列に変換する
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD形式の文字列をDateオブジェクトに変換する
 * 不正な形式や存在しない日付の場合はエラーをthrowする
 */
export function parseReportDate(str: string): Date {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(str)) {
    throw new Error(`Invalid date format: ${str}`);
  }

  const [yearStr, monthStr, dayStr] = str.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}`);
  }

  const date = new Date(year, month - 1, day);

  // 存在しない日付の場合、Dateが自動補正するのでチェック
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(`Invalid date: ${str}`);
  }

  return date;
}
