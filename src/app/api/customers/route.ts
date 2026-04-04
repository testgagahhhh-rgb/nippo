import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { withAuth, requireRole } from "@/src/lib/middleware/auth";
import { customerCreateSchema, customerListQuerySchema } from "@/src/lib/schemas/customer";
import type { JwtPayload } from "@/src/lib/auth/jwt";
import type { Customer } from "@prisma/client";

function formatCustomer(c: Customer) {
  return {
    id: c.id,
    name: c.name,
    company_name: c.companyName,
    phone: c.phone,
    email: c.email,
    address: c.address,
    created_at: c.createdAt.toISOString(),
  };
}

export const GET = withAuth(async (req: NextRequest, _user: JwtPayload): Promise<NextResponse> => {
  const { searchParams } = new URL(req.url);
  const parsed = customerListQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    per_page: searchParams.get("per_page") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "クエリパラメータが不正です",
          details: parsed.error.issues,
        },
      },
      { status: 400 },
    );
  }

  const { q, page, per_page } = parsed.data;
  const skip = (page - 1) * per_page;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { companyName: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: per_page,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({
    data: customers.map(formatCustomer),
    meta: { total, page, per_page },
  });
});

export const POST = withAuth(
  requireRole(
    ["manager", "admin"],
    async (req: NextRequest, _user: JwtPayload): Promise<NextResponse> => {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { error: { code: "INVALID_JSON", message: "JSONが不正です" } },
          { status: 400 },
        );
      }

      const parsed = customerCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "入力値が不正です",
              details: parsed.error.issues,
            },
          },
          { status: 400 },
        );
      }

      const { name, company_name, phone, email, address } = parsed.data;
      const customer = await prisma.customer.create({
        data: {
          name,
          companyName: company_name,
          phone,
          email,
          address,
        },
      });

      return NextResponse.json({ data: formatCustomer(customer) }, { status: 201 });
    },
  ),
);
