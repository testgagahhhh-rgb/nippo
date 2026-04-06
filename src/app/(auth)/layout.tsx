export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background flex min-h-svh items-center justify-center px-4 py-12">
      {children}
    </main>
  );
}
