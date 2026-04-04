import { verifyToken } from "@/src/lib/jwt";

export type AuthResult =
  | { success: true; userId: number }
  | { success: false; error: string; status: number };

/**
 * Authorization ヘッダーの Bearer トークンを検証する
 */
export async function authenticateToken(
  authHeader: string | null | undefined,
): Promise<AuthResult> {
  if (!authHeader) {
    return { success: false, error: "認証ヘッダーがありません", status: 401 };
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return { success: false, error: "認証ヘッダーの形式が不正です", status: 401 };
  }

  const token = parts[1];

  try {
    const payload = await verifyToken(token);
    return { success: true, userId: payload.userId };
  } catch {
    return { success: false, error: "トークンが無効です", status: 401 };
  }
}
