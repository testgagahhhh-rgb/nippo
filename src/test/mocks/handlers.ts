import { http, HttpResponse } from "msw";

export const handlers = [
  // 認証
  http.post("/api/v1/auth/login", () => {
    return HttpResponse.json({
      data: {
        token: "mock-token",
        expires_at: "2026-04-03T00:00:00+09:00",
        user: {
          id: 1,
          name: "山田太郎",
          email: "yamada@example.com",
          role: "sales",
          department: { id: 1, name: "東京営業部" },
        },
      },
    });
  }),

  // 日報一覧
  http.get("/api/v1/reports", () => {
    return HttpResponse.json({
      data: [],
      meta: { total: 0, page: 1, per_page: 20 },
    });
  }),

  // 顧客一覧
  http.get("/api/v1/customers", () => {
    return HttpResponse.json({
      data: [],
      meta: { total: 0, page: 1, per_page: 50 },
    });
  }),
];
