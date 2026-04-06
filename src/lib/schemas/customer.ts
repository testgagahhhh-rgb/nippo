import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "顧客名は必須です").max(100, "顧客名は100文字以内です"),
  company_name: z.string().min(1, "会社名は必須です").max(200, "会社名は200文字以内です"),
  phone: z
    .string()
    .max(20, "電話番号は20文字以内です")
    .regex(/^[\d-]*$/, "電話番号は数字とハイフンのみです")
    .nullable()
    .optional(),
  email: z
    .string()
    .email("メール形式が不正です")
    .max(255, "メールは255文字以内です")
    .nullable()
    .optional(),
  address: z.string().max(500, "住所は500文字以内です").nullable().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const customerListQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(50),
});

export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;
