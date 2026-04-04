import { getDb } from "@/src/lib/db";
import { verifyPassword } from "@/src/lib/password";
import { generateToken } from "@/src/lib/jwt";

export type LoginResult =
  | { success: true; token: string; user: { id: number; name: string; role: string } }
  | { success: false; error: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  const db = getDb();
  const user = db.users.find((u) => u.email === email);

  if (!user) {
    return { success: false, error: "メールアドレスまたはパスワードが正しくありません" };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { success: false, error: "メールアドレスまたはパスワードが正しくありません" };
  }

  const token = await generateToken(user.id);
  return {
    success: true,
    token,
    user: { id: user.id, name: user.name, role: user.role },
  };
}
