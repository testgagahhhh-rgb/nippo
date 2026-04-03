import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/src/lib/auth/jwt";
import { addToBlacklist, isBlacklisted } from "@/src/lib/auth/token-blacklist";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "認証トークンが必要です" } },
      { status: 401 },
    );
  }

  const token = authHeader.slice(7);

  if (isBlacklisted(token)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "無効なトークンです" } },
      { status: 401 },
    );
  }

  try {
    await verifyToken(token);
  } catch {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "無効なトークンです" } },
      { status: 401 },
    );
  }

  addToBlacklist(token);

  return NextResponse.json({
    data: { message: "ログアウトしました" },
  });
}
