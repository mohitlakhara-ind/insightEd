"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  cta: string;
}

export function PremiumFeatureCard({ title, description, icon, href, cta }: PremiumFeatureCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useMotionValue(0), { damping: 20, stiffness: 150 });
  const rotateY = useSpring(useMotionValue(0), { damping: 20, stiffness: 150 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    
    mouseX.set(x);
    mouseY.set(y);

    const xPct = (x / width - 0.5) * 10;
    const yPct = (y / height - 0.5) * -10;
    
    rotateX.set(yPct);
    rotateY.set(xPct);
  }

  function onMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  const spotlight = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(233, 30, 99, 0.15), transparent 80%)`;

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
      className="group relative h-full flex flex-col p-6 sm:p-8 rounded-[1.5rem] sm:rounded-3xl border border-[var(--border)] bg-white/5 backdrop-blur-xl overflow-hidden transition-all hover:border-[var(--accent)]/50 shadow-2xl"
    >
      {/* Animated Border */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="border-beam" />
      </div>

      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: spotlight }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full" style={{ transform: "translateZ(50px)" }}>
        <div className="text-4xl mb-6 bg-[var(--surface-muted)] w-16 h-16 flex items-center justify-center rounded-2xl border border-[var(--border)] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
          {title}
        </h3>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 flex-1">
          {description}
        </p>
        
        <Link
          href={href}
          className="inline-flex items-center gap-2 font-bold text-[var(--accent)] group/link"
        >
          {cta}
          <span className="transition-transform group-hover/link:translate-x-2">→</span>
        </Link>
      </div>

      {/* Gloss reflection */}
      <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
