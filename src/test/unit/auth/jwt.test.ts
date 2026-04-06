// @vitest-environment node
import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "@/lib/auth/jwt";

describe("JWT", () => {
  const payload = {
    sub: 1,
    email: "test@example.com",
    role: "sales",
    departmentId: 1,
  };

  it("トークンの署名と検証ができる", async () => {
    const token = await signToken(payload);
    expect(typeof token).toBe("string");

    const decoded = await verifyToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.departmentId).toBe(payload.departmentId);
  });

  it("不正なトークンは検証に失敗する", async () => {
    await expect(verifyToken("invalid-token")).rejects.toThrow();
  });
});
