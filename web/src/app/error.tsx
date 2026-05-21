"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <AlertCircle className="size-12 text-rose-500" aria-hidden />
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        Something went wrong
      </h1>
      <p className="text-sm text-[var(--text-secondary)]">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
