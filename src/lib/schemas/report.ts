import { z } from "zod";

// HH:MM 形式（00:00〜23:59）の時刻バリデーション
const visitedAtSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "visited_at は HH:MM 形式で指定してください")
  .refine((val) => {
    const [hh, mm] = val.split(":").map(Number);
    return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
  }, "visited_at の時刻が不正です（00:00〜23:59）")
  .optional();

export const visitRecordSchema = z.object({
  customer_id: z.number("customer_id は必須です").int().positive(),
  content: z
    .string("content は必須です")
    .min(1, "content は1文字以上必要です")
    .max(1000, "content は1000文字以内で入力してください"),
  visited_at: visitedAtSchema,
});

export const createReportSchema = z.object({
  report_date: z
    .string("report_date は必須です")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "report_date は YYYY-MM-DD 形式で指定してください")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && val === date.toISOString().slice(0, 10);
    }, "report_date が不正な日付です"),
  visit_records: z.array(visitRecordSchema).min(1, "visit_records は1件以上必要です"),
  problem: z.string().max(2000, "problem は2000文字以内で入力してください").optional(),
  plan: z.string().max(2000, "plan は2000文字以内で入力してください").optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type VisitRecordInput = z.infer<typeof visitRecordSchema>;

// ---------------------------------------------------------------------------
// GET /reports クエリパラメータスキーマ
// ---------------------------------------------------------------------------

export const listReportsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1, "page は1以上の整数を指定してください")),
  per_page: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : 20))
    .pipe(
      z
        .number()
        .int()
        .min(1, "per_page は1以上の整数を指定してください")
        .max(100, "per_page は100以下の整数を指定してください"),
    ),
  year_month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "year_month は YYYY-MM 形式で指定してください")
    .optional(),
  user_id: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().positive("user_id は正の整数を指定してください").optional()),
  status: z.enum(["draft", "submitted"]).optional(),
});

export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>;

// ---------------------------------------------------------------------------
// PUT /reports/:id 更新スキーマ
// ---------------------------------------------------------------------------

export const updateReportSchema = z.object({
  report_date: z
    .string("report_date は必須です")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "report_date は YYYY-MM-DD 形式で指定してください")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && val === date.toISOString().slice(0, 10);
    }, "report_date が不正な日付です"),
  visit_records: z.array(visitRecordSchema).min(1, "visit_records は1件以上必要です"),
  problem: z.string().max(2000, "problem は2000文字以内で入力してください").optional(),
  plan: z.string().max(2000, "plan は2000文字以内で入力してください").optional(),
});

export type UpdateReportInput = z.infer<typeof updateReportSchema>;

// ---------------------------------------------------------------------------
// POST /reports/:id/comments コメント作成スキーマ
// ---------------------------------------------------------------------------

export const createCommentSchema = z.object({
  target_type: z.enum(["problem", "plan"], {
    message: "target_type は problem または plan を指定してください",
  }),
  content: z
    .string("content は必須です")
    .min(1, "content は1文字以上必要です")
    .max(1000, "content は1000文字以内で入力してください"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
