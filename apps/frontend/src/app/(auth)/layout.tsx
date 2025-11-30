import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-muted/50">
      <div className="backdrop absolute inset-0 -z-10 opacity-70 blur-3xl" />
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
