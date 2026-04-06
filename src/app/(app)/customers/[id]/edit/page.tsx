"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { customers } from "@/lib/mockData";
import { CustomerForm } from "@/components/customer/CustomerForm";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customer = customers.find((c) => c.id === Number(id));

  if (!customer) {
    notFound();
  }

  return <CustomerForm customer={customer} />;
}
