// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { testUsers, createAuthenticatedRequest, asMock } from "./helpers";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { POST as createReport } from "@/app/api/reports/route";

describe("IT-002 日報作成時の訪問記録の複数行挿入", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("訪問記録3件を含む日報が正しく作成される", async () => {
    const now = new Date();
    const visitRecords = [
      {
        id: 1,
        reportId: 1,
        customerId: 10,
        content: "訪問1",
        visitedAt: "09:00",
        customer: { id: 10, name: "顧客A", companyName: "株式会社ABC" },
      },
      {
        id: 2,
        reportId: 1,
        customerId: 11,
        content: "訪問2",
        visitedAt: "11:00",
        customer: { id: 11, name: "顧客B", companyName: "有限会社XYZ" },
      },
      {
        id: 3,
        reportId: 1,
        customerId: 10,
        content: "訪問3",
        visitedAt: "14:00",
        customer: { id: 10, name: "顧客A", companyName: "株式会社ABC" },
      },
    ];

    asMock(prisma.$transaction).mockImplementationOnce(async (fn: Function) => {
      return fn({
        dailyReport: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
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
            visitRecords,
            comments: [],
          }),
        },
      });
    });

    const req = await createAuthenticatedRequest("http://localhost/api/reports", testUsers.yamada, {
      method: "POST",
      body: {
        report_date: "2026-04-01",
        visit_records: [
          { customer_id: 10, content: "訪問1", visited_at: "09:00" },
          { customer_id: 11, content: "訪問2", visited_at: "11:00" },
          { customer_id: 10, content: "訪問3", visited_at: "14:00" },
        ],
      },
    });

    const res = await createReport(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.visit_records).toHaveLength(3);
  });
});
