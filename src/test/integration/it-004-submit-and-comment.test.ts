// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { testUsers, createAuthenticatedRequest, asMock } from "./helpers";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    dailyReport: { findUnique: vi.fn(), update: vi.fn() },
    managerComment: { create: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { POST as submitReport } from "@/app/api/reports/[id]/submit/route";
import { POST as createComment } from "@/app/api/reports/[id]/comments/route";
import { GET as getReport } from "@/app/api/reports/[id]/route";

describe("IT-004 日報提出後のコメント投稿", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("提出済み日報にコメントが保存される", async () => {
    const now = new Date();
    const params = { params: Promise.resolve({ id: "1" }) };

    // Step 1: 日報提出
    asMock(prisma.dailyReport.findUnique).mockResolvedValueOnce({
      id: 1,
      userId: 1,
      reportDate: new Date("2026-04-01"),
      status: "draft",
      submittedAt: null,
      _count: { visitRecords: 1 },
    });

    asMock(prisma.dailyReport.update).mockResolvedValueOnce({
      id: 1,
      userId: 1,
      reportDate: new Date("2026-04-01"),
      status: "submitted",
      submittedAt: now,
      problem: "課題あり",
      plan: "計画あり",
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
    });

    const submitReq = await createAuthenticatedRequest(
      "http://localhost/api/reports/1/submit",
      testUsers.yamada,
      { method: "POST" },
    );
    const submitRes = await submitReport(submitReq, params);
    expect(submitRes.status).toBe(200);

    // Step 2: コメント投稿（田中部長）
    asMock(prisma.dailyReport.findUnique).mockResolvedValueOnce({
      id: 1,
      userId: 1,
      status: "submitted",
    });

    asMock(prisma.managerComment.create).mockResolvedValueOnce({
      id: 1,
      reportId: 1,
      userId: 3,
      targetType: "problem",
      content: "対策を検討してください",
      createdAt: now,
      user: { id: 3, name: "田中部長" },
    });

    const commentReq = await createAuthenticatedRequest(
      "http://localhost/api/reports/1/comments",
      testUsers.tanaka,
      {
        method: "POST",
        body: { target_type: "problem", content: "対策を検討してください" },
      },
    );
    const commentRes = await createComment(commentReq, params);
    expect(commentRes.status).toBe(201);
    const commentData = await commentRes.json();
    expect(commentData.data.content).toBe("対策を検討してください");

    // Step 3: 日報詳細を取得してコメントを確認
    asMock(prisma.dailyReport.findUnique).mockResolvedValueOnce({
      id: 1,
      userId: 1,
      reportDate: new Date("2026-04-01"),
      status: "submitted",
      submittedAt: now,
      problem: "課題あり",
      plan: "計画あり",
      createdAt: now,
      updatedAt: now,
      user: { id: 1, name: "山田太郎", department: { id: 1, name: "東京営業部" } },
      visitRecords: [],
      comments: [
        {
          id: 1,
          targetType: "problem",
          content: "対策を検討してください",
          createdAt: now,
          user: { id: 3, name: "田中部長" },
        },
      ],
    });

    const getReq = await createAuthenticatedRequest(
      "http://localhost/api/reports/1",
      testUsers.yamada,
    );
    const getRes = await getReport(getReq, params);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.data.comments).toHaveLength(1);
    expect(getData.data.comments[0].content).toBe("対策を検討してください");
  });
});
