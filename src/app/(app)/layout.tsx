import { Header } from "@/src/components/layout/Header";
import { getCurrentUser } from "@/src/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
