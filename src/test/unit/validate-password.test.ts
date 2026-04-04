import { validatePassword } from "@/src/lib/validators";

describe("UT-002: パスワードバリデーション", () => {
  it("8文字のパスワード（password123）はtrueを返す", () => {
    expect(validatePassword("password123")).toBe(true);
  });

  it("8文字のパスワード（abcdefgh）はtrueを返す", () => {
    expect(validatePassword("abcdefgh")).toBe(true);
  });

  it("5文字のパスワード（short）はfalseを返す", () => {
    expect(validatePassword("short")).toBe(false);
  });

  it("7文字のパスワード（1234567）はfalseを返す", () => {
    expect(validatePassword("1234567")).toBe(false);
  });

  it("空文字はfalseを返す", () => {
    expect(validatePassword("")).toBe(false);
  });
});
