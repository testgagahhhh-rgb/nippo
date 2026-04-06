import type { ReportStatus } from "@/types";

interface ReportForStatus {
  status: ReportStatus;
  userId: number;
}

/**
 * 日報が提出可能か判定する
 * - draft 状態の場合のみ提出可能
 */
export function canSubmitReport(report: ReportForStatus): boolean {
  return report.status === "draft";
}

/**
 * 日報が編集可能か判定する
 * - draft 状態かつ本人のみ編集可能
 */
export function canEditReport(report: ReportForStatus, userId: number): boolean {
  return report.status === "draft" && report.userId === userId;
}
