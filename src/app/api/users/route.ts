import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { withAuth, requireRole } from "@/src/lib/middleware/auth";
import { userCreateSchema, userListQuerySchema } from "@/src/lib/schemas/user";
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

export const GET = withAuth(
  requireRole(["admin"], async (req: NextRequest, _user: JwtPayload): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const parsed = userListQuerySchema.safeParse({
      role: searchParams.get("role") ?? undefined,
      department_id: searchParams.get("department_id") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      per_page: searchParams.get("per_page") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "クエリパラメータが不正です",
            details: parsed.error.issues,
          },
        },
        { status: 400 },
      );
    }

    const { role, department_id, page, per_page } = parsed.data;
    const skip = (page - 1) * per_page;

    const where = {
      ...(role && { role }),
      ...(department_id && { departmentId: department_id }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { department: true },
        skip,
        take: per_page,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users.map(formatUser),
      meta: { total, page, per_page },
    });
  }),
);

export const POST = withAuth(
  requireRole(["admin"], async (req: NextRequest, _user: JwtPayload): Promise<NextResponse> => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "JSONが不正です" } },
        { status: 400 },
      );
    }

    const parsed = userCreateSchema.safeParse(body);
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

    // メール重複チェック
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
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

    // 部署存在チェック（admin以外は必須）
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

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        departmentId: department_id ?? null,
      },
      include: { department: true },
    });

    return NextResponse.json({ data: formatUser(user) }, { status: 201 });
  }),
);
