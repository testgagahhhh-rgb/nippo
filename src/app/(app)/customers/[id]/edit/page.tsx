"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { CustomerForm } from "@/components/customer/CustomerForm";
import type { Customer } from "@/types";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Customer>(`/customers/${id}`).then((result) => {
      if (result.ok) setCustomer(result.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="py-8 text-center text-gray-500">読み込み中...</div>;
  }

  if (!customer) {
    notFound();
  }

  return <CustomerForm customer={customer} />;
}
