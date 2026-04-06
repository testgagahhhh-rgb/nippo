import { NextRequest } from "next/server";
import { signToken, type JwtPayload } from "@/lib/auth/jwt";
import type { Mock } from "vitest";

/** テスト用ユーザーデータ */
export const testUsers = {
  yamada: {
    sub: 1,
    email: "yamada@example.com",
    role: "sales",
    departmentId: 1,
  } as JwtPayload,
  suzuki: {
    sub: 2,
    email: "suzuki@example.com",
    role: "sales",
    departmentId: 1,
  } as JwtPayload,
  tanaka: {
    sub: 3,
    email: "tanaka@example.com",
    role: "manager",
    departmentId: 1,
  } as JwtPayload,
  sato: {
    sub: 4,
    email: "sato@example.com",
    role: "manager",
    departmentId: 2,
  } as JwtPayload,
  admin: {
    sub: 5,
    email: "admin@example.com",
    role: "admin",
    departmentId: 1,
  } as JwtPayload,
};

/**
 * Prisma のモック関数に型安全にアクセスするヘルパー
 */
export function asMock(fn: unknown): Mock {
  return fn as Mock;
}

/**
 * 認証トークン付きの NextRequest を生成する
 */
export async function createAuthenticatedRequest(
  url: string,
  user: JwtPayload,
  options: {
    method?: string;
    body?: unknown;
  } = {},
): Promise<NextRequest> {
  const token = await signToken(user);
  const headers: Record<string, string> = {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
  const init: { method: string; headers: Record<string, string>; body?: string } = {
    method: options.method ?? "GET",
    headers,
  };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }
  return new NextRequest(url, init);
}

/**
 * トークンなしの NextRequest を生成する
 */
export function createUnauthenticatedRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
  } = {},
): NextRequest {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  const init: { method: string; headers: Record<string, string>; body?: string } = {
    method: options.method ?? "GET",
    headers,
  };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }
  return new NextRequest(url, init);
}

/**
 * カスタム Authorization ヘッダー付きの NextRequest を生成する
 */
export function createRequestWithAuth(
  url: string,
  authHeader: string,
  options: {
    method?: string;
    body?: unknown;
  } = {},
): NextRequest {
  const headers: Record<string, string> = {
    authorization: authHeader,
    "content-type": "application/json",
  };
  const init: { method: string; headers: Record<string, string>; body?: string } = {
    method: options.method ?? "GET",
    headers,
  };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }
  return new NextRequest(url, init);
}
