export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, authorizeRole, type AuthUser } from "@/lib/middleware/auth";
import { updateCustomerSchema } from "@/lib/schemas/customer";
import { formatCustomer } from "@/app/api/customers/route";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const customerId = Number(id);
  if (isNaN(customerId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "IDが不正です" } },
      { status: 400 },
    );
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "顧客が見つかりません" } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: formatCustomer(customer) });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;
  const user: AuthUser = authResult;

  const roleError = authorizeRole(user, ["manager", "admin"]);
  if (roleError) return roleError;

  const { id } = await params;
  const customerId = Number(id);
  if (isNaN(customerId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "IDが不正です" } },
      { status: 400 },
    );
  }

  const existing = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "顧客が見つかりません" } },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "リクエストボディが不正です" } },
      { status: 400 },
    );
  }

  const parsed = updateCustomerSchema.safeParse(body);
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

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.company_name !== undefined) data.companyName = parsed.data.company_name;
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone ?? null;
  if (parsed.data.email !== undefined) data.email = parsed.data.email ?? null;
  if (parsed.data.address !== undefined) data.address = parsed.data.address ?? null;

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data,
  });

  return NextResponse.json({ data: formatCustomer(customer) });
}
