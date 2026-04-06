import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/validators";

describe("UT-002 パスワードバリデーション", () => {
  it("8文字のパスワードを受け付ける（英数字混在）", () => {
    expect(validatePassword("password123")).toBe(true);
  });

  it("8文字のパスワードを受け付ける（英字のみ）", () => {
    expect(validatePassword("abcdefgh")).toBe(true);
  });

  it("5文字のパスワードを拒否する", () => {
    expect(validatePassword("short")).toBe(false);
  });

  it("7文字のパスワードを拒否する", () => {
    expect(validatePassword("1234567")).toBe(false);
  });

  it("空文字を拒否する", () => {
    expect(validatePassword("")).toBe(false);
  });
});
