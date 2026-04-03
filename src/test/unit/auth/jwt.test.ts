// @vitest-environment node
import { describe, it, expect } from "vitest";
import { generateToken, verifyToken } from "@/src/lib/auth/jwt";
import { SignJWT } from "jose";

describe("UT-004: JWT生成・検証", () => {
  it("トークンが生成されること", async () => {
    const token = await generateToken(1);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("有効なトークンの検証で userId が正しく取得できること", async () => {
    const token = await generateToken(42);
    const payload = await verifyToken(token);
    expect(payload.userId).toBe(42);
  });

  it("改ざんされたトークンの検証でエラーが返ること", async () => {
    const token = await generateToken(1);
    const tampered = token.slice(0, -5) + "XXXXX";
    await expect(verifyToken(tampered)).rejects.toThrow();
  });

  it("期限切れトークンの検証でエラーが返ること", async () => {
    const secret = Buffer.from(
      process.env.JWT_SECRET ?? "development-secret-key",
      "utf-8",
    );
    // 有効期限を過去に設定したトークンを生成
    const expiredToken = await new SignJWT({ userId: 1 })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(new Date(Date.now() - 2000))
      .setExpirationTime(new Date(Date.now() - 1000))
      .sign(secret);

    await expect(verifyToken(expiredToken)).rejects.toThrow();
  });
});
