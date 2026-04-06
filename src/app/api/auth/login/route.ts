import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "メールアドレスとパスワードは必須です",
        },
      },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { department: true },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_CREDENTIALS",
          message: "メールアドレスまたはパスワードが不正です",
        },
      },
      { status: 401 },
    );
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  });

  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

  return NextResponse.json({
    data: {
      token,
      expires_at: expiresAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: {
          id: user.department.id,
          name: user.department.name,
        },
      },
    },
  });
}
