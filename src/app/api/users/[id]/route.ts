export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, authorizeRole, type AuthUser } from "@/lib/middleware/auth";
import { updateUserSchema } from "@/lib/schemas/user";
import { hashPassword } from "@/lib/auth/password";
import { formatUser } from "@/app/api/users/route";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;
  const user: AuthUser = authResult;

  const roleError = authorizeRole(user, ["admin"]);
  if (roleError) return roleError;

  const { id } = await params;
  const userId = Number(id);
  if (isNaN(userId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "IDが不正です" } },
      { status: 400 },
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { department: { select: { id: true, name: true } } },
  });

  if (!targetUser) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "ユーザーが見つかりません" } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: formatUser(targetUser) });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;
  const user: AuthUser = authResult;

  const roleError = authorizeRole(user, ["admin"]);
  if (roleError) return roleError;

  const { id } = await params;
  const userId = Number(id);
  if (isNaN(userId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "IDが不正です" } },
      { status: 400 },
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
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "リクエストボディが不正です" } },
      { status: 400 },
    );
  }

  const parsed = updateUserSchema.safeParse(body);
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

  // メール変更時の重複チェック
  if (parsed.data.email && parsed.data.email !== existing.email) {
    const duplicate = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (duplicate) {
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

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.email !== undefined) data.email = parsed.data.email;
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.department_id !== undefined) data.departmentId = parsed.data.department_id;
  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    include: { department: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ data: formatUser(updatedUser) });
}
