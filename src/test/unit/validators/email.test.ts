import { describe, it, expect } from "vitest";
import { validateEmail } from "@/lib/validators";

describe("UT-001 メールアドレスバリデーション", () => {
  it("正常なメールアドレスを受け付ける", () => {
    expect(validateEmail("yamada@example.com")).toBe(true);
  });

  it("サブドメイン・タグ付きアドレスを受け付ける", () => {
    expect(validateEmail("user+tag@sub.example.co.jp")).toBe(true);
  });

  it("@がないアドレスを拒否する", () => {
    expect(validateEmail("not-an-email")).toBe(false);
  });

  it("ドメインがないアドレスを拒否する", () => {
    expect(validateEmail("missing@")).toBe(false);
  });

  it("ローカル部がないアドレスを拒否する", () => {
    expect(validateEmail("@nodomain.com")).toBe(false);
  });

  it("空文字を拒否する", () => {
    expect(validateEmail("")).toBe(false);
  });

  it("nullを拒否する", () => {
    expect(validateEmail(null)).toBe(false);
  });
});
