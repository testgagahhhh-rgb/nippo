import type { Customer, DailyReport, User } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function mapReportResponse(r: any): DailyReport {
  return {
    id: r.id,
    userId: r.user?.id,
    reportDate: r.report_date,
    status: r.status,
    submittedAt: r.submitted_at,
    problem: r.problem,
    plan: r.plan,
    user: r.user?.department
      ? { ...r.user, departmentId: r.user.department.id, department: r.user.department }
      : { ...r.user, departmentId: 0, department: { id: 0, name: "" } },
    visitRecords: (r.visit_records ?? []).map((vr: any) => ({
      id: vr.id,
      reportId: r.id,
      customerId: vr.customer?.id,
      content: vr.content,
      visitedAt: vr.visited_at,
      customer: {
        id: vr.customer?.id,
        name: vr.customer?.name,
        companyName: vr.customer?.company_name,
        phone: null,
        email: null,
        address: null,
      },
    })),
    comments: (r.comments ?? []).map((c: any) => ({
      id: c.id,
      reportId: r.id,
      userId: c.user?.id,
      targetType: c.target_type,
      content: c.content,
      createdAt: c.created_at,
      user: {
        ...c.user,
        departmentId: 0,
        department: { id: 0, name: "" },
        role: "manager" as const,
        email: "",
      },
    })),
  };
}

export function mapCustomerResponse(c: any): Customer {
  return {
    id: c.id,
    name: c.name,
    companyName: c.company_name ?? c.companyName,
    phone: c.phone,
    email: c.email,
    address: c.address,
  };
}

export function mapUserResponse(u: any): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    departmentId: u.department?.id ?? u.department_id,
    department: u.department ?? { id: 0, name: "" },
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
