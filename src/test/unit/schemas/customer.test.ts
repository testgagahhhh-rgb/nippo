import { describe, it, expect } from "vitest";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerListQuerySchema,
} from "@/lib/schemas/customer";

describe("createCustomerSchema", () => {
  const validInput = {
    name: "山田太郎",
    company_name: "株式会社ABC",
    phone: "03-1234-5678",
    email: "yamada@example.com",
    address: "東京都渋谷区1-1-1",
  };

  it("正常な入力を受け付ける", () => {
    const result = createCustomerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("nameが必須", () => {
    const { name: _, ...input } = validInput;
    const result = createCustomerSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("company_nameが必須", () => {
    const { company_name: _, ...input } = validInput;
    const result = createCustomerSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("phoneが数字・ハイフン以外ならエラー", () => {
    const result = createCustomerSchema.safeParse({
      ...validInput,
      phone: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("emailが不正形式ならエラー", () => {
    const result = createCustomerSchema.safeParse({
      ...validInput,
      email: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("phone/email/addressが省略可能", () => {
    const result = createCustomerSchema.safeParse({
      name: "テスト顧客",
      company_name: "テスト会社",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCustomerSchema", () => {
  it("部分更新を受け付ける（nameのみ）", () => {
    const result = updateCustomerSchema.safeParse({ name: "更新名" });
    expect(result.success).toBe(true);
  });

  it("空オブジェクトを受け付ける", () => {
    const result = updateCustomerSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("customerListQuerySchema", () => {
  it("デフォルト値が適用される", () => {
    const result = customerListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(50);
    }
  });

  it("qパラメータを受け付ける", () => {
    const result = customerListQuerySchema.safeParse({ q: "ABC" });
    expect(result.success).toBe(true);
  });
});
