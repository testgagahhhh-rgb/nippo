"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { UserForm } from "@/components/user/UserForm";
import type { User } from "@/types";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<User>(`/users/${id}`).then((result) => {
      if (result.ok) setUser(result.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="py-8 text-center text-gray-500">読み込み中...</div>;
  }

  if (!user) {
    notFound();
  }

  return <UserForm user={user} />;
}
