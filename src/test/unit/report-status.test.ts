import { describe, it, expect } from "vitest";
import { canSubmitReport, canEditReport } from "@/lib/report-status";

describe("UT-005 日報ステータス遷移バリデーション", () => {
  it("status=draft、本人 → 提出可能", () => {
    const report = { status: "draft" as const, userId: 1 };
    expect(canSubmitReport(report)).toBe(true);
  });

  it("status=submitted、本人 → 提出不可", () => {
    const report = { status: "submitted" as const, userId: 1 };
    expect(canSubmitReport(report)).toBe(false);
  });

  it("status=draft、本人 → 編集可能", () => {
    const report = { status: "draft" as const, userId: 1 };
    expect(canEditReport(report, 1)).toBe(true);
  });

  it("status=submitted、本人 → 編集不可", () => {
    const report = { status: "submitted" as const, userId: 1 };
    expect(canEditReport(report, 1)).toBe(false);
  });

  it("status=draft、他人 → 編集不可", () => {
    const report = { status: "draft" as const, userId: 1 };
    expect(canEditReport(report, 2)).toBe(false);
  });
});
