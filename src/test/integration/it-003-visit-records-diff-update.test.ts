// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { testUsers, createAuthenticatedRequest, asMock } from "./helpers";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    dailyReport: { findUnique: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn() },
    visitRecord: { deleteMany: vi.fn(), update: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { PUT as updateReport } from "@/app/api/reports/[id]/route";

describe("IT-003 日報更新時の訪問記録の差分更新", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("既存行の更新・削除・新規追加が正しく行われる", async () => {
    const now = new Date();

    asMock(prisma.dailyReport.findUnique).mockResolvedValueOnce({
      id: 1,
      userId: 1,
      reportDate: new Date("2026-04-01"),
      status: "draft",
      submittedAt: null,
      problem: null,
      plan: null,
      createdAt: now,
      updatedAt: now,
      visitRecords: [
        { id: 101, reportId: 1, customerId: 10, content: "旧内容1", visitedAt: "09:00" },
        { id: 102, reportId: 1, customerId: 11, content: "旧内容2", visitedAt: "10:00" },
      ],
    });

    const updatedReport = {
      id: 1,
      userId: 1,
      reportDate: new Date("2026-04-01"),
      status: "draft",
      submittedAt: null,
      problem: null,
      plan: null,
      createdAt: now,
      updatedAt: now,
      user: { id: 1, name: "山田太郎", department: { id: 1, name: "東京営業部" } },
      visitRecords: [
        {
          id: 101,
          reportId: 1,
          customerId: 10,
          content: "更新内容",
          visitedAt: "09:00",
          customer: { id: 10, name: "顧客A", companyName: "株式会社ABC" },
        },
        {
          id: 103,
          reportId: 1,
          customerId: 11,
          content: "新規追加",
          visitedAt: "14:00",
          customer: { id: 11, name: "顧客B", companyName: "有限会社XYZ" },
        },
      ],
      comments: [],
    };

    asMock(prisma.$transaction).mockImplementationOnce(async (fn: Function) => {
      return fn({
        visitRecord: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({}),
        },
        dailyReport: {
          update: vi.fn().mockResolvedValue(updatedReport),
        },
      });
    });

    const req = await createAuthenticatedRequest(
      "http://localhost/api/reports/1",
      testUsers.yamada,
      {
        method: "PUT",
        body: {
          visit_records: [
            { id: 101, customer_id: 10, content: "更新内容", visited_at: "09:00" },
            { customer_id: 11, content: "新規追加", visited_at: "14:00" },
          ],
        },
      },
    );

    const res = await updateReport(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.visit_records).toHaveLength(2);
  });
});
