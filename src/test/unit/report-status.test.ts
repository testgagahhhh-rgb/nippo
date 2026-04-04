import { canSubmitReport, canEditReport } from "@/src/lib/report-status";

describe("UT-005: 日報ステータス遷移", () => {
  it("status=draft, 本人 → canSubmit: true", () => {
    const report = { status: "draft", user_id: 1 };
    expect(canSubmitReport(report, 1)).toBe(true);
  });

  it("status=submitted, 本人 → canSubmit: false", () => {
    const report = { status: "submitted", user_id: 1 };
    expect(canSubmitReport(report, 1)).toBe(false);
  });

  it("status=draft, 本人 → canEdit: true", () => {
    const report = { status: "draft", user_id: 1 };
    expect(canEditReport(report, 1)).toBe(true);
  });

  it("status=submitted, 本人 → canEdit: false", () => {
    const report = { status: "submitted", user_id: 1 };
    expect(canEditReport(report, 1)).toBe(false);
  });

  it("status=draft, 他人 → canEdit: false", () => {
    const report = { status: "draft", user_id: 1 };
    expect(canEditReport(report, 2)).toBe(false);
  });
});
