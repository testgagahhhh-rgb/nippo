// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { testUsers, createAuthenticatedRequest, asMock } from "./helpers";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { POST as createUser } from "@/app/api/users/route";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { hashPassword } from "@/lib/auth/password";
import { NextRequest } from "next/server";

describe("IT-009 ユーザー作成後のログイン", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("作成したユーザーで即ログインできる", async () => {
    const now = new Date();
    const newUserPassword = "newpassword123";
    const newUserHash = await hashPassword(newUserPassword);

    // Step 1: ユーザー作成（管理者トークン）
    asMock(prisma.user.findUnique).mockResolvedValueOnce(null);
    asMock(prisma.user.create).mockResolvedValueOnce({
      id: 6,
      name: "新規ユーザー",
      email: "newuser@example.com",
      passwordHash: newUserHash,
      role: "sales",
      departmentId: 1,
      department: { id: 1, name: "東京営業部" },
      createdAt: now,
      updatedAt: now,
    });

    const createReq = await createAuthenticatedRequest(
      "http://localhost/api/users",
      testUsers.admin,
      {
        method: "POST",
        body: {
          name: "新規ユーザー",
          email: "newuser@example.com",
          password: newUserPassword,
          role: "sales",
          department_id: 1,
        },
      },
    );
    const createRes = await createUser(createReq);
    expect(createRes.status).toBe(201);

    // Step 2: 作成したユーザーでログイン
    asMock(prisma.user.findUnique).mockResolvedValueOnce({
      id: 6,
      name: "新規ユーザー",
      email: "newuser@example.com",
      passwordHash: newUserHash,
      role: "sales",
      departmentId: 1,
      department: { id: 1, name: "東京営業部" },
      createdAt: now,
      updatedAt: now,
    });

    const loginReq = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "newuser@example.com", password: newUserPassword }),
    });
    const loginRes = await loginPost(loginReq);
    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.data.token).toBeDefined();
    expect(typeof loginData.data.token).toBe("string");
  });
});
