import { getDb, nextId } from "@/src/lib/db";
import { hashPassword } from "@/src/lib/password";
import type { Role } from "@/src/types";
import type { DbUser } from "@/src/lib/db";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
  department_id: number;
};

/**
 * ユーザーを作成する
 */
export async function createUser(input: CreateUserInput): Promise<Omit<DbUser, "password_hash">> {
  const db = getDb();

  // メール重複チェック
  const existing = db.users.find((u) => u.email === input.email);
  if (existing) {
    throw new Error("このメールアドレスは既に使用されています");
  }

  const passwordHash = await hashPassword(input.password);
  const user: DbUser = {
    id: nextId("users"),
    name: input.name,
    email: input.email,
    password_hash: passwordHash,
    role: input.role,
    department_id: input.department_id,
  };

  db.users.push(user);

  const { password_hash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
