import { jwtVerify } from "jose";

export type JwtPayload = {
  sub: string;
  role: "sales" | "manager" | "admin";
  department: string;
  name: string;
};

export async function verifyToken(token: string): Promise<JwtPayload> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as JwtPayload;
}
