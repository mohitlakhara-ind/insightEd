"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function PremiumHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const stagger = {
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20"
    >
      <motion.div
        style={{ y, opacity, scale }}
        className="container relative z-10 px-4 md:px-6"
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            variants={item}
            className="inline-block px-4 py-1.5 mb-6 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/50 backdrop-blur-md shadow-sm"
          >
            <span className="text-xs font-bold tracking-widest uppercase text-[var(--accent)]">
              Transforming Lives Through Sound
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-[var(--accent)] to-[var(--accent-primary)] leading-tight md:leading-[1.15]"
          >
            Education for <span className="text-gradient-shimmer">Everyone</span>, Everywhere.
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Empowering visually impaired learners with vocational audio courses, 
            real-time pronunciation feedback, and a supportive community.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/courses"
              className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent)] px-8 font-bold text-[var(--accent-fg)] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(233,30,99,0.2)] hover:shadow-[0_0_30px_rgba(233,30,99,0.5)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
              <div className="absolute inset-0 -z-10 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Link>
            
            <Link
              href="/courses"
              className="inline-flex h-14 items-center justify-center rounded-full border border-[var(--border)] bg-white/5 px-8 font-bold text-[var(--text-primary)] backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 shadow-sm"
            >
              Browse Catalog
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Decorative Background Image */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
        className="absolute inset-0 -z-10 opacity-40"
      >
        <Image
          src="/hero-visual.png"
          alt="Abstract Learning Visual"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-[var(--background)] via-transparent to-[var(--background)]" />
      </motion.div>
    </section>
  );
}
