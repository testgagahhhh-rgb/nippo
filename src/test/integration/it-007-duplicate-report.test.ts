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

describe("IT-007 同日重複日報のトランザクション整合性", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("同日の日報が既に存在する場合は422エラーとなる", async () => {
    const now = new Date();
    const body = {
      report_date: "2026-04-01",
      visit_records: [{ customer_id: 10, content: "テスト", visited_at: "10:00" }],
    };

    // 1回目: 成功
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
            visitRecords: [
              {
                id: 1,
                customer: { id: 10, name: "顧客A", companyName: "株式会社ABC" },
                content: "テスト",
                visitedAt: "10:00",
              },
            ],
            comments: [],
          }),
        },
      });
    });

    const req1 = await createAuthenticatedRequest(
      "http://localhost/api/reports",
      testUsers.yamada,
      { method: "POST", body },
    );
    const res1 = await createReport(req1);
    expect(res1.status).toBe(201);

    // 2回目: 重複エラー
    asMock(prisma.$transaction).mockImplementationOnce(async (fn: Function) => {
      return fn({
        dailyReport: {
          findUnique: vi.fn().mockResolvedValue({
            id: 1,
            userId: 1,
            reportDate: new Date("2026-04-01"),
          }),
          create: vi.fn(),
        },
      });
    });

    const req2 = await createAuthenticatedRequest(
      "http://localhost/api/reports",
      testUsers.yamada,
      { method: "POST", body },
    );
    const res2 = await createReport(req2);
    expect(res2.status).toBe(422);
    const errorData = await res2.json();
    expect(errorData.error.code).toBe("REPORT_ALREADY_EXISTS");
  });
});
