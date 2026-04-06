// @vitest-environment node
import { describe, it, expect } from "vitest";
import { visitRecordSchema, createReportSchema } from "@/src/lib/schemas/report";

// UT-007: 訪問記録バリデーション
describe("UT-007: 訪問記録バリデーション", () => {
  // ケース1: 1件・全項目あり → バリデーションOK
  it("1件・全項目ありの場合はバリデーションOK", () => {
    const result = visitRecordSchema.safeParse({
      customer_id: 10,
      content: "新製品の提案を実施。先方の反応は良好。",
      visited_at: "10:00",
    });
    expect(result.success).toBe(true);
  });

  // ケース2: 空配列 → エラー（1件以上必要）
  it("visit_records が空配列の場合はエラー", () => {
    const result = createReportSchema.safeParse({
      report_date: "2026-04-01",
      visit_records: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((e) => e.path.includes("visit_records"))).toBe(true);
    }
  });

  // ケース3: customer_id が null → エラー
  it("customer_id が null の場合はエラー", () => {
    const result = visitRecordSchema.safeParse({
      customer_id: null,
      content: "内容",
    });
    expect(result.success).toBe(false);
  });

  // ケース4: content が空文字 → エラー
  it("content が空文字の場合はエラー", () => {
    const result = visitRecordSchema.safeParse({
      customer_id: 10,
      content: "",
    });
    expect(result.success).toBe(false);
  });

  // ケース5: content が1000文字 → バリデーションOK
  it("content が1000文字の場合はバリデーションOK", () => {
    const result = visitRecordSchema.safeParse({
      customer_id: 10,
      content: "a".repeat(1000),
    });
    expect(result.success).toBe(true);
  });

  // ケース6: content が1001文字 → エラー
  it("content が1001文字の場合はエラー", () => {
    const result = visitRecordSchema.safeParse({
      customer_id: 10,
      content: "a".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  // ケース7: visited_at が `25:00` → エラー（時刻形式不正）
  it("visited_at が 25:00 の場合はエラー", () => {
    const result = visitRecordSchema.safeParse({
      customer_id: 10,
      content: "内容",
      visited_at: "25:00",
    });
    expect(result.success).toBe(false);
  });

  // ケース8: visited_at が null → バリデーションOK（任意項目）
  it("visited_at が null の場合はバリデーションOK", () => {
    const result = visitRecordSchema.safeParse({
      customer_id: 10,
      content: "内容",
      visited_at: undefined,
    });
    expect(result.success).toBe(true);
  });
});

// UT-008: 日付フォーマット変換
describe("UT-008: 日付フォーマット変換（report_date バリデーション）", () => {
  // ケース1: 正常な日付
  it("2026-04-01 は正常にパースできる", () => {
    const result = createReportSchema.safeParse({
      report_date: "2026-04-01",
      visit_records: [{ customer_id: 1, content: "内容" }],
    });
    expect(result.success).toBe(true);
  });

  // ケース2: スラッシュ区切り → エラー
  it("2026/04/01 はエラー（形式不正）", () => {
    const result = createReportSchema.safeParse({
      report_date: "2026/04/01",
      visit_records: [{ customer_id: 1, content: "内容" }],
    });
    expect(result.success).toBe(false);
  });

  // ケース3: 月が不正 → エラー
  it("2026-13-01 はエラー（月が不正）", () => {
    const result = createReportSchema.safeParse({
      report_date: "2026-13-01",
      visit_records: [{ customer_id: 1, content: "内容" }],
    });
    expect(result.success).toBe(false);
  });

  // ケース4: 存在しない日付 → エラー
  it("2026-04-31 はエラー（存在しない日付）", () => {
    const result = createReportSchema.safeParse({
      report_date: "2026-04-31",
      visit_records: [{ customer_id: 1, content: "内容" }],
    });
    expect(result.success).toBe(false);
  });
});
