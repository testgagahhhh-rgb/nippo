import { parseReportDate } from "@/src/lib/date-utils";

describe("UT-008: 日付フォーマット変換", () => {
  it("'2026-04-01'をDateオブジェクトに変換できる", () => {
    const date = parseReportDate("2026-04-01");
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(3); // 0-indexed
    expect(date.getDate()).toBe(1);
  });

  it("スラッシュ区切り（'2026/04/01'）はエラーになる", () => {
    expect(() => parseReportDate("2026/04/01")).toThrow();
  });

  it("月が不正（'2026-13-01'）はエラーになる", () => {
    expect(() => parseReportDate("2026-13-01")).toThrow();
  });

  it("存在しない日付（'2026-04-31'）はエラーになる", () => {
    expect(() => parseReportDate("2026-04-31")).toThrow();
  });
});
