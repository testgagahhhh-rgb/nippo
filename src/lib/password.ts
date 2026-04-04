import { randomBytes, scryptSync } from "crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

/**
 * パスワードをハッシュ化する（scrypt使用）
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * パスワードとハッシュを照合する
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(":");
  const derivedHash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return hash === derivedHash;
}
