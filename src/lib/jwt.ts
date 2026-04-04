import { createHmac } from "crypto";

const SECRET = process.env.JWT_SECRET ?? "test-secret-key";
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1時間

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64").toString();
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

/**
 * JWTトークンを生成する
 */
export async function generateToken(userId: number): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      userId,
      exp: Date.now() + TOKEN_EXPIRY_MS,
    }),
  );
  const signature = sign(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

/**
 * JWTトークンを検証してペイロードを返す
 */
export async function verifyToken(token: string): Promise<{ userId: number }> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [header, payload, signature] = parts;
  const expectedSignature = sign(`${header}.${payload}`);

  if (signature !== expectedSignature) {
    throw new Error("Invalid token signature");
  }

  const decoded = JSON.parse(base64UrlDecode(payload)) as {
    userId: number;
    exp: number;
  };

  if (decoded.exp < Date.now()) {
    throw new Error("Token expired");
  }

  return { userId: decoded.userId };
}
