"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

type AuthGuardProps = {
  children: React.ReactNode;
  educatorOnly?: boolean;
};

export function AuthGuard({ children, educatorOnly = false }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (educatorOnly && profile?.role !== "educator") {
      router.replace("/");
    }
  }, [user, profile, loading, educatorOnly, router, pathname]);

  if (loading) {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-10 animate-spin text-[var(--accent)]" aria-hidden />
        <p className="text-sm text-[var(--text-secondary)]">Loading your session…</p>
      </div>
    );
  }

  if (!user) return null;
  if (educatorOnly && profile?.role !== "educator") return null;

  return <>{children}</>;
}
