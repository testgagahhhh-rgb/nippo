import { NextRequest, NextResponse } from "next/server";
import { getDb, seedDb } from "@/src/lib/db";
import { verifyPassword } from "@/src/lib/password";
import { generateToken } from "@/src/lib/jwt";

/**
 * POST /api/auth/login
 *
 * インメモリDBからユーザーを検索してパスワード照合を行い、
 * JWTトークンを返す。DBが未シードの場合は自動でシードする。
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
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

    // インメモリDBが空の場合はシードする
    const db = getDb();
    if (db.users.length === 0) {
      await seedDb();
    }

    const user = getDb().users.find((u) => u.email === body.email);
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "メールアドレスまたはパスワードが正しくありません",
          },
        },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(body.password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "メールアドレスまたはパスワードが正しくありません",
          },
        },
        { status: 401 },
      );
    }

    const token = await generateToken(user.id);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const department = getDb().departments.find((d) => d.id === user.department_id);

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
            id: department?.id ?? 0,
            name: department?.name ?? "",
          },
        },
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "サーバーエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
}
