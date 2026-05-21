"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { DynamicBackground } from "@/components/dynamic-background";
import { BookOpen, Puzzle } from "lucide-react";

const GAMES = [
  {
    id: "story-telling",
    title: "Interactive Story Telling",
    description: "Build your vocabulary and imagination by completing stories in real-time.",
    icon: <BookOpen className="w-10 h-10" />,
    color: "violet",
    status: "Available",
    tags: ["Vocabulary", "Creativity"]
  },
  {
    id: "memory-match",
    title: "Audio Memory Match",
    description: "Match sounds to their corresponding words to improve auditory processing.",
    icon: <Puzzle className="w-10 h-10" />,
    color: "cyan",
    status: "Available",
    tags: ["Memory", "Audio"]
  }
];

export default function GamesPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen pt-28 md:pt-32 pb-12 px-4 md:px-6 flex flex-col items-center">
      <DynamicBackground />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl flex items-center justify-between mb-16"
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          ← Back to Home
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Mind Games
        </h1>
        <div className="w-20" />
      </motion.header>

      <div className="w-full max-w-5xl space-y-6">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`group relative ${game.status === "Coming Soon" ? "opacity-70" : ""}`}
          >
            {game.status === "Available" && (
              <div className={`absolute inset-0 bg-linear-to-r from-${game.color}-500/10 to-transparent rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            )}
            
            <div 
              onClick={() => game.status === "Available" && router.push(`/games/${game.id}`)}
              className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-[var(--surface-elevated)]/80 backdrop-blur-xl border border-[var(--border)] rounded-[2rem] ${
                game.status === "Available" ? "hover:border-[var(--accent)]/50 cursor-pointer" : ""
              } transition-colors`}
            >
              
              <div className="shrink-0 size-20 rounded-2xl bg-white/5 text-[var(--accent)] flex items-center justify-center shadow-inner border border-[var(--border)]">
                {game.icon}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    {game.title}
                  </h2>
                  {game.status === "Coming Soon" && (
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-[var(--text-secondary)] mb-4">
                  {game.description}
                </p>
                <div className="flex gap-2">
                  {game.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {game.status === "Available" && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/games/${game.id}`);
                  }}
                  className="shrink-0 mt-4 md:mt-0 h-14 px-8 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent)] text-white font-bold hover:scale-[1.05] transition-transform shadow-lg shadow-[0_0_20px_rgba(233,30,99,0.2)]"
                >
                  Play Now
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}


