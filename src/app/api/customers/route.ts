export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, authorizeRole, type AuthUser } from "@/lib/middleware/auth";
import { createCustomerSchema, customerListQuerySchema } from "@/lib/schemas/customer";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = customerListQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "クエリパラメータが不正です",
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  const { q, page, per_page } = parsed.data;

  const where: Prisma.CustomerWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * per_page,
      take: per_page,
    }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({
    data: customers.map(formatCustomer),
    meta: { total, page, per_page },
  });
}

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;
  const user: AuthUser = authResult;

  const roleError = authorizeRole(user, ["manager", "admin"]);
  if (roleError) return roleError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "リクエストボディが不正です" } },
      { status: 400 },
    );
  }

  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "入力値が不正です",
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  const customer = await prisma.customer.create({
    data: {
      name: parsed.data.name,
      companyName: parsed.data.company_name,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
      address: parsed.data.address ?? null,
    },
  });

  return NextResponse.json({ data: formatCustomer(customer) }, { status: 201 });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatCustomer(customer: any) {
  return {
    id: customer.id,
    name: customer.name,
    company_name: customer.companyName,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    created_at: customer.createdAt.toISOString(),
    updated_at: customer.updatedAt.toISOString(),
  };
}

export { formatCustomer };
