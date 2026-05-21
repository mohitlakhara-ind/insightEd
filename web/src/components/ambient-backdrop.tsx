"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AmbientBackdrop() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-grid-mesh"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-18%,var(--blob-2),transparent_62%),radial-gradient(ellipse_70%_48%_at_100%_58%,var(--blob-1),transparent_58%),radial-gradient(ellipse_55%_42%_at_4%_72%,var(--blob-3),transparent_55%)] opacity-90" />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-grid-mesh overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-18%,var(--blob-2),transparent_62%),radial-gradient(ellipse_70%_48%_at_100%_58%,var(--blob-1),transparent_58%),radial-gradient(ellipse_55%_42%_at_4%_72%,var(--blob-3),transparent_55%)] opacity-95" />
      <motion.div
        className="absolute -left-[18%] top-[12%] h-[min(52vw,420px)] w-[min(52vw,420px)] rounded-full bg-[var(--blob-1)] blur-[90px] opacity-70"
        animate={{ scale: [1, 1.06, 1], rotate: [0, 6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[12%] top-[28%] h-[min(46vw,380px)] w-[min(46vw,380px)] rounded-full bg-[var(--blob-2)] blur-[88px] opacity-[0.55]"
        animate={{ scale: [1, 1.08, 1], y: [0, -24, 0] }}
        transition={{
          duration: 17,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-[6%] left-[22%] h-[min(38vw,300px)] w-[min(38vw,300px)] rounded-full bg-[var(--blob-3)] blur-[76px] opacity-[0.45]"
        animate={{ opacity: [0.35, 0.55, 0.35], x: [0, 18, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
