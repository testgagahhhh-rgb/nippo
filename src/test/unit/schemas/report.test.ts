import { describe, it, expect } from "vitest";
import { createReportSchema, reportListQuerySchema } from "@/lib/schemas/report";

describe("createReportSchema", () => {
  const validInput = {
    report_date: "2026-04-01",
    visit_records: [
      {
        customer_id: 1,
        content: "新製品の提案を実施",
        visited_at: "10:00",
      },
    ],
    problem: "課題テスト",
    plan: "計画テスト",
  };

  it("正常な入力を受け付ける", () => {
    const result = createReportSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("report_dateが必須", () => {
    const { report_date: _, ...input } = validInput;
    const result = createReportSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("report_dateがYYYY-MM-DD形式でなければエラー", () => {
    const result = createReportSchema.safeParse({
      ...validInput,
      report_date: "2026/04/01",
    });
    expect(result.success).toBe(false);
  });

  it("visit_recordsが空配列ならエラー", () => {
    const result = createReportSchema.safeParse({
      ...validInput,
      visit_records: [],
    });
    expect(result.success).toBe(false);
  });

  it("visit_records[].contentが1001文字以上ならエラー", () => {
    const result = createReportSchema.safeParse({
      ...validInput,
      visit_records: [
        {
          customer_id: 1,
          content: "a".repeat(1001),
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("problemが2001文字以上ならエラー", () => {
    const result = createReportSchema.safeParse({
      ...validInput,
      problem: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("visited_atがHH:MM形式でなければエラー", () => {
    const result = createReportSchema.safeParse({
      ...validInput,
      visit_records: [
        {
          customer_id: 1,
          content: "テスト",
          visited_at: "25:00:00",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("visited_atがnullでも許可される", () => {
    const result = createReportSchema.safeParse({
      ...validInput,
      visit_records: [
        {
          customer_id: 1,
          content: "テスト",
          visited_at: null,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("problem/planが省略可能", () => {
    const result = createReportSchema.safeParse({
      report_date: "2026-04-01",
      visit_records: [{ customer_id: 1, content: "テスト" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("reportListQuerySchema", () => {
  it("デフォルト値が適用される", () => {
    const result = reportListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(20);
    }
  });

  it("文字列のpage/per_pageが数値に変換される", () => {
    const result = reportListQuerySchema.safeParse({ page: "2", per_page: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.per_page).toBe(50);
    }
  });

  it("per_pageが100を超えるとエラー", () => {
    const result = reportListQuerySchema.safeParse({ per_page: "101" });
    expect(result.success).toBe(false);
  });

  it("year_monthがYYYY-MM形式でなければエラー", () => {
    const result = reportListQuerySchema.safeParse({ year_month: "2026/04" });
    expect(result.success).toBe(false);
  });

  it("statusがdraft/submitted以外ならエラー", () => {
    const result = reportListQuerySchema.safeParse({ status: "invalid" });
    expect(result.success).toBe(false);
  });

  it("正常なフィルタパラメータを受け付ける", () => {
    const result = reportListQuerySchema.safeParse({
      page: "1",
      per_page: "20",
      year_month: "2026-04",
      user_id: "1",
      status: "submitted",
    });
    expect(result.success).toBe(true);
  });
});
