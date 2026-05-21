import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-10 animate-spin text-[var(--accent)]" aria-hidden />
      <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
    </div>
  );
}
