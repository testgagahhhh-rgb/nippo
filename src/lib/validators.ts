import type { VisitRecord } from "@/src/types";

/**
 * メールアドレスのバリデーション
 */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== "string" || email === "") {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * パスワードのバリデーション（8文字以上）
 */
export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * 訪問記録のバリデーション
 */
export function validateVisitRecords(records: VisitRecord[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (records.length === 0) {
    errors.push("訪問記録は1件以上必要です");
    return { valid: false, errors };
  }

  records.forEach((record, index) => {
    if (record.customer_id === null) {
      errors.push(`訪問記録${index + 1}: 顧客IDは必須です`);
    }

    if (record.content === "") {
      errors.push(`訪問記録${index + 1}: 内容は必須です`);
    }

    if (record.content.length > 1000) {
      errors.push(`訪問記録${index + 1}: 内容は1000文字以内で入力してください`);
    }

    if (record.visited_at !== null) {
      const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
      if (!timeRegex.test(record.visited_at)) {
        errors.push(`訪問記録${index + 1}: 訪問時刻の形式が不正です`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}
