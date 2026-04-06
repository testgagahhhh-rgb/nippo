import { describe, it, expect } from "vitest";
import { createCommentSchema } from "@/lib/schemas/comment";

describe("createCommentSchema", () => {
  it("正常な入力を受け付ける", () => {
    const result = createCommentSchema.safeParse({
      target_type: "problem",
      content: "来週の会議で共有してください。",
    });
    expect(result.success).toBe(true);
  });

  it("target_typeがplanでも受け付ける", () => {
    const result = createCommentSchema.safeParse({
      target_type: "plan",
      content: "良い計画です。",
    });
    expect(result.success).toBe(true);
  });

  it("target_typeがproblem/plan以外ならエラー", () => {
    const result = createCommentSchema.safeParse({
      target_type: "other",
      content: "テスト",
    });
    expect(result.success).toBe(false);
  });

  it("contentが空ならエラー", () => {
    const result = createCommentSchema.safeParse({
      target_type: "problem",
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("contentが1001文字以上ならエラー", () => {
    const result = createCommentSchema.safeParse({
      target_type: "problem",
      content: "a".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});
