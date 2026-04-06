import { SignJWT, jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const key = process.env.JWT_SECRET ?? "development-getSecret()-key";
  return Buffer.from(key, "utf-8");
}

function getExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN ?? "24h";
}

export async function generateToken(userId: number): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(getExpiresIn())
    .sign(getSecret());
}

export type JwtPayload = { userId: number };

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  if (typeof payload.userId !== "number") {
    throw new Error("Invalid token payload");
  }
  return { userId: payload.userId };
}

export async function getTokenExpiresAt(): Promise<Date> {
  const expiresIn = getExpiresIn();
  const ms = parseExpiresIn(expiresIn);
  return new Date(Date.now() + ms);
}

function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)(h|m|s|d)$/);
  if (!match) return 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * multipliers[unit];
}
