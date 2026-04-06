import { describe, it, expect } from "vitest";
import { createUserSchema, updateUserSchema, userListQuerySchema } from "@/lib/schemas/user";

describe("createUserSchema", () => {
  const validInput = {
    name: "テストユーザー",
    email: "test@example.com",
    password: "password123",
    role: "sales" as const,
    department_id: 1,
  };

  it("正常な入力を受け付ける", () => {
    const result = createUserSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("nameが必須", () => {
    const { name: _, ...input } = validInput;
    const result = createUserSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("emailが不正形式ならエラー", () => {
    const result = createUserSchema.safeParse({ ...validInput, email: "invalid" });
    expect(result.success).toBe(false);
  });

  it("passwordが8文字未満ならエラー", () => {
    const result = createUserSchema.safeParse({ ...validInput, password: "short" });
    expect(result.success).toBe(false);
  });

  it("roleがsales/manager/admin以外ならエラー", () => {
    const result = createUserSchema.safeParse({ ...validInput, role: "unknown" });
    expect(result.success).toBe(false);
  });

  it("department_idが必須", () => {
    const { department_id: _, ...input } = validInput;
    const result = createUserSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  it("部分更新を受け付ける（nameのみ）", () => {
    const result = updateUserSchema.safeParse({ name: "更新名" });
    expect(result.success).toBe(true);
  });

  it("passwordが省略可能", () => {
    const result = updateUserSchema.safeParse({ email: "new@example.com" });
    expect(result.success).toBe(true);
  });

  it("空オブジェクトを受け付ける", () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("userListQuerySchema", () => {
  it("デフォルト値が適用される", () => {
    const result = userListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(50);
    }
  });

  it("roleフィルターを受け付ける", () => {
    const result = userListQuerySchema.safeParse({ role: "manager" });
    expect(result.success).toBe(true);
  });

  it("department_idが文字列から数値に変換される", () => {
    const result = userListQuerySchema.safeParse({ department_id: "1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.department_id).toBe(1);
    }
  });
});
