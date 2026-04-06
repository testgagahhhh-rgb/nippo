import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/src/lib/auth/jwt";
import { isBlacklisted } from "@/src/lib/auth/token-blacklist";

/**
 * Next.js ミドルウェア。
 *
 * - `/api/auth/login` は認証不要
 * - `/api/**` ルートは Bearer トークンを検証
 * - `/(app)/**` ページは cookie の auth-token をチェックし、
 *   無ければ `/login` にリダイレクト
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // --- API ルート ---
  if (pathname.startsWith("/api/")) {
    return handleApiAuth(req);
  }

  // --- アプリページルート ---
  return handlePageAuth(req);
}

/**
 * API ルートの認証処理。
 * Authorization ヘッダーの Bearer トークンを検証する。
 */
async function handleApiAuth(req: NextRequest): Promise<NextResponse> {
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

/**
 * ページルートの認証処理。
 * cookie の auth-token を検証し、無効なら /login にリダイレクトする。
 */
async function handlePageAuth(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isBlacklisted(token)) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await verifyToken(token);
  } catch {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * `/api/auth/login` と `/login` は認証不要。
     * `/api/**` はBearer トークン検証。
     * `/(app)/**` 配下のページは cookie 検証。
     *
     * 静的アセット (_next, favicon 等) は除外。
     */
    "/api/((?!auth/login).*)",
    "/dashboard/:path*",
    "/reports/:path*",
    "/customers/:path*",
  ],
};
