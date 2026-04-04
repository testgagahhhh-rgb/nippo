import { NextRequest, NextResponse } from "next/server";
import { requireAuth, hasPermission, forbiddenResponse } from "@/src/lib/middleware/auth";
import { createReportSchema } from "@/src/lib/schemas/report";
import { ZodError } from "zod";

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
      // SELECT FOR UPDATE で同日の日報をロック
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
