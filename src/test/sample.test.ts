import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "./mocks/server";

describe("テスト環境のセットアップ確認", () => {
  it("基本的なアサーションが動作すること", () => {
    expect(1 + 1).toBe(2);
  });

  it("MSW でAPIレスポンスをモックできること", async () => {
    const res = await fetch("/api/v1/reports");
    const json = await res.json();
    expect(json.data).toEqual([]);
  });

  it("テストごとにハンドラーを上書きできること", async () => {
    server.use(
      http.get("/api/v1/reports", () => {
        return HttpResponse.json({
          data: [{ id: 1, report_date: "2026-04-02" }],
          meta: { total: 1, page: 1, per_page: 20 },
        });
      }),
    );

    const res = await fetch("/api/v1/reports");
    const json = await res.json();
    expect(json.meta.total).toBe(1);
  });
});
