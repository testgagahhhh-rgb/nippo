import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(100, "名前は100文字以内です"),
  email: z.string().email("メール形式が不正です").max(255, "メールは255文字以内です"),
  password: z.string().min(8, "パスワードは8文字以上です"),
  role: z.enum(["sales", "manager", "admin"]),
  department_id: z.number().int().positive("部署IDは正の整数です"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(100, "名前は100文字以内です").optional(),
  email: z.string().email("メール形式が不正です").max(255, "メールは255文字以内です").optional(),
  password: z.string().min(8, "パスワードは8文字以上です").optional(),
  role: z.enum(["sales", "manager", "admin"]).optional(),
  department_id: z.number().int().positive("部署IDは正の整数です").optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userListQuerySchema = z.object({
  role: z.enum(["sales", "manager", "admin"]).optional(),
  department_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(50),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;
