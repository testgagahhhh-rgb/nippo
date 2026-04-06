import { PrismaClient, Role, ReportStatus, CommentTargetType } from "@prisma/client";
import type { User, DailyReport, VisitRecord, Comment } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function createTestUser(
  role: Role,
  overrides: Partial<{
    name: string;
    email: string;
    password: string;
    departmentId: number | null;
  }> = {}
): Promise<User> {
  const passwordHash = await bcrypt.hash(overrides.password ?? "password123", 10);
  const unique = Date.now() + Math.random().toString(36).slice(2);
  return prisma.user.create({
    data: {
      name: overrides.name ?? `TestUser_${unique}`,
      email: overrides.email ?? `test_${unique}@example.com`,
      passwordHash,
      role,
      departmentId: overrides.departmentId !== undefined ? overrides.departmentId : null,
    },
  });
}

export async function createTestReport(
  userId: number,
  opts: Partial<{
    reportDate: Date;
    status: ReportStatus;
    problem: string | null;
    plan: string | null;
  }> = {}
): Promise<DailyReport> {
  return prisma.dailyReport.create({
    data: {
      userId,
      reportDate: opts.reportDate ?? new Date(),
      status: opts.status ?? "draft",
      problem: opts.problem ?? null,
      plan: opts.plan ?? null,
    },
  });
}

export async function createTestVisitRecord(
  reportId: number,
  customerId: number,
  overrides: Partial<{
    content: string;
    visitedAt: string | null;
  }> = {}
): Promise<VisitRecord> {
  return prisma.visitRecord.create({
    data: {
      reportId,
      customerId,
      content: overrides.content ?? "テスト訪問記録",
      visitedAt: overrides.visitedAt !== undefined ? overrides.visitedAt : null,
    },
  });
}

export async function createTestComment(
  reportId: number,
  userId: number,
  targetType: CommentTargetType,
  content = "テストコメント"
): Promise<Comment> {
  return prisma.comment.create({
    data: { reportId, userId, targetType, content },
  });
}

export async function cleanupDatabase(): Promise<void> {
  await prisma.comment.deleteMany();
  await prisma.visitRecord.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
}

export { prisma };
