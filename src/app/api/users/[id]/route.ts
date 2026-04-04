import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { withAuth, requireRole } from "@/src/lib/middleware/auth";
import { userUpdateSchema } from "@/src/lib/schemas/user";
import type { JwtPayload } from "@/src/lib/auth/jwt";
import type { User, Department } from "@prisma/client";

type UserWithDepartment = User & { department: Department | null };

function formatUser(u: UserWithDepartment) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department ? { id: u.department.id, name: u.department.name } : null,
    created_at: u.createdAt.toISOString(),
  };
}

type RouteContext = { params: Promise<{ id: string }> };

export function GET(req: NextRequest, ctx: RouteContext) {
  return withAuth(
    requireRole(["admin"], async (_req: NextRequest, _user: JwtPayload) => {
      const { id } = await ctx.params;
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "ユーザーが見つかりません" } },
          { status: 404 },
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { department: true },
      });
      if (!user) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "ユーザーが見つかりません" } },
          { status: 404 },
        );
      }

      return NextResponse.json({ data: formatUser(user) });
    }),
  )(req);
}

export function PUT(req: NextRequest, ctx: RouteContext) {
  return withAuth(
    requireRole(["admin"], async (req: NextRequest, _user: JwtPayload) => {
      const { id } = await ctx.params;
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "ユーザーが見つかりません" } },
          { status: 404 },
        );
      }

      const existing = await prisma.user.findUnique({ where: { id: userId } });
      if (!existing) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "ユーザーが見つかりません" } },
          { status: 404 },
        );
      }

      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { error: { code: "INVALID_JSON", message: "JSONが不正です" } },
          { status: 400 },
        );
      }

      const parsed = userUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "入力値が不正です",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const { name, email, password, role, department_id } = parsed.data;

      // メール重複チェック（変更時のみ）
      if (email && email !== existing.email) {
        const dup = await prisma.user.findUnique({ where: { email } });
        if (dup) {
          return NextResponse.json(
            {
              error: {
                code: "EMAIL_ALREADY_EXISTS",
                message: "このメールアドレスは既に使用されています",
              },
            },
            { status: 400 },
          );
        }
      }

      // 部署存在チェック
      if (department_id) {
        const dept = await prisma.department.findUnique({
          where: { id: department_id },
        });
        if (!dept) {
          return NextResponse.json(
            {
              error: {
                code: "DEPARTMENT_NOT_FOUND",
                message: "指定された部署が存在しません",
              },
            },
            { status: 400 },
          );
        }
      }

      const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(passwordHash !== undefined && { passwordHash }),
          ...(role !== undefined && { role }),
          ...(department_id !== undefined && { departmentId: department_id }),
        },
        include: { department: true },
      });

      return NextResponse.json({ data: formatUser(user) });
    }),
  )(req);
}
