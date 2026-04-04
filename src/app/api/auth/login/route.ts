import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { verifyPassword } from "@/src/lib/auth/password";
import { generateToken, getTokenExpiresAt } from "@/src/lib/auth/jwt";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json(
      { error: { code: "INVALID_CREDENTIALS", message: "メールアドレスまたはパスワードが不正です" } },
      { status: 401 },
    );
  }

  const { email, password } = body as { email: string; password: string };

  const user = await prisma.user.findUnique({
    where: { email },
    include: { department: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: { code: "INVALID_CREDENTIALS", message: "メールアドレスまたはパスワードが不正です" } },
      { status: 401 },
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: { code: "INVALID_CREDENTIALS", message: "メールアドレスまたはパスワードが不正です" } },
      { status: 401 },
    );
  }

  const token = await generateToken(user.id);
  const expiresAt = await getTokenExpiresAt();

  return NextResponse.json({
    data: {
      token,
      expires_at: expiresAt.toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
          ? { id: user.department.id, name: user.department.name }
          : null,
      },
    },
  });
}
