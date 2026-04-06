// @vitest-environment node
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("UT-003 パスワードハッシュ化・照合", () => {
  it("ハッシュ化した結果が平文と異なること", async () => {
    const password = "password123";
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
  });

  it("同じ入力でもハッシュ結果が毎回異なること（salt）", async () => {
    const password = "password123";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });

  it("正しいパスワードで照合できる", async () => {
    const password = "password123";
    const hash = await hashPassword(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it("誤ったパスワードで照合に失敗する", async () => {
    const hash = await hashPassword("correct-password");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});
