import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main
      id="main-content"
      className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-72 w-[min(90vw,480px)] -translate-x-1/2 rounded-full bg-[var(--blob-1)] blur-[90px] opacity-40" />
      <header className="relative space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)]/70 p-8 shadow-[0_20px_60px_-40px_var(--accent-glow)] backdrop-blur-lg">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
          InsightEd
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
          {description}
        </p>
      </header>
      {children ? (
        <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)]/80 p-8 text-[var(--text-secondary)] shadow-[0_18px_50px_-42px_rgba(15,23,42,0.45)] backdrop-blur-md">
          {children}
        </div>
      ) : null}
    </main>
  );
}
