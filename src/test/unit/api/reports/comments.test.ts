/**
 * POST /api/reports/:id/comments のユニットテスト
 *
 * Prisma および getAuthUser を vi.mock でモック化し、
 * DB 接続なしでルートハンドラーのロジックを検証する。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Prisma の動的インポートをモック
const mockPrisma = {
  dailyReport: {
    findUnique: vi.fn(),
  },
  comment: {
    create: vi.fn(),
  },
};

vi.mock("@/src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// 認証ミドルウェアをモック
vi.mock("@/src/lib/middleware/auth", () => ({
  requireAuth: vi.fn(),
  forbiddenResponse: vi.fn((message?: string) => {
    const Response =
      global.Response ??
      class Response {
        constructor(
          public body: unknown,
          public init: { status: number },
        ) {}
        async json() {
          return JSON.parse(this.body as string);
        }
      };
    return new Response(
      JSON.stringify({
        error: { code: "FORBIDDEN", message: message ?? "操作する権限がありません" },
      }),
      { status: 403 },
    );
  }),
}));

import { POST } from "@/src/app/api/reports/[id]/comments/route";
import { requireAuth } from "@/src/lib/middleware/auth";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const managerUser = {
  id: 3,
  name: "田中部長",
  email: "tanaka@example.com",
  role: "manager" as const,
  departmentId: 1,
};
const adminUser = {
  id: 5,
  name: "管理者",
  email: "admin@example.com",
  role: "admin" as const,
  departmentId: null,
};
const salesUser = {
  id: 1,
  name: "山田太郎",
  email: "yamada@example.com",
  role: "sales" as const,
  departmentId: 1,
};

const submittedReport = { id: 42, status: "submitted" };
const draftReport = { id: 99, status: "draft" };

function makeRequest(
  body: unknown,
  reportId = "42",
): [NextRequest, { params: Promise<{ id: string }> }] {
  const req = new NextRequest(`http://localhost/api/reports/${reportId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return [req, { params: Promise.resolve({ id: reportId }) }];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/reports/:id/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // 正常系
  // -----------------------------------------------------------------------

  it("manager が提出済み日報にコメントを投稿すると 201 を返す", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ user: managerUser, error: null });
    mockPrisma.dailyReport.findUnique.mockResolvedValue(submittedReport);
    mockPrisma.comment.create.mockResolvedValue({
      id: 5,
      reportId: 42,
      targetType: "problem",
      content: "来週の会議で共有してください。",
      createdAt: new Date("2026-04-01T09:00:00.000Z"),
      user: { id: 3, name: "田中部長" },
    });

    const [req, ctx] = makeRequest({
      target_type: "problem",
      content: "来週の会議で共有してください。",
    });
    const res = await POST(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.id).toBe(5);
    expect(json.data.report_id).toBe(42);
    expect(json.data.target_type).toBe("problem");
    expect(json.data.content).toBe("来週の会議で共有してください。");
    expect(json.data.user).toEqual({ id: 3, name: "田中部長" });
  });

  it("admin が提出済み日報にコメントを投稿すると 201 を返す", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ user: adminUser, error: null });
    mockPrisma.dailyReport.findUnique.mockResolvedValue(submittedReport);
    mockPrisma.comment.create.mockResolvedValue({
      id: 6,
      reportId: 42,
      targetType: "plan",
      content: "計画を見直してください。",
      createdAt: new Date("2026-04-01T10:00:00.000Z"),
      user: { id: 5, name: "管理者" },
    });

    const [req, ctx] = makeRequest({ target_type: "plan", content: "計画を見直してください。" });
    const res = await POST(req, ctx);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.target_type).toBe("plan");
  });

  // -----------------------------------------------------------------------
  // 認可エラー
  // -----------------------------------------------------------------------

  it("sales がリクエストすると 403 FORBIDDEN を返す", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ user: salesUser, error: null });

    const [req, ctx] = makeRequest({ target_type: "problem", content: "コメント" });
    const res = await POST(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error.code).toBe("FORBIDDEN");
  });

  it("未認証の場合は 401 を返す", async () => {
    const { NextResponse } = await import("next/server");
    const unauthorizedResponse = NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "認証トークンが指定されていません" } },
      { status: 401 },
    );
    vi.mocked(requireAuth).mockResolvedValue({ user: null, error: unauthorizedResponse });

    const [req, ctx] = makeRequest({ target_type: "problem", content: "コメント" });
    const res = await POST(req, ctx);

    expect(res.status).toBe(401);
  });

  // -----------------------------------------------------------------------
  // ビジネスロジックエラー
  // -----------------------------------------------------------------------

  it("下書き日報へのコメントは 422 REPORT_NOT_SUBMITTED を返す", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ user: managerUser, error: null });
    mockPrisma.dailyReport.findUnique.mockResolvedValue(draftReport);

    const [req, ctx] = makeRequest({ target_type: "problem", content: "コメント" }, "99");
    const res = await POST(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(json.error.code).toBe("REPORT_NOT_SUBMITTED");
  });

  it("存在しない日報 ID には 404 NOT_FOUND を返す", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ user: managerUser, error: null });
    mockPrisma.dailyReport.findUnique.mockResolvedValue(null);

    const [req, ctx] = makeRequest({ target_type: "problem", content: "コメント" }, "999");
    const res = await POST(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error.code).toBe("NOT_FOUND");
  });

  // -----------------------------------------------------------------------
  // バリデーションエラー
  // -----------------------------------------------------------------------

  it("target_type が不正な値では 400 VALIDATION_ERROR を返す", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ user: managerUser, error: null });

    const [req, ctx] = makeRequest({ target_type: "invalid", content: "コメント" });
    const res = await POST(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("content が 1001 文字では 400 VALIDATION_ERROR を返す", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ user: managerUser, error: null });

    const longContent = "あ".repeat(1001);
    const [req, ctx] = makeRequest({ target_type: "problem", content: longContent });
    const res = await POST(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("content が空文字では 400 VALIDATION_ERROR を返す", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ user: managerUser, error: null });

    const [req, ctx] = makeRequest({ target_type: "plan", content: "" });
    const res = await POST(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("target_type が未指定では 400 VALIDATION_ERROR を返す", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ user: managerUser, error: null });

    const [req, ctx] = makeRequest({ content: "コメント" });
    const res = await POST(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });
});
