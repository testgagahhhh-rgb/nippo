// @vitest-environment node
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/src/lib/auth/password";

describe("UT-003: パスワードハッシュ化・照合", () => {
  it("ハッシュ化した結果が平文と異なること", async () => {
    const hash = await hashPassword("password123");
    expect(hash).not.toBe("password123");
  });

  it("同じ入力でもハッシュ結果が毎回異なること（salt）", async () => {
    const hash1 = await hashPassword("password123");
    const hash2 = await hashPassword("password123");
    expect(hash1).not.toBe(hash2);
  });

  it("正しいパスワードで照合すると true を返すこと", async () => {
    const hash = await hashPassword("password123");
    const result = await verifyPassword("password123", hash);
    expect(result).toBe(true);
  });

  it("誤ったパスワードで照合すると false を返すこと", async () => {
    const hash = await hashPassword("password123");
    const result = await verifyPassword("wrongpassword", hash);
    expect(result).toBe(false);
  });
});
