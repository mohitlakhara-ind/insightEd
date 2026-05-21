"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

type FeatureCardProps = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: ReactNode;
};

export function FeatureCard({
  title,
  description,
  href,
  cta,
  icon,
}: FeatureCardProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(-320);
  const my = useMotionValue(-320);

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current || reduceMotion) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  function onMouseLeave() {
    mx.set(-320);
    my.set(-320);
  }

  const spotlight = useMotionTemplate`radial-gradient(560px circle at ${mx}px ${my}px, color-mix(in oklab, var(--accent) 26%, transparent), transparent 52%)`;

  return (
    <motion.article
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/85 p-6 shadow-[0_16px_48px_-36px_rgba(15,23,42,0.35)] backdrop-blur-md motion-reduce:transform-none"
      whileHover={reduceMotion ? {} : { y: -6, transition: { duration: 0.35 } }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      {!reduceMotion ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-px rounded-[1.4rem] opacity-70 shadow-[inset_0_1px_0_rgba(255,255,255,0.48)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      />
      <div className="relative z-10 mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-[var(--accent-subtle)] to-[color-mix(in_oklab,var(--accent)_35%,transparent)] text-2xl shadow-inner ring-1 ring-[var(--border)]">
        <span aria-hidden>{icon}</span>
      </div>
      <h2 className="relative z-10 text-lg font-bold text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="relative z-10 mt-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
      <Link
        href={href}
        className="relative z-10 mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)] transition-[gap,opacity] hover:gap-3 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
      >
        {cta}
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </Link>
    </motion.article>
  );
}
