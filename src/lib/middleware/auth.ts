import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type JwtPayload } from "@/lib/auth/jwt";
import { isTokenBlacklisted } from "@/lib/auth/token-blacklist";

export type AuthUser = JwtPayload;

/**
 * リクエストからJWTを検証し、ユーザー情報を返す。
 * 認証失敗時は NextResponse を返す。
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthUser | NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
      { status: 401 },
    );
  }

  const token = authHeader.slice(7);

  if (isTokenBlacklisted(token)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "トークンは無効化されています" } },
      { status: 401 },
    );
  }

  try {
    return await verifyToken(token);
  } catch {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "トークンが無効です" } },
      { status: 401 },
    );
  }
}

/**
 * ロールベースの認可チェック。
 * 許可されたロールに含まれない場合は 403 レスポンスを返す。
 */
export function authorizeRole(user: AuthUser, allowedRoles: string[]): NextResponse | null {
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "権限がありません" } },
      { status: 403 },
    );
  }
  return null;
}
