"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function HomeHero() {
  const reduceMotion = useReducedMotion();

  const stagger =
    reduceMotion === true
      ? { staggerChildren: 0 }
      : { staggerChildren: 0.09, delayChildren: 0.06 };

  const itemHidden = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 22 };

  const itemShow = reduceMotion
    ? { opacity: 1, y: 0 }
    : {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section
      aria-labelledby="intro-heading"
      className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14"
    >
      <motion.div
        className="space-y-8"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: stagger },
        }}
      >
        <motion.p
          variants={{
            hidden: itemHidden,
            show: itemShow,
          }}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/65 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
        >
          <span className="relative flex h-2 w-2" aria-hidden>
            {!reduceMotion ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </>
            ) : (
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            )}
          </span>
          Next.js 16 · React 19 · Tailwind 4
        </motion.p>

        <motion.div
          variants={{
            hidden: itemHidden,
            show: itemShow,
          }}
          className="space-y-5"
        >
          <h1
            id="intro-heading"
            className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.15rem]"
          >
            <span className="text-gradient-hero">
              Vocational training that centers visually impaired learners from
              the first pixel.
            </span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
            InsightEd pairs a cinematic{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              Next.js App Router
            </span>{" "}
            web client with a React Native (Expo) shell—motion respects your OS
            reduced-motion settings.
          </p>
        </motion.div>

        <motion.div
          variants={{
            hidden: itemHidden,
            show: itemShow,
          }}
          className="flex flex-wrap gap-3"
        >
          <motion.div
            whileHover={reduceMotion ? {} : { scale: 1.02, y: -2 }}
            whileTap={reduceMotion ? {} : { scale: 0.98 }}
          >
            <Link
              href="/courses"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-linear-to-br from-[var(--accent)] via-teal-600 to-cyan-600 px-8 text-base font-semibold text-[var(--accent-fg)] shadow-[0_18px_44px_-14px_var(--accent-glow)] ring-1 ring-white/20 transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              Start learning
            </Link>
          </motion.div>
          <motion.div
            whileHover={reduceMotion ? {} : { scale: 1.01 }}
            whileTap={reduceMotion ? {} : { scale: 0.98 }}
          >
            <Link
              href="/sign-in"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/55 px-8 text-base font-semibold text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-md transition-[border-color,box-shadow] hover:border-[color-mix(in_oklab,var(--accent)_55%,var(--border))] hover:shadow-[0_12px_40px_-28px_var(--accent-glow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              Sign in · Firebase soon
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={{
            hidden: itemHidden,
            show: itemShow,
          }}
          className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/35 py-3 glass-panel"
          aria-label="Product pillars"
        >
          <div className="marquee-track gap-10 px-6 py-1 text-sm font-medium text-[var(--text-muted)]">
            {[...pillItems, ...pillItems].map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="flex shrink-0 items-center gap-10"
              >
                <span className="text-[var(--accent)]">✦</span>
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.aside
        initial={reduceMotion ? false : { opacity: 0, x: 28 }}
        animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const, delay: 0.12 }}
        className="relative"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-linear-to-br from-[var(--accent)]/15 via-transparent to-indigo-500/18 blur-2xl motion-reduce:opacity-60"
        />
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-elevated)]/80 p-8 shadow-[0_28px_80px_-40px_rgba(15,118,110,0.45)] glass-panel">
          <div className="absolute right-6 top-6 flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/90 ring-2 ring-[var(--surface-elevated)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90 ring-2 ring-[var(--surface-elevated)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90 ring-2 ring-[var(--surface-elevated)]" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-[var(--text-primary)]">
            Live-ready accessibility stack
          </h2>
          <ul className="mt-6 space-y-5 text-sm leading-relaxed text-[var(--text-secondary)]">
            {checklist.map((line, idx) => (
              <motion.li
                key={line}
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: 0.08 * idx, duration: 0.45 }}
                className="flex gap-3"
              >
                <span
                  className="mt-1.5 inline-block size-2 shrink-0 rounded-full bg-linear-to-br from-[var(--accent)] to-cyan-400 shadow-[0_0_12px_var(--accent-glow)]"
                  aria-hidden
                />
                <span>{line}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--background)]/55 p-4"
            whileHover={reduceMotion ? {} : { scale: 1.01 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Preview · Voice regions
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed text-[var(--accent)] opacity-90">
              aria-live=&quot;polite&quot; · route-aware narration hooks
            </p>
          </motion.div>
        </div>
      </motion.aside>
    </section>
  );
}

const pillItems = [
  "Audio-first curricula",
  "Pronunciation scoring",
  "Calm notifications",
  "Peer learning spaces",
  "Offline-aware pacing",
];

const checklist = [
  "Skip link, landmarks, and oversized tap targets across marketing + app shells.",
  "Honors prefers-reduced-motion: decorative loops shrink to static gradients.",
  "Lexend typography tuned for extended listening + reading sessions.",
  "Composable sections ready for Firebase auth and live mentor sessions.",
];
