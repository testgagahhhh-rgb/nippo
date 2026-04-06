import { describe, it, expect } from "vitest";
import { validateVisitRecords } from "@/lib/validators";

describe("UT-007 訪問記録バリデーション", () => {
  it("1件・全項目ありでバリデーションOK", () => {
    const result = validateVisitRecords([
      { customer_id: 1, content: "訪問内容テスト", visited_at: "10:00" },
    ]);
    expect(result.success).toBe(true);
  });

  it("空配列はエラー（1件以上必要）", () => {
    const result = validateVisitRecords([]);
    expect(result.success).toBe(false);
  });

  it("customer_idがnullの場合エラー", () => {
    const result = validateVisitRecords([
      { customer_id: null, content: "テスト", visited_at: "10:00" },
    ]);
    expect(result.success).toBe(false);
  });

  it("contentが空文字の場合エラー", () => {
    const result = validateVisitRecords([{ customer_id: 1, content: "", visited_at: "10:00" }]);
    expect(result.success).toBe(false);
  });

  it("contentが1000文字でバリデーションOK", () => {
    const result = validateVisitRecords([
      { customer_id: 1, content: "a".repeat(1000), visited_at: "10:00" },
    ]);
    expect(result.success).toBe(true);
  });

  it("contentが1001文字の場合エラー", () => {
    const result = validateVisitRecords([
      { customer_id: 1, content: "a".repeat(1001), visited_at: "10:00" },
    ]);
    expect(result.success).toBe(false);
  });

  it("visited_atが25:00の場合エラー（時刻形式不正）", () => {
    const result = validateVisitRecords([
      { customer_id: 1, content: "テスト", visited_at: "25:00" },
    ]);
    expect(result.success).toBe(false);
  });

  it("visited_atがnullの場合バリデーションOK（任意項目）", () => {
    const result = validateVisitRecords([{ customer_id: 1, content: "テスト", visited_at: null }]);
    expect(result.success).toBe(true);
  });
});
