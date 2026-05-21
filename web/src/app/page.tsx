"use client";

import { motion } from "framer-motion";
import { PremiumHero } from "@/components/premium-hero";
import { PremiumFeatureCard } from "@/components/premium-feature-card";
import { FeatureSectionIntro } from "@/components/feature-section-intro";
import { MouseFollower } from "@/components/mouse-follower";
import { DynamicBackground } from "@/components/dynamic-background";
import { PronunciationPracticeWidget } from "@/components/pronunciation-practice-widget";
import Link from "next/link";

const highlights = [
  {
    title: "Vocational Courses & Audio Library",
    description:
      "Dive into comprehensive career tracks with full text transcripts, offline audio guides, and adaptive pacing designed to support high-performance learning independent of connection bandwidth.",
    href: "/courses",
    cta: "Browse professional courses",
    icon: "🎧",
    gridClass: "md:col-span-2",
  },
  {
    title: "AI Speech Coach",
    description:
      "Refine your speaking and presentation skills with real-time phoneme feedback loops optimized for keyboard shortcuts and screen readers.",
    href: "/pronunciation",
    cta: "Open pronunciation lab",
    icon: "🗣️",
    gridClass: "md:col-span-1",
  },
  {
    title: "Expert Rooms & Peer Spaces",
    description:
      "Join active discussions and scheduling spaces with real human coaches. Accessibility-first live announcements keep you up-to-date in real-time.",
    href: "/community",
    cta: "Connect with communities",
    icon: "🤝",
    gridClass: "md:col-span-1",
  },
  {
    title: "Restorative Cognitive Games",
    description:
      "Engage in bite-sized, screen-reader optimized puzzles that build working memory and spatial awareness. Zero disruptive transitions or visual noise.",
    href: "/games",
    cta: "Play a rapid session",
    icon: "🧩",
    gridClass: "md:col-span-2",
  },
];

export default function Home() {
  return (
    <main
      id="main-content"
      className="relative flex w-full flex-col gap-32 pb-32"
    >
      <MouseFollower />
      <DynamicBackground />
      
      <PremiumHero />

      {/* Bento Grid Highlights */}
      <section aria-labelledby="modules-heading" className="container mx-auto px-4 md:px-6 space-y-16">
        <FeatureSectionIntro
          id="modules-heading"
          title="Engineered for Premium Accessibility"
          description={
            <>
              Every single gesture and interactive asset is designed to serve. We combine the high-contrast physical 
              affordances of Brutalism with futuristic glassmorphism to establish a luxurious study experience for everyone.
            </>
          }
        />
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.href} className={`${item.gridClass}`}>
              <PremiumFeatureCard {...item} />
            </div>
          ))}
        </div>
      </section>

      {/* Live Interactive Lab Preview */}
      <section aria-labelledby="interactive-lab-heading" className="container mx-auto px-4 md:px-6 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[var(--accent)] bg-[var(--accent-subtle)] px-3 py-1 rounded-full border border-[var(--accent)]/10">
            Feature Showcase
          </span>
          <h2 id="interactive-lab-heading" className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Interactive Speech & Pronunciation Lab
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            Experience our voice-first learning loops. Record a phoneme check and get instantaneous, 
            accessible acoustic analysis on your computer.
          </p>
        </div>
        <PronunciationPracticeWidget />
      </section>

      {/* Stats Section with Glassmorphism */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[2rem] glass-card p-8 md:p-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h4 className="text-5xl font-bold text-[var(--accent)] mb-2">50+</h4>
              <p className="text-[var(--text-secondary)] font-medium">Audio Courses</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-5xl font-bold text-[var(--accent)] mb-2">10,000+</h4>
              <p className="text-[var(--text-secondary)] font-medium">Active Learners</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-5xl font-bold text-[var(--accent)] mb-2">98%</h4>
              <p className="text-[var(--text-secondary)] font-medium">Satisfaction Rate</p>
            </motion.div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[var(--accent)]/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--accent-primary)]/20 blur-[100px] rounded-full pointer-events-none" />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 md:px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Ready to start your <span className="text-[var(--accent)]">learning journey?</span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)]">
            Join thousands of learners who are already building their future with InsightEd.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex h-16 items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent)] px-10 text-xl font-bold text-[var(--accent-fg)] shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(233,30,99,0.2)] hover:shadow-[0_0_40px_rgba(233,30,99,0.5)]"
          >
            Create Your Account
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
