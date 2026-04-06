import { z } from "zod";

export const customerCreateSchema = z.object({
  name: z.string().min(1).max(100),
  company_name: z.string().min(1).max(200),
  phone: z
    .string()
    .max(20)
    .regex(/^[\d-]+$/, "数字とハイフンのみ使用できます")
    .optional(),
  email: z.string().email().max(255).optional(),
  address: z.string().max(500).optional(),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const customerListQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(50),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;
