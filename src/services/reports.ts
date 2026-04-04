import { getDb, nextId } from "@/src/lib/db";
import type { DbDailyReport, DbVisitRecord } from "@/src/lib/db";

export type CreateReportInput = {
  report_date: string;
  visit_records: {
    customer_id: number;
    content: string;
    visited_at?: string | null;
  }[];
  problem: string;
  plan: string;
};

export type UpdateReportInput = {
  visit_records: {
    id?: number;
    customer_id: number;
    content: string;
    visited_at?: string | null;
  }[];
  problem?: string;
  plan?: string;
};

export type ReportWithRecords = DbDailyReport & {
  visit_records: DbVisitRecord[];
  comments: {
    id: number;
    user_id: number;
    target_type: string;
    content: string;
    created_at: string;
  }[];
};

export type GetReportsResult = {
  data: DbDailyReport[];
  meta: { total: number; page: number; per_page: number };
};

export class ReportAlreadyExistsError extends Error {
  code = "REPORT_ALREADY_EXISTS" as const;
  constructor() {
    super("同じ日付の日報が既に存在します");
    this.name = "ReportAlreadyExistsError";
  }
}

/**
 * 日報を作成する
 */
export function createReport(
  userId: number,
  input: CreateReportInput,
): DbDailyReport & { visit_records: DbVisitRecord[] } {
  const db = getDb();

  // 同日重複チェック
  const existing = db.daily_reports.find(
    (r) => r.user_id === userId && r.report_date === input.report_date,
  );
  if (existing) {
    throw new ReportAlreadyExistsError();
  }

  const now = new Date().toISOString();
  const reportId = nextId("daily_reports");

  const report: DbDailyReport = {
    id: reportId,
    user_id: userId,
    report_date: input.report_date,
    status: "draft",
    problem: input.problem,
    plan: input.plan,
    submitted_at: null,
    created_at: now,
    updated_at: now,
  };

  db.daily_reports.push(report);

  const visitRecords: DbVisitRecord[] = input.visit_records.map((vr) => {
    const record: DbVisitRecord = {
      id: nextId("visit_records"),
      report_id: reportId,
      customer_id: vr.customer_id,
      content: vr.content,
      visited_at: vr.visited_at ?? null,
    };
    db.visit_records.push(record);
    return record;
  });

  return { ...report, visit_records: visitRecords };
}

/**
 * 日報一覧を取得する（ページネーション付き）
 */
export function getReports(params: {
  user_id?: number;
  page?: number;
  per_page?: number;
}): GetReportsResult {
  const db = getDb();
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 20;

  let filtered = db.daily_reports;
  if (params.user_id !== undefined) {
    filtered = filtered.filter((r) => r.user_id === params.user_id);
  }

  // 日付降順でソート
  filtered = [...filtered].sort(
    (a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime(),
  );

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const data = filtered.slice(start, start + perPage);

  return {
    data,
    meta: { total, page, per_page: perPage },
  };
}

/**
 * 日報を1件取得する（訪問記録・コメント付き）
 */
export function getReport(reportId: number): ReportWithRecords | null {
  const db = getDb();
  const report = db.daily_reports.find((r) => r.id === reportId);
  if (!report) return null;

  const visitRecords = db.visit_records.filter((vr) => vr.report_id === reportId);
  const comments = db.comments
    .filter((c) => c.report_id === reportId)
    .map((c) => ({
      id: c.id,
      user_id: c.user_id,
      target_type: c.target_type,
      content: c.content,
      created_at: c.created_at,
    }));

  return { ...report, visit_records: visitRecords, comments };
}

/**
 * 日報を更新する（訪問記録の差分更新を含む）
 */
export function updateReport(
  reportId: number,
  userId: number,
  input: UpdateReportInput,
): ReportWithRecords | null {
  const db = getDb();
  const reportIndex = db.daily_reports.findIndex((r) => r.id === reportId);
  if (reportIndex === -1) return null;

  const report = db.daily_reports[reportIndex];
  if (report.user_id !== userId || report.status !== "draft") {
    return null;
  }

  // 日報のフィールドを更新
  const now = new Date().toISOString();
  if (input.problem !== undefined) report.problem = input.problem;
  if (input.plan !== undefined) report.plan = input.plan;
  report.updated_at = now;

  // 訪問記録の差分更新
  const sentIds = new Set<number>();
  const newVisitRecords: DbVisitRecord[] = [];

  for (const vr of input.visit_records) {
    if (vr.id !== undefined) {
      // 既存レコードの更新
      sentIds.add(vr.id);
      const existingIndex = db.visit_records.findIndex(
        (r) => r.id === vr.id && r.report_id === reportId,
      );
      if (existingIndex !== -1) {
        db.visit_records[existingIndex] = {
          ...db.visit_records[existingIndex],
          customer_id: vr.customer_id,
          content: vr.content,
          visited_at: vr.visited_at ?? null,
        };
        newVisitRecords.push(db.visit_records[existingIndex]);
      }
    } else {
      // 新規レコード追加
      const record: DbVisitRecord = {
        id: nextId("visit_records"),
        report_id: reportId,
        customer_id: vr.customer_id,
        content: vr.content,
        visited_at: vr.visited_at ?? null,
      };
      db.visit_records.push(record);
      newVisitRecords.push(record);
    }
  }

  // 送信されなかった既存レコードを削除
  const toRemove = db.visit_records.filter(
    (r) =>
      r.report_id === reportId &&
      !sentIds.has(r.id) &&
      !newVisitRecords.some((nr) => nr.id === r.id),
  );
  for (const r of toRemove) {
    const idx = db.visit_records.indexOf(r);
    if (idx !== -1) db.visit_records.splice(idx, 1);
  }

  const comments = db.comments
    .filter((c) => c.report_id === reportId)
    .map((c) => ({
      id: c.id,
      user_id: c.user_id,
      target_type: c.target_type,
      content: c.content,
      created_at: c.created_at,
    }));

  return {
    ...report,
    visit_records: db.visit_records.filter((vr) => vr.report_id === reportId),
    comments,
  };
}

/**
 * 日報を提出する
 */
export function submitReport(reportId: number, userId: number): DbDailyReport | null {
  const db = getDb();
  const report = db.daily_reports.find((r) => r.id === reportId);
  if (!report) return null;
  if (report.user_id !== userId || report.status !== "draft") return null;

  report.status = "submitted";
  report.submitted_at = new Date().toISOString();
  report.updated_at = report.submitted_at;

  return report;
}
