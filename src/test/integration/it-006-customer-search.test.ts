// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { testUsers, createAuthenticatedRequest, asMock } from "./helpers";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: { findMany: vi.fn(), count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { GET as getCustomers } from "@/app/api/customers/route";

describe("IT-006 顧客検索のDB問い合わせ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("キーワード'ABC'で検索すると該当する顧客のみ返される", async () => {
    const now = new Date();
    asMock(prisma.customer.findMany).mockResolvedValueOnce([
      {
        id: 10,
        name: "顧客A",
        companyName: "株式会社ABC",
        phone: null,
        email: null,
        address: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 12,
        name: "顧客C",
        companyName: "ABCホールディングス",
        phone: null,
        email: null,
        address: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    asMock(prisma.customer.count).mockResolvedValueOnce(2);

    const req = await createAuthenticatedRequest(
      "http://localhost/api/customers?q=ABC",
      testUsers.tanaka,
    );
    const res = await getCustomers(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(2);

    const companyNames = data.data.map((c: { company_name: string }) => c.company_name);
    expect(companyNames).toContain("株式会社ABC");
    expect(companyNames).toContain("ABCホールディングス");
    expect(companyNames).not.toContain("有限会社XYZ");
  });
});
