import { NextRequest, NextResponse } from "next/server";
import { blacklistToken } from "@/lib/auth/token-blacklist";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token) {
    blacklistToken(token);
  }

  return NextResponse.json({
    data: {
      message: "ログアウトしました",
    },
  });
}
