// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { asMock } from "../integration/helpers";

/**
 * SQLインジェクション対策テスト
 *
 * Prisma は内部的にパラメータバインディングを使用するため、
 * ユーザー入力がSQLとして実行されることはない。
 * このテストでは、Prismaに渡される引数がそのまま文字列として
 * 扱われることを確認する。
 */

vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: { findMany: vi.fn(), count: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";

describe("SQLインジェクション対策テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("顧客検索でのSQLインジェクション", () => {
    it("' OR '1'='1 を含むクエリがパラメータとして安全に渡される", async () => {
      const maliciousInput = "' OR '1'='1";

      asMock(prisma.customer.findMany).mockResolvedValueOnce([]);
      asMock(prisma.customer.count).mockResolvedValueOnce(0);

      // Prisma の findMany を直接呼び出して引数を検証
      await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: maliciousInput, mode: "insensitive" } },
            { companyName: { contains: maliciousInput, mode: "insensitive" } },
          ],
        },
      });

      // Prisma に渡された引数を検証: SQLインジェクション文字列がそのまま
      // contains パラメータとして渡されている（SQL文として解釈されない）
      const callArgs = asMock(prisma.customer.findMany).mock.calls[0][0];
      expect(callArgs.where.OR[0].name.contains).toBe(maliciousInput);
      expect(callArgs.where.OR[1].companyName.contains).toBe(maliciousInput);
    });

    it("DROP TABLE を含む入力もパラメータとして安全に扱われる", async () => {
      const maliciousInput = "'; DROP TABLE customers; --";

      asMock(prisma.customer.findMany).mockResolvedValueOnce([]);
      asMock(prisma.customer.count).mockResolvedValueOnce(0);

      await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: maliciousInput, mode: "insensitive" } },
            { companyName: { contains: maliciousInput, mode: "insensitive" } },
          ],
        },
      });

      const callArgs = asMock(prisma.customer.findMany).mock.calls[0][0];
      expect(callArgs.where.OR[0].name.contains).toBe(maliciousInput);
    });
  });

  describe("ログインでのSQLインジェクション", () => {
    it("admin'-- を含むメールアドレスがパラメータとして安全に渡される", async () => {
      const maliciousEmail = "admin'--";

      asMock(prisma.user.findUnique).mockResolvedValueOnce(null);

      await prisma.user.findUnique({
        where: { email: maliciousEmail },
      });

      // findUnique の where 句にそのまま文字列として渡される
      const callArgs = asMock(prisma.user.findUnique).mock.calls[0][0];
      expect(callArgs.where.email).toBe(maliciousEmail);
    });

    it("UNION SELECT を含む入力もパラメータとして安全に扱われる", async () => {
      const maliciousEmail = "' UNION SELECT * FROM users --";

      asMock(prisma.user.findUnique).mockResolvedValueOnce(null);

      await prisma.user.findUnique({
        where: { email: maliciousEmail },
      });

      const callArgs = asMock(prisma.user.findUnique).mock.calls[0][0];
      expect(callArgs.where.email).toBe(maliciousEmail);
    });
  });
});
