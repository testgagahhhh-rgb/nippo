import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, authorizeRole, type AuthUser } from "@/lib/middleware/auth";
import { createReportSchema } from "@/lib/schemas/report";

class ReportAlreadyExistsError extends Error {
  constructor() {
    super("Report already exists");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;
  const user: AuthUser = authResult;

  const roleError = authorizeRole(user, ["sales"]);
  if (roleError) return roleError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "リクエストボディが不正です" } },
      { status: 400 },
    );
  }

  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "入力値が不正です",
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  const { report_date, visit_records, problem, plan } = parsed.data;

  try {
    const report = await prisma.$transaction(async (tx) => {
      // 同日の日報チェック（トランザクション内でレースコンディション防止）
      const existing = await tx.dailyReport.findUnique({
        where: {
          userId_reportDate: {
            userId: user.sub,
            reportDate: new Date(report_date),
          },
        },
      });

      if (existing) {
        throw new ReportAlreadyExistsError();
      }

      return tx.dailyReport.create({
        data: {
          userId: user.sub,
          reportDate: new Date(report_date),
          status: "draft",
          problem: problem ?? null,
          plan: plan ?? null,
          visitRecords: {
            create: visit_records.map((vr) => ({
              customerId: vr.customer_id,
              content: vr.content,
              visitedAt: vr.visited_at ?? null,
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
          comments: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        data: formatReportResponse(report),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ReportAlreadyExistsError) {
      return NextResponse.json(
        { error: { code: "REPORT_ALREADY_EXISTS", message: "同日の日報が既に存在します" } },
        { status: 422 },
      );
    }
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatReportResponse(report: any) {
  return {
    id: report.id,
    report_date: report.reportDate.toISOString().split("T")[0],
    status: report.status,
    submitted_at: report.submittedAt?.toISOString() ?? null,
    user: {
      id: report.user.id,
      name: report.user.name,
    },
    visit_records: report.visitRecords.map(formatVisitRecord),
    problem: report.problem,
    plan: report.plan,
    comments: report.comments.map(formatComment),
    created_at: report.createdAt.toISOString(),
    updated_at: report.updatedAt.toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatVisitRecord(vr: any) {
  return {
    id: vr.id,
    customer: {
      id: vr.customer.id,
      name: vr.customer.name,
      company_name: vr.customer.companyName,
    },
    content: vr.content,
    visited_at: vr.visitedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatComment(comment: any) {
  return {
    id: comment.id,
    target_type: comment.targetType,
    content: comment.content,
    user: {
      id: comment.user.id,
      name: comment.user.name,
    },
    created_at: comment.createdAt.toISOString(),
  };
}

export { formatReportResponse, formatVisitRecord, formatComment };
