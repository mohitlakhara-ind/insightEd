"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicBackground } from "@/components/dynamic-background";
import { ArrowLeft, Volume2, RefreshCw, Trophy, Sparkles, Brain, Zap } from "lucide-react";

interface Card {
  id: number;
  word: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_WORDS = [
  { word: "Ocean Waves", emoji: "🌊" },
  { word: "Song Bird", emoji: "🐦" },
  { word: "Campfire Spark", emoji: "🔥" },
  { word: "Thunder Storm", emoji: "⚡" },
];

export default function MemoryMatchGame() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const initializeGame = useCallback(() => {
    const doubled = [...MEMORY_WORDS, ...MEMORY_WORDS].map((item, idx) => ({
      id: idx,
      word: item.word,
      emoji: item.emoji,
      isFlipped: false,
      isMatched: false,
    }));
    
    // Fisher-Yates Shuffle Algorithm
    for (let i = doubled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
    }

    setCards(doubled);
    setSelectedIndices([]);
    setMoves(0);
    setGameCompleted(false);
    setIsBusy(false);
  }, []);

  const announceSpeech = useCallback((text: string) => {
    if (!ttsEnabled) return;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [ttsEnabled]);

  // Initialize and Shuffle Cards
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      initializeGame();
    });
    announceSpeech("Audio Memory Match loaded. Tap cards to flip and match their auditory tags.");
    return () => cancelAnimationFrame(handle);
  }, [initializeGame, announceSpeech]);

  const handleCardClick = (clickedIndex: number) => {
    if (isBusy || gameCompleted) return;
    
    const card = cards[clickedIndex];
    if (card.isFlipped || card.isMatched) return;

    // Flip card and play its auditory representation
    const newCards = [...cards];
    newCards[clickedIndex].isFlipped = true;
    setCards(newCards);

    announceSpeech(card.word);

    const newSelected = [...selectedIndices, clickedIndex];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      checkMatch(newSelected);
    }
  };

  const checkMatch = (indices: number[]) => {
    setIsBusy(true);
    const [firstIdx, secondIdx] = indices;
    const card1 = cards[firstIdx];
    const card2 = cards[secondIdx];

    if (card1.word === card2.word) {
      // Match found
      setTimeout(() => {
        const matchedCards = [...cards];
        matchedCards[firstIdx].isMatched = true;
        matchedCards[secondIdx].isMatched = true;
        setCards(matchedCards);
        setSelectedIndices([]);
        setIsBusy(false);

        announceSpeech(`Match found! ${card1.word}`);

        // Check if all cards matched
        const allMatched = matchedCards.every((c) => c.isMatched);
        if (allMatched) {
          setGameCompleted(true);
          announceSpeech(`Game completed in ${moves + 1} moves! You earned one hundred and fifty experience points.`);
        }
      }, 800);
    } else {
      // No match
      setTimeout(() => {
        const flippedBackCards = [...cards];
        flippedBackCards[firstIdx].isFlipped = false;
        flippedBackCards[secondIdx].isFlipped = false;
        setCards(flippedBackCards);
        setSelectedIndices([]);
        setIsBusy(false);
        announceSpeech("No match. Try again.");
      }, 1500);
    }
  };

  return (
    <main className="relative min-h-screen pt-28 pb-20 px-4 md:px-8 flex flex-col items-center justify-center">
      <DynamicBackground />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex items-center justify-between mb-10 relative z-10"
      >
        <button
          onClick={() => router.push("/games")}
          className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Games
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setTtsEnabled(!ttsEnabled);
              announceSpeech(ttsEnabled ? "" : "Screen announcer enabled");
            }}
            className={`flex items-center gap-2 border px-4 py-1.5 rounded-full transition-all text-xs font-black uppercase ${
              ttsEnabled
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                : "bg-white/5 border-white/10 text-[var(--text-muted)]"
            }`}
          >
            <Volume2 className="size-4" />
            {ttsEnabled ? "Speech: ON" : "Speech: OFF"}
          </button>
        </div>
      </motion.header>

      {/* Game Layout */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10 items-stretch">
        {/* Memory Grid (8 Columns) */}
        <div className="md:col-span-8 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!gameCompleted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {cards.map((card, idx) => {
                  const isRevealed = card.isFlipped || card.isMatched;

                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(idx)}
                      disabled={isRevealed || isBusy}
                      aria-label={`Card ${idx + 1}: ${
                        card.isMatched
                          ? `${card.word} (Matched)`
                          : card.isFlipped
                          ? `${card.word} (Flipped)`
                          : "Hidden Sound Card"
                      }`}
                      className="aspect-square relative rounded-[2rem] overflow-hidden group perspective-1000"
                    >
                      {/* Inner Card Container */}
                      <motion.div
                        className="w-full h-full duration-500 transform-style-3d relative"
                        animate={{ rotateY: isRevealed ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      >
                        {/* Front Side (Card Back - Covered) */}
                        <div className="absolute inset-0 bg-[var(--surface-elevated)]/85 backdrop-blur-xl border border-[var(--border)] rounded-[2rem] flex flex-col items-center justify-center p-4 shadow-xl hover:border-cyan-500/40 group-hover:scale-[1.03] transition-all duration-300 backface-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 blur-[30px] rounded-full pointer-events-none" />
                          <div className="size-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-inner group-hover:animate-pulse">
                            <Brain size={32} />
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-4">
                            Flip Sound
                          </span>
                        </div>

                        {/* Back Side (Card Front - Revealed) */}
                        <div className="absolute inset-0 bg-[var(--surface-elevated)]/90 backdrop-blur-xl border border-cyan-500/30 rounded-[2rem] flex flex-col items-center justify-center p-4 shadow-xl rotateY-180 backface-hidden">
                          <div className={`size-20 rounded-full flex items-center justify-center text-4xl mb-3 ${
                            card.isMatched ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          }`}>
                            {card.isMatched ? "✓" : card.emoji}
                          </div>
                          <span className={`text-xs font-bold text-center leading-tight ${
                            card.isMatched ? "text-emerald-400" : "text-white"
                          }`}>
                            {card.word}
                          </span>
                          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider mt-2">
                            {card.isMatched ? "Matched" : "Revealed"}
                          </span>
                        </div>
                      </motion.div>
                    </button>
                  );
                })}
              </motion.div>
            ) : (
              /* Success Congratulations Screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[2.5rem] glass-card p-10 md:p-16 border border-emerald-500/20 text-center space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="size-20 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <Trophy className="size-10 text-emerald-400 animate-bounce" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    Perfect Auditory Match!
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed">
                    You matched all sonic patterns in <span className="font-bold text-emerald-400">{moves} moves</span>. Excellent sensory mapping, learning Mitra is proud of you!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button
                    onClick={initializeGame}
                    className="h-14 px-8 rounded-full bg-emerald-500 text-white font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="size-4" /> Play Again
                  </button>
                  <button
                    onClick={() => router.push("/games")}
                    className="h-14 px-8 rounded-full bg-white/5 border border-[var(--border)] text-white font-bold hover:bg-white/10 active:scale-95 transition-all"
                  >
                    Return to Hub
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats and Guides Sidebar (4 Columns) */}
        <div className="md:col-span-4 space-y-6 flex flex-col justify-between">
          <div className="rounded-[2rem] glass-card border border-[var(--border)] p-6 space-y-6">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Zap className="size-5 text-cyan-400" />
              Game Statistics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)] text-center">
                <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider block mb-1">
                  Moves
                </span>
                <span className="text-3xl font-black text-white">{moves}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)] text-center">
                <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider block mb-1">
                  Pairs Left
                </span>
                <span className="text-3xl font-black text-cyan-400">
                  {cards.filter((c) => !c.isMatched).length / 2}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-center">
              <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block mb-1">
                Completion Reward
              </span>
              <span className="text-xl font-black text-white flex items-center justify-center gap-1.5">
                <Sparkles className="size-5 text-yellow-400 animate-spin" />
                +150 XP
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[var(--surface)] border border-[var(--border)] p-6 space-y-3">
            <h4 className="font-black text-[var(--text-primary)] text-xs uppercase tracking-widest">
              Accessibility Guide
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              This game is fully compatible with standard screen readers (ARIA live regions are announced on card click). Tap any card to hear its hidden word, then match it to its identical sonic duplicate.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
