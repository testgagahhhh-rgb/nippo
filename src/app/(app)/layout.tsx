"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { Header } from "@/components/layout/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      router.replace("/login");
    } else {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
