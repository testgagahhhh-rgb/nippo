import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/src/lib/auth/jwt";
import { isBlacklisted } from "@/src/lib/auth/token-blacklist";

/**
 * Next.js ミドルウェア。
 *
 * `/api/auth/login` 以外の全 `/api/**` ルートに適用し、
 * Bearer トークンを検証する。
 *
 * - トークン未指定 → 401 UNAUTHORIZED
 * - ブラックリスト済み → 401 UNAUTHORIZED
 * - 不正・期限切れトークン → 401 UNAUTHORIZED
 * - 有効なトークン → リクエストをそのまま通す
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const authorization = req.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "認証トークンが指定されていません",
        },
      },
      { status: 401 },
    );
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "認証トークンが指定されていません",
        },
      },
      { status: 401 },
    );
  }

  if (isBlacklisted(token)) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "無効なトークンです",
        },
      },
      { status: 401 },
    );
  }

  try {
    await verifyToken(token);
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "トークンが無効または期限切れです",
        },
      },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * `/api/auth/login` を除く全ての `/api/**` パスに適用する。
     * Next.js の matcher は正規表現ではなく glob パターン。
     * 否定先読みは使えないため、negative matcher を使う。
     */
    "/api/((?!auth/login).*)",
  ],
};
