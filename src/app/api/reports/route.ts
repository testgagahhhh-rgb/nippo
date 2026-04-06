import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  requireAuth,
  hasPermission,
  forbiddenResponse,
  type AuthUser,
} from "@/src/lib/middleware/auth";
import { listReportsQuerySchema, createReportSchema } from "@/src/lib/schemas/report";
import type { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// GET /api/reports — 日報一覧取得
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;
  const { user } = authResult;

  // クエリパラメータのパース・バリデーション
  const rawParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  let query;
  try {
    query = listReportsQuerySchema.parse(rawParams);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "クエリパラメータが不正です",
            details: err.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
        },
        { status: 400 },
      );
    }
    throw err;
  }

  const { prisma } = await import("@/src/lib/prisma");

  // manager が user_id を指定した場合、同一部署のユーザーであることを検証する
  if (query.user_id !== undefined && user.role === "manager") {
    if (user.departmentId === null) {
      return forbiddenResponse("部署が設定されていないため、user_id による絞り込みはできません");
    }
    const targetUser = await prisma.user.findUnique({
      where: { id: query.user_id },
      select: { departmentId: true },
    });
    if (!targetUser || targetUser.departmentId !== user.departmentId) {
      return forbiddenResponse("指定されたユーザーは同一部署に所属していません");
    }
  }

  // ロール別の WHERE 条件を構築する
  const where = buildWhereClause(user, query);

  const skip = (query.page - 1) * query.per_page;
  const take = query.per_page;

  // total と data を並行取得してN+1を回避する
  const [total, reports] = await Promise.all([
    prisma.dailyReport.count({ where }),
    prisma.dailyReport.findMany({
      where,
      orderBy: { reportDate: "desc" },
      skip,
      take,
      select: {
        id: true,
        reportDate: true,
        status: true,
        submittedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, name: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    }),
  ]);

  const data = reports.map((report) => ({
    id: report.id,
    report_date: report.reportDate.toISOString().slice(0, 10),
    status: report.status,
    submitted_at: report.submittedAt?.toISOString() ?? null,
    user: report.user,
    // 提出済みかつコメントが0件の場合が「未コメント」（has_unread_comment = true）
    has_unread_comment: report.status === "submitted" && report._count.comments === 0,
    created_at: report.createdAt.toISOString(),
    updated_at: report.updatedAt.toISOString(),
  }));

  return NextResponse.json({
    data,
    meta: {
      total,
      page: query.page,
      per_page: query.per_page,
    },
  });
}

// ---------------------------------------------------------------------------
// WHERE 句ビルダー
// ---------------------------------------------------------------------------

function buildWhereClause(
  user: AuthUser,
  query: {
    year_month?: string;
    user_id?: number;
    status?: "draft" | "submitted";
  },
): Prisma.DailyReportWhereInput {
  const where: Prisma.DailyReportWhereInput = {};

  // ロール別のスコープ
  if (user.role === "sales") {
    // sales は自分の日報のみ。user_id パラメータは無視する。
    where.userId = user.id;
  } else if (user.role === "manager") {
    if (query.user_id !== undefined) {
      // 同一部署のユーザーに絞り込む（部署検証は呼び出し元で実施済み）
      where.userId = query.user_id;
    } else {
      // 同一部署の全ユーザーの日報
      where.user = {
        departmentId: user.departmentId ?? undefined,
      };
    }
  }
  // admin はスコープなし（全件）

  // year_month フィルター: YYYY-MM → reportDate >= YYYY-MM-01 AND < YYYY-(MM+1)-01
  if (query.year_month !== undefined) {
    const [year, month] = query.year_month.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1); // 翌月1日（排他）
    where.reportDate = { gte: start, lt: end };
  }

  // status フィルター
  if (query.status !== undefined) {
    where.status = query.status;
  }

  return where;
}

// ---------------------------------------------------------------------------
// POST /api/reports — 日報作成
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;
  const { user } = authResult;

  // ロールチェック（sales のみ）
  if (!hasPermission(user, "create_report")) {
    return forbiddenResponse();
  }

  // リクエストボディのパース
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "リクエストボディが不正です" } },
      { status: 400 },
    );
  }

  // Zod バリデーション
  let input;
  try {
    input = createReportSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "入力値が不正です",
            details: err.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
        },
        { status: 400 },
      );
    }
    throw err;
  }

  const { prisma } = await import("@/src/lib/prisma");

  // 顧客IDの存在チェック
  const customerIds = [...new Set(input.visit_records.map((r) => r.customer_id))];
  const existingCustomers = await prisma.customer.findMany({
    where: { id: { in: customerIds } },
    select: { id: true },
  });
  const existingCustomerIds = new Set(existingCustomers.map((c) => c.id));
  const invalidCustomerIds = customerIds.filter((id) => !existingCustomerIds.has(id));
  if (invalidCustomerIds.length > 0) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: `存在しない顧客IDが含まれています: ${invalidCustomerIds.join(", ")}`,
        },
      },
      { status: 400 },
    );
  }

  const reportDate = new Date(input.report_date);

  // トランザクションで日報と訪問記録を挿入
  // SELECT FOR UPDATE で同日重複のレースコンディションを防ぐ
  let report;
  try {
    report = await prisma.$transaction(async (tx) => {
      const existing = await tx.$queryRaw<{ id: number }[]>`
        SELECT id FROM daily_reports
        WHERE user_id = ${user.id}
          AND report_date = ${reportDate}::date
        FOR UPDATE
      `;
      if (existing.length > 0) {
        throw new DuplicateReportError();
      }

      const created = await tx.dailyReport.create({
        data: {
          userId: user.id,
          reportDate,
          status: "draft",
          problem: input.problem ?? null,
          plan: input.plan ?? null,
          visitRecords: {
            create: input.visit_records.map((r) => ({
              customerId: r.customer_id,
              content: r.content,
              visitedAt: r.visited_at ?? null,
            })),
          },
        },
        include: {
          user: { select: { id: true, name: true } },
          visitRecords: {
            include: {
              customer: { select: { id: true, name: true, companyName: true } },
            },
          },
          comments: true,
        },
      });

      return created;
    });
  } catch (err) {
    if (err instanceof DuplicateReportError) {
      return NextResponse.json(
        { error: { code: "REPORT_ALREADY_EXISTS", message: "同日の日報が既に存在します" } },
        { status: 422 },
      );
    }
    throw err;
  }

  return NextResponse.json(
    {
      data: {
        id: report.id,
        report_date: report.reportDate.toISOString().slice(0, 10),
        status: report.status,
        submitted_at: report.submittedAt?.toISOString() ?? null,
        user: report.user,
        visit_records: report.visitRecords.map((vr) => ({
          id: vr.id,
          customer: {
            id: vr.customer.id,
            name: vr.customer.name,
            company_name: vr.customer.companyName,
          },
          content: vr.content,
          visited_at: vr.visitedAt ?? null,
        })),
        problem: report.problem ?? null,
        plan: report.plan ?? null,
        comments: [],
        created_at: report.createdAt.toISOString(),
        updated_at: report.updatedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}

class DuplicateReportError extends Error {
  constructor() {
    super("REPORT_ALREADY_EXISTS");
  }
}
