import { z } from "zod";

export const createCommentSchema = z.object({
  target_type: z.enum(["problem", "plan"], {
    error: "target_typeはproblemまたはplanのみです",
  }),
  content: z.string().min(1, "コメント内容は必須です").max(1000, "コメントは1000文字以内です"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
