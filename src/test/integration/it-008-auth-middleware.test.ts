// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  testUsers,
  createAuthenticatedRequest,
  createUnauthenticatedRequest,
  createRequestWithAuth,
  asMock,
} from "./helpers";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    dailyReport: { findMany: vi.fn(), count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { GET as getReports } from "@/app/api/reports/route";
import { signToken } from "@/lib/auth/jwt";
import { SignJWT } from "jose";

describe("IT-008 認証ミドルウェアのトークン検証", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("トークンなしで401を返す", async () => {
    const req = createUnauthenticatedRequest("http://localhost/api/reports");
    const res = await getReports(req);
    expect(res.status).toBe(401);
  });

  it("形式不正のトークン（Bearer invalid）で401を返す", async () => {
    const req = createRequestWithAuth("http://localhost/api/reports", "Bearer invalid");
    const res = await getReports(req);
    expect(res.status).toBe(401);
  });

  it("署名改ざんされたトークンで401を返す", async () => {
    const token = await signToken(testUsers.yamada);
    const tampered = token.slice(0, -5) + "XXXXX";
    const req = createRequestWithAuth("http://localhost/api/reports", `Bearer ${tampered}`);
    const res = await getReports(req);
    expect(res.status).toBe(401);
  });

  it("期限切れトークンで401を返す", async () => {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? "dev-secret-change-in-production",
    );
    const expiredToken = await new SignJWT({
      email: testUsers.yamada.email,
      role: testUsers.yamada.role,
      departmentId: testUsers.yamada.departmentId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(testUsers.yamada.sub))
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(secret);

    const req = createRequestWithAuth("http://localhost/api/reports", `Bearer ${expiredToken}`);
    const res = await getReports(req);
    expect(res.status).toBe(401);
  });

  it("有効なトークンで200を返す", async () => {
    asMock(prisma.dailyReport.findMany).mockResolvedValueOnce([]);
    asMock(prisma.dailyReport.count).mockResolvedValueOnce(0);

    const req = await createAuthenticatedRequest("http://localhost/api/reports", testUsers.yamada);
    const res = await getReports(req);
    expect(res.status).toBe(200);
  });
});
