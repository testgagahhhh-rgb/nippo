import { validateEmail } from "@/src/lib/validators";

describe("UT-001: メールアドレスバリデーション", () => {
  it("正しいメールアドレス（yamada@example.com）はtrueを返す", () => {
    expect(validateEmail("yamada@example.com")).toBe(true);
  });

  it("サブドメイン・タグ付きアドレス（user+tag@sub.example.co.jp）はtrueを返す", () => {
    expect(validateEmail("user+tag@sub.example.co.jp")).toBe(true);
  });

  it("@なし（not-an-email）はfalseを返す", () => {
    expect(validateEmail("not-an-email")).toBe(false);
  });

  it("ドメインなし（missing@）はfalseを返す", () => {
    expect(validateEmail("missing@")).toBe(false);
  });

  it("ローカルパートなし（@nodomain.com）はfalseを返す", () => {
    expect(validateEmail("@nodomain.com")).toBe(false);
  });

  it("空文字はfalseを返す", () => {
    expect(validateEmail("")).toBe(false);
  });

  it("nullはfalseを返す", () => {
    expect(validateEmail(null)).toBe(false);
  });
});
