"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { users } from "@/lib/mockData";
import { UserForm } from "@/components/user/UserForm";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = users.find((u) => u.id === Number(id));

  if (!user) {
    notFound();
  }

  return <UserForm user={user} />;
}
