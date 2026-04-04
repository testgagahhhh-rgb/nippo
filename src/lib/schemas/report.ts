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
  visit_records: z
    .array(visitRecordSchema)
    .min(1, "visit_records は1件以上必要です"),
  problem: z
    .string()
    .max(2000, "problem は2000文字以内で入力してください")
    .optional(),
  plan: z
    .string()
    .max(2000, "plan は2000文字以内で入力してください")
    .optional(),
});

// PUT /api/reports/:id — update (same shape as create)
export const updateReportSchema = createReportSchema;

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type VisitRecordInput = z.infer<typeof visitRecordSchema>;
