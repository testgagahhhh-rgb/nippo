import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { withAuth, requireRole } from "@/src/lib/middleware/auth";
import { customerUpdateSchema } from "@/src/lib/schemas/customer";
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

type RouteContext = { params: Promise<{ id: string }> };

export function GET(req: NextRequest, ctx: RouteContext) {
  return withAuth(async (_req: NextRequest, _user: JwtPayload) => {
    const { id } = await ctx.params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "顧客が見つかりません" } },
        { status: 404 },
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "顧客が見つかりません" } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: formatCustomer(customer) });
  })(req);
}

export function PUT(req: NextRequest, ctx: RouteContext) {
  return withAuth(
    requireRole(["manager", "admin"], async (req: NextRequest, _user: JwtPayload) => {
      const { id } = await ctx.params;
      const customerId = parseInt(id, 10);
      if (isNaN(customerId)) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "顧客が見つかりません" } },
          { status: 404 },
        );
      }

      const existing = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!existing) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "顧客が見つかりません" } },
          { status: 404 },
        );
      }

      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { error: { code: "INVALID_JSON", message: "JSONが不正です" } },
          { status: 400 },
        );
      }

      const parsed = customerUpdateSchema.safeParse(body);
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
      const customer = await prisma.customer.update({
        where: { id: customerId },
        data: {
          ...(name !== undefined && { name }),
          ...(company_name !== undefined && { companyName: company_name }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(address !== undefined && { address }),
        },
      });

      return NextResponse.json({ data: formatCustomer(customer) });
    }),
  )(req);
}
