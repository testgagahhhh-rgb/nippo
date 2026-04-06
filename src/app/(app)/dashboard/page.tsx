import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/src/lib/auth";
import { getReports, getFilterUsers } from "@/src/lib/mockData";
import { FilterBar } from "@/src/components/dashboard/FilterBar";
import { ReportList } from "@/src/components/dashboard/ReportList";
import { Pagination } from "@/src/components/dashboard/Pagination";

interface DashboardPageProps {
  searchParams: Promise<{
    page?: string;
    year_month?: string;
    user_id?: string;
    status?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const user = getCurrentUser();
  const filterUsers = getFilterUsers();

  const page = Number(params.page) || 1;
  const userIdParam = params.user_id ? Number(params.user_id) : undefined;

  // Sales users can only see their own reports
  const effectiveUserId = user.role === "sales" ? user.id : userIdParam;

  const { data: reports, meta } = getReports({
    page,
    per_page: 20,
    year_month: params.year_month,
    user_id: effectiveUserId,
    status: params.status,
  });

  const showCreateButton = user.role === "sales";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">日報一覧</h2>
        {showCreateButton && (
          <Link
            href="/reports/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            + 日報を作成
          </Link>
        )}
      </div>

      <div className="mb-4">
        <Suspense fallback={null}>
          <FilterBar role={user.role} users={filterUsers} />
        </Suspense>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <ReportList reports={reports} role={user.role} />
        <Pagination meta={meta} />
      </div>
    </div>
  );
}
