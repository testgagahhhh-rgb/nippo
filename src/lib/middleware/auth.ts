import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type JwtPayload } from "@/src/lib/auth/jwt";

export type AuthenticatedHandler = (req: NextRequest, user: JwtPayload) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です" } },
        { status: 401 },
      );
    }

    const token = authHeader.slice(7);
    try {
      const user = await verifyToken(token);
      return handler(req, user);
    } catch {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "トークンが無効です" } },
        { status: 401 },
      );
    }
  };
}

export function requireRole(
  roles: Array<"sales" | "manager" | "admin">,
  handler: AuthenticatedHandler,
): AuthenticatedHandler {
  return async (req, user) => {
    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "権限がありません" } },
        { status: 403 },
      );
    }
    return handler(req, user);
  };
}
