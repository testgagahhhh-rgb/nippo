import { z } from "zod";

const visitRecordCreateSchema = z.object({
  customer_id: z.number().int().positive(),
  content: z.string().min(1, "訪問内容は必須です").max(1000, "訪問内容は1000文字以内です"),
  visited_at: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM形式で入力してください（00:00〜23:59）")
    .nullable()
    .optional(),
});

export const createReportSchema = z.object({
  report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD形式で入力してください"),
  visit_records: z.array(visitRecordCreateSchema).min(1, "訪問記録は1件以上必要です"),
  problem: z.string().max(2000, "課題は2000文字以内です").nullable().optional(),
  plan: z.string().max(2000, "計画は2000文字以内です").nullable().optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
