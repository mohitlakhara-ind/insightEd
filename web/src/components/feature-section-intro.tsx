"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  description: ReactNode;
};

export function FeatureSectionIntro({ id, title, description }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative text-center max-w-3xl mx-auto space-y-6">
      <motion.h2
        id={id}
        className="text-balance text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <span className="bg-linear-to-r from-[var(--text-primary)] via-[var(--accent)] to-[color-mix(in_oklab,var(--accent)_70%,var(--accent-primary))] bg-clip-text text-transparent">
          {title}
        </span>
      </motion.h2>
      <motion.div
        className="text-lg leading-relaxed text-[var(--text-secondary)]"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1] as const,
          delay: 0.06,
        }}
      >
        {description}
      </motion.div>
    </div>
  );
}
