import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/src/lib/auth/jwt";
import { isBlacklisted } from "@/src/lib/auth/token-blacklist";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Role = "sales" | "manager" | "admin";

export type Action =
  | "create_report"
  | "post_comment"
  | "manage_customers"
  | "manage_users";

/**
 * 認証済みユーザーの型。
 * Prisma の User モデルから機密情報（passwordHash）を除いたもの。
 */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  departmentId: number | null;
}

// ---------------------------------------------------------------------------
// Permission matrix (UT-006 対応)
// ---------------------------------------------------------------------------

const PERMISSION_MAP: Record<Action, Role[]> = {
  create_report: ["sales"],
  post_comment: ["manager", "admin"],
  manage_customers: ["manager", "admin"],
  manage_users: ["admin"],
};

/**
 * ユーザーが指定したアクションを実行する権限を持つか確認する。
 *
 * UT-006 の 8 ケース全対応:
 *   1. sales    + create_report    → true
 *   2. manager  + create_report    → false
 *   3. manager  + post_comment     → true
 *   4. sales    + post_comment     → false
 *   5. admin    + manage_users     → true
 *   6. manager  + manage_users     → false
 *   7. sales    + manage_customers → false
 *   8. manager  + manage_customers → true
 */
export function hasPermission(user: AuthUser, action: Action): boolean {
  return PERMISSION_MAP[action].includes(user.role);
}

// ---------------------------------------------------------------------------
// AuthError
// ---------------------------------------------------------------------------

export class AuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

// ---------------------------------------------------------------------------
// Token extraction helper
// ---------------------------------------------------------------------------

function extractBearerToken(req: NextRequest): string | null {
  const authorization = req.headers.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }
  const token = authorization.slice(7).trim();
  return token.length > 0 ? token : null;
}

// ---------------------------------------------------------------------------
// getAuthUser
// ---------------------------------------------------------------------------

/**
 * リクエストの Authorization ヘッダーからトークンを検証し、
 * 認証済みユーザーを返す。
 *
 * Prisma クライアントを動的にインポートすることで、
 * テスト時の不要な初期化を回避する。
 *
 * 失敗した場合は AuthError をスローする。呼び出し側で catch して 401 を返すこと。
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser> {
  const token = extractBearerToken(req);
  if (!token) {
    throw new AuthError("UNAUTHORIZED", "認証トークンが指定されていません");
  }

  if (isBlacklisted(token)) {
    throw new AuthError("UNAUTHORIZED", "無効なトークンです");
  }

  let userId: number;
  try {
    const payload = await verifyToken(token);
    userId = payload.userId;
  } catch {
    throw new AuthError("UNAUTHORIZED", "トークンが無効または期限切れです");
  }

  // Prisma を動的インポートして、モジュールロード時の初期化エラーを回避する
  const { prisma } = await import("@/src/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
    },
  });

  if (!user) {
    throw new AuthError("UNAUTHORIZED", "ユーザーが存在しません");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    departmentId: user.departmentId,
  };
}

// ---------------------------------------------------------------------------
// requireAuth helper — for use inside route handlers
// ---------------------------------------------------------------------------

/**
 * ルートハンドラー内でユーザーを取得し、失敗時に 401 レスポンスを返す。
 *
 * @example
 * ```ts
 * export async function GET(req: NextRequest) {
 *   const result = await requireAuth(req);
 *   if (result.error) return result.error;
 *   const { user } = result;
 *   // ... use user
 * }
 * ```
 */
export async function requireAuth(
  req: NextRequest,
): Promise<
  { user: AuthUser; error: null } | { user: null; error: NextResponse }
> {
  try {
    const user = await getAuthUser(req);
    return { user, error: null };
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        user: null,
        error: NextResponse.json(
          { error: { code: err.code, message: err.message } },
          { status: 401 },
        ),
      };
    }
    return {
      user: null,
      error: NextResponse.json(
        {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "サーバーエラーが発生しました",
          },
        },
        { status: 500 },
      ),
    };
  }
}

/**
 * ロール違反時に 403 レスポンスを返すヘルパー。
 */
export function forbiddenResponse(
  message = "操作する権限がありません",
): NextResponse {
  return NextResponse.json(
    { error: { code: "FORBIDDEN", message } },
    { status: 403 },
  );
}
