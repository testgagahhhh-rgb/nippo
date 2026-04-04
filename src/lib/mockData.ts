import type { Report, ReportUser, ReportsResponse } from "@/src/types";

const users: ReportUser[] = [
  { id: 1, name: "山田太郎" },
  { id: 2, name: "鈴木花子" },
];

function generateReports(): Report[] {
  const reports: Report[] = [];
  let id = 1;

  // Generate reports for April 2026
  for (let day = 1; day <= 4; day++) {
    const dateStr = `2026-04-${String(day).padStart(2, "0")}`;
    for (const user of users) {
      const isSubmitted = day <= 3;
      reports.push({
        id: id++,
        report_date: dateStr,
        status: isSubmitted ? "submitted" : "draft",
        submitted_at: isSubmitted ? `${dateStr}T18:30:00+09:00` : null,
        user,
        has_unread_comment: isSubmitted && id % 3 === 0,
        created_at: `${dateStr}T09:00:00+09:00`,
        updated_at: `${dateStr}T18:30:00+09:00`,
      });
    }
  }

  // Generate reports for March 2026
  for (let day = 1; day <= 31; day++) {
    // Skip weekends (March 2026: 1=Sun, 7=Sat, 8=Sun, etc.)
    const date = new Date(2026, 2, day);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = `2026-03-${String(day).padStart(2, "0")}`;
    for (const user of users) {
      reports.push({
        id: id++,
        report_date: dateStr,
        status: "submitted",
        submitted_at: `${dateStr}T18:30:00+09:00`,
        user,
        has_unread_comment: id % 5 === 0,
        created_at: `${dateStr}T09:00:00+09:00`,
        updated_at: `${dateStr}T18:30:00+09:00`,
      });
    }
  }

  return reports;
}

const allReports = generateReports();

export function getReports(params: {
  page?: number;
  per_page?: number;
  year_month?: string;
  user_id?: number;
  status?: string;
}): ReportsResponse {
  const { page = 1, per_page = 20, year_month, user_id, status } = params;

  let filtered = allReports;

  if (year_month) {
    filtered = filtered.filter((r) => r.report_date.startsWith(year_month));
  }

  if (user_id) {
    filtered = filtered.filter((r) => r.user.id === user_id);
  }

  if (status) {
    filtered = filtered.filter((r) => r.status === status);
  }

  // Sort by date descending
  filtered = [...filtered].sort(
    (a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime(),
  );

  const total = filtered.length;
  const start = (page - 1) * per_page;
  const data = filtered.slice(start, start + per_page);

  return {
    data,
    meta: { total, page, per_page },
  };
}

/** List of users available for the user filter dropdown (manager/admin view) */
export function getFilterUsers(): ReportUser[] {
  return users;
}
