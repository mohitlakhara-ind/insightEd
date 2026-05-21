import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-[var(--border)] bg-[var(--surface)]/75 px-4 py-14 backdrop-blur-xl sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--accent)] to-transparent opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-[min(90vw,520px)] -translate-x-1/2 rounded-full bg-[var(--accent)] blur-[100px] opacity-25"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-lg space-y-4">
          <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            InsightEd
          </p>
          <p className="text-base leading-relaxed text-[var(--text-muted)]">
            Voice-forward navigation, cinematic layouts with restrained motion,
            and resilient contrast so learners can focus on skills—not fighting the
            interface.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/60 px-3 py-1">
              WCAG-minded
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/60 px-3 py-1">
              Reduced motion
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/60 px-3 py-1">
              Keyboard first
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-sm text-[var(--text-muted)] lg:items-end">
          <Link
            href="/educator"
            className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Educator Control Panel
          </Link>
          <p className="text-xs opacity-80">
            © {new Date().getFullYear()} InsightEd · Accessible Vocational Training
          </p>
        </div>
      </div>
    </footer>
  );
}
