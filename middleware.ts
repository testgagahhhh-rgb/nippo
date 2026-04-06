import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { isTokenBlacklisted } from "@/lib/auth/token-blacklist";

const PUBLIC_PATHS = ["/api/auth/login", "/api/auth/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API以外、または公開パスはスキップ
  if (!pathname.startsWith("/api/") || PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

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
    const payload = await verifyToken(token);

    // ペイロードをヘッダーに詰めて下流の Route Handler に渡す
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.sub));
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-department-id", String(payload.departmentId));

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "トークンが無効です" } },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
