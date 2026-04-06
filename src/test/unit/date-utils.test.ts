import { describe, it, expect } from "vitest";
import { parseReportDate } from "@/lib/date-utils";

describe("UT-008 日付フォーマット変換", () => {
  it("YYYY-MM-DD形式をDateオブジェクトに変換できる", () => {
    const date = parseReportDate("2026-04-01");
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(3); // 0-indexed
    expect(date.getDate()).toBe(1);
  });

  it("スラッシュ区切りはエラー", () => {
    expect(() => parseReportDate("2026/04/01")).toThrow();
  });

  it("月が不正（13月）の場合エラー", () => {
    expect(() => parseReportDate("2026-13-01")).toThrow();
  });

  it("存在しない日付（4月31日）の場合エラー", () => {
    expect(() => parseReportDate("2026-04-31")).toThrow();
  });
});
