// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { authenticateRequest, authorizeRole } from "@/lib/middleware/auth";
import { signToken } from "@/lib/auth/jwt";
import { blacklistToken } from "@/lib/auth/token-blacklist";

let validToken: string;

beforeAll(async () => {
  validToken = await signToken({
    sub: 1,
    email: "test@example.com",
    role: "sales",
    departmentId: 1,
  });
});

function makeRequest(token?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  }
  return new NextRequest("http://localhost/api/test", { headers });
}

describe("authenticateRequest", () => {
  it("有効なトークンでユーザー情報を返す", async () => {
    const result = await authenticateRequest(makeRequest(validToken));
    expect(result).toHaveProperty("sub", 1);
    expect(result).toHaveProperty("email", "test@example.com");
    expect(result).toHaveProperty("role", "sales");
  });

  it("Authorizationヘッダーなしで401を返す", async () => {
    const result = await authenticateRequest(makeRequest());
    expect(result).toHaveProperty("status", 401);
  });

  it("無効なトークンで401を返す", async () => {
    const result = await authenticateRequest(makeRequest("invalid-token"));
    expect(result).toHaveProperty("status", 401);
  });

  it("ブラックリスト済みトークンで401を返す", async () => {
    const token = await signToken({
      sub: 2,
      email: "blacklisted@example.com",
      role: "sales",
      departmentId: 1,
    });
    blacklistToken(token);
    const result = await authenticateRequest(makeRequest(token));
    expect(result).toHaveProperty("status", 401);
  });
});

describe("authorizeRole", () => {
  const salesUser = {
    sub: 1,
    email: "test@example.com",
    role: "sales",
    departmentId: 1,
  };

  it("許可されたロールならnullを返す", () => {
    expect(authorizeRole(salesUser, ["sales", "manager", "admin"])).toBeNull();
  });

  it("許可されないロールなら403レスポンスを返す", () => {
    const result = authorizeRole(salesUser, ["manager", "admin"]);
    expect(result).toHaveProperty("status", 403);
  });
});
