import Link from "next/link";

export function SkipLink() {
  return (
    <Link
      href="#main-content"
      className="absolute left-[-10000px] top-auto z-50 h-px w-px overflow-hidden rounded-lg bg-[var(--surface-elevated)] px-4 py-3 text-[var(--text-primary)] shadow-lg outline outline-2 outline-offset-2 outline-[var(--ring)] focus:left-4 focus:top-4 focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible"
    >
      Skip to main content
    </Link>
  );
}
