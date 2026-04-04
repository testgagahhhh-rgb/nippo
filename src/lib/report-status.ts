type Report = {
  status: string;
  user_id: number;
};

/**
 * 日報を提出できるかチェックする
 * - 下書き状態かつ本人のみ提出可能
 */
export function canSubmitReport(report: Report, userId: number): boolean {
  return report.status === "draft" && report.user_id === userId;
}

/**
 * 日報を編集できるかチェックする
 * - 下書き状態かつ本人のみ編集可能
 */
export function canEditReport(report: Report, userId: number): boolean {
  return report.status === "draft" && report.user_id === userId;
}
