import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword } from "@/src/lib/validations/auth";

describe("UT-001: validateEmail", () => {
  it.each([
    { input: "yamada@example.com", expected: true },
    { input: "user+tag@sub.example.co.jp", expected: true },
  ])("有効なメールアドレス「$input」に対して true を返すこと", ({ input, expected }) => {
    expect(validateEmail(input)).toBe(expected);
  });

  it.each([
    { input: "not-an-email", expected: false },
    { input: "missing@", expected: false },
    { input: "@nodomain.com", expected: false },
    { input: "", expected: false },
  ])("無効なメールアドレス「$input」に対して false を返すこと", ({ input, expected }) => {
    expect(validateEmail(input)).toBe(expected);
  });
});

describe("UT-002: validatePassword", () => {
  it.each([
    { input: "password123", expected: true, desc: "8文字以上" },
    { input: "abcdefgh", expected: true, desc: "ちょうど8文字" },
  ])("有効なパスワード ($desc) に対して true を返すこと", ({ input, expected }) => {
    expect(validatePassword(input)).toBe(expected);
  });

  it.each([
    { input: "short", expected: false, desc: "5文字" },
    { input: "1234567", expected: false, desc: "7文字" },
    { input: "", expected: false, desc: "空文字" },
  ])("無効なパスワード ($desc) に対して false を返すこと", ({ input, expected }) => {
    expect(validatePassword(input)).toBe(expected);
  });
});
