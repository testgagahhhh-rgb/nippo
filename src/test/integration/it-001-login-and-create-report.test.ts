// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { asMock } from "./helpers";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    dailyReport: { findUnique: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as createReport } from "@/app/api/reports/route";
import { hashPassword } from "@/lib/auth/password";
import { NextRequest } from "next/server";

describe("IT-001 ログイン〜日報作成の一連フロー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証トークンを使って日報を作成できる", async () => {
    // Step 1: ログイン
    const passwordHash = await hashPassword("password123");
    asMock(prisma.user.findUnique).mockResolvedValueOnce({
      id: 1,
      name: "山田太郎",
      email: "yamada@example.com",
      passwordHash,
      role: "sales",
      departmentId: 1,
      department: { id: 1, name: "東京営業部" },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const loginReq = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "yamada@example.com", password: "password123" }),
    });
    const loginRes = await loginPost(loginReq);
    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.data.token).toBeDefined();

    // Step 2: トークンを使って日報作成
    const now = new Date();
    const mockReport = {
      id: 1,
      userId: 1,
      reportDate: new Date("2026-04-01"),
      status: "draft",
      submittedAt: null,
      problem: null,
      plan: null,
      createdAt: now,
      updatedAt: now,
      user: { id: 1, name: "山田太郎" },
      visitRecords: [
        {
          id: 1,
          reportId: 1,
          customerId: 10,
          content: "新製品の提案",
          visitedAt: "10:00",
          customer: { id: 10, name: "顧客A", companyName: "株式会社ABC" },
        },
      ],
      comments: [],
    };

    asMock(prisma.$transaction).mockImplementationOnce(async (fn: Function) => {
      return fn({
        dailyReport: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(mockReport),
        },
      });
    });

    const reportReq = new NextRequest("http://localhost/api/reports", {
      method: "POST",
      headers: {
        authorization: `Bearer ${loginData.data.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        report_date: "2026-04-01",
        visit_records: [{ customer_id: 10, content: "新製品の提案", visited_at: "10:00" }],
      }),
    });

    const reportRes = await createReport(reportReq);
    expect(reportRes.status).toBe(201);
    const reportData = await reportRes.json();
    expect(reportData.data.id).toBe(1);
    expect(reportData.data.visit_records).toHaveLength(1);
  });
});
