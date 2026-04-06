// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { signToken, verifyToken } from "@/lib/auth/jwt";

describe("UT-004 JWT生成・検証", () => {
  const payload = {
    sub: 1,
    email: "test@example.com",
    role: "sales",
    departmentId: 1,
  };

  it("トークンが生成されること", async () => {
    const token = await signToken(payload);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("有効なトークンの検証でuserIdが正しく取得できること", async () => {
    const token = await signToken(payload);
    const decoded = await verifyToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.departmentId).toBe(payload.departmentId);
  });

  it("改ざんされたトークンの検証でエラーが返ること", async () => {
    const token = await signToken(payload);
    const tampered = token.slice(0, -5) + "XXXXX";
    await expect(verifyToken(tampered)).rejects.toThrow();
  });

  it("期限切れトークンの検証でエラーが返ること", async () => {
    // jose の SignJWT を直接使って短い有効期限のトークンを作成
    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? "dev-secret-change-in-production",
    );
    const expiredToken = await new SignJWT({
      email: payload.email,
      role: payload.role,
      departmentId: payload.departmentId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(payload.sub))
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(secret);

    await expect(verifyToken(expiredToken)).rejects.toThrow();
  });
});
