import { z } from "zod";

/**
 * メールアドレスバリデーション
 */
export function validateEmail(email: unknown): boolean {
  if (email === null || email === undefined) return false;
  if (typeof email !== "string") return false;
  const result = z.string().email().safeParse(email);
  return result.success;
}

/**
 * パスワードバリデーション（8文字以上）
 */
export function validatePassword(password: unknown): boolean {
  if (typeof password !== "string") return false;
  return password.length >= 8;
}

/**
 * 訪問記録バリデーション
 */
const visitRecordSchema = z.object({
  customer_id: z.number().int().positive(),
  content: z.string().min(1, "訪問内容は必須です").max(1000, "訪問内容は1000文字以内です"),
  visited_at: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM形式で入力してください（00:00〜23:59）")
    .nullable()
    .optional(),
});

const visitRecordsSchema = z.array(visitRecordSchema).min(1, "訪問記録は1件以上必要です");

export type VisitRecordInput = z.infer<typeof visitRecordSchema>;

export function validateVisitRecords(
  records: unknown,
): { success: true; data: VisitRecordInput[] } | { success: false; error: string } {
  const result = visitRecordsSchema.safeParse(records);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues[0].message };
}
