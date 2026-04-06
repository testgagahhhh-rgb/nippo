// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { testUsers, createAuthenticatedRequest, asMock } from "./helpers";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    dailyReport: { findMany: vi.fn(), count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { GET as getReports } from "@/app/api/reports/route";

function createMockReports(count: number, startId: number = 1) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    userId: 1,
    reportDate: new Date(`2026-04-${String(i + 1).padStart(2, "0")}`),
    status: "submitted",
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
    user: { id: 1, name: "山田太郎" },
    _count: { comments: 0 },
  }));
}

describe("IT-005 日報一覧のページネーション", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("page=1で20件取得、totalが25であること", async () => {
    asMock(prisma.dailyReport.findMany).mockResolvedValueOnce(createMockReports(20));
    asMock(prisma.dailyReport.count).mockResolvedValueOnce(25);

    const req = await createAuthenticatedRequest(
      "http://localhost/api/reports?page=1&per_page=20",
      testUsers.yamada,
    );
    const res = await getReports(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(20);
    expect(data.meta.total).toBe(25);
    expect(data.meta.page).toBe(1);
  });

  it("page=2で5件取得できること", async () => {
    asMock(prisma.dailyReport.findMany).mockResolvedValueOnce(createMockReports(5, 21));
    asMock(prisma.dailyReport.count).mockResolvedValueOnce(25);

    const req = await createAuthenticatedRequest(
      "http://localhost/api/reports?page=2&per_page=20",
      testUsers.yamada,
    );
    const res = await getReports(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(5);
    expect(data.meta.page).toBe(2);
  });
});
