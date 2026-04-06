import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, authorizeRole, type AuthUser } from "@/lib/middleware/auth";
import { createUserSchema, userListQuerySchema } from "@/lib/schemas/user";
import { hashPassword } from "@/lib/auth/password";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;
  const user: AuthUser = authResult;

  const roleError = authorizeRole(user, ["admin"]);
  if (roleError) return roleError;

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = userListQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "クエリパラメータが不正です",
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  const { role, department_id, page, per_page } = parsed.data;

  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;
  if (department_id) where.departmentId = department_id;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * per_page,
      take: per_page,
      include: { department: { select: { id: true, name: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    data: users.map(formatUser),
    meta: { total, page, per_page },
  });
}

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;
  const user: AuthUser = authResult;

  const roleError = authorizeRole(user, ["admin"]);
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

  const parsed = createUserSchema.safeParse(body);
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

  // メール重複チェック
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existingUser) {
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

  const passwordHash = await hashPassword(parsed.data.password);

  const newUser = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      departmentId: parsed.data.department_id,
    },
    include: { department: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ data: formatUser(newUser) }, { status: 201 });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department ? { id: user.department.id, name: user.department.name } : null,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  };
}

export { formatUser };
