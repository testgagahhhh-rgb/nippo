import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8),
  role: z.enum(["sales", "manager", "admin"]),
  department_id: z.number().int().positive().nullable().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["sales", "manager", "admin"]).optional(),
  department_id: z.number().int().positive().nullable().optional(),
});

export const userListQuerySchema = z.object({
  role: z.enum(["sales", "manager", "admin"]).optional(),
  department_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(50),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
