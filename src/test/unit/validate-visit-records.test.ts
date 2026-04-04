import { validateVisitRecords } from "@/src/lib/validators";

describe("UT-007: 訪問記録バリデーション", () => {
  it("1件・全項目ありの場合はvalid: true", () => {
    const result = validateVisitRecords([
      { customer_id: 1, content: "訪問内容", visited_at: "10:00" },
    ]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("空配列の場合はerrorsに「1件以上必要」を含む", () => {
    const result = validateVisitRecords([]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("customer_idがnullの場合はerrorsに含む", () => {
    const result = validateVisitRecords([
      { customer_id: null, content: "訪問内容", visited_at: "10:00" },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("contentが空文字の場合はerrorsに含む", () => {
    const result = validateVisitRecords([{ customer_id: 1, content: "", visited_at: "10:00" }]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("contentが1000文字の場合はvalid: true", () => {
    const content = "あ".repeat(1000);
    const result = validateVisitRecords([{ customer_id: 1, content, visited_at: "10:00" }]);
    expect(result.valid).toBe(true);
  });

  it("contentが1001文字の場合はerrorsに含む", () => {
    const content = "あ".repeat(1001);
    const result = validateVisitRecords([{ customer_id: 1, content, visited_at: "10:00" }]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("visited_atが不正な時刻（25:00）の場合はerrorsに含む", () => {
    const result = validateVisitRecords([
      { customer_id: 1, content: "訪問内容", visited_at: "25:00" },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("visited_atがnullの場合はvalid: true（任意項目）", () => {
    const result = validateVisitRecords([
      { customer_id: 1, content: "訪問内容", visited_at: null },
    ]);
    expect(result.valid).toBe(true);
  });
});
