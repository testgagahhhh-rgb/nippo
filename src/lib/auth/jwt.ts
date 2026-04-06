import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production",
);
const JWT_EXPIRES_IN = "8h";

export type JwtPayload = {
  sub: number;
  email: string;
  role: string;
  departmentId: number;
};

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    departmentId: payload.departmentId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return {
    sub: Number(payload.sub),
    email: payload.email as string,
    role: payload.role as string,
    departmentId: payload.departmentId as number,
  };
}
