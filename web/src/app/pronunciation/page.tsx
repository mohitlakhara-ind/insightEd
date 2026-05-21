"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AudioService } from "@/lib/audio-service";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { DynamicBackground } from "@/components/dynamic-background";
import { Mic, Volume2, Square, Play, ArrowRight, Loader2 } from "lucide-react";
import { fetchPronunciationQuotes } from "@/lib/pronunciation-quotes";

export default function PronunciationPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<string[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPronunciationQuotes().then((loaded) => {
      if (!cancelled) {
        setQuotes(loaded);
        setQuotesLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    isRecording,
    audioURL,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const handleNext = () => {
    if (currentQuoteIndex < quotes.length - 1) {
      setCurrentQuoteIndex((prev) => prev + 1);
      resetRecording();
    } else {
      router.push("/");
    }
  };

  const handleTTS = () => {
    if (quotes[currentQuoteIndex]) {
      AudioService.speak(quotes[currentQuoteIndex]);
    }
  };

  if (quotesLoading || quotes.length === 0) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 pt-28">
        <Loader2 className="size-10 animate-spin text-[var(--accent)]" aria-hidden />
        <p className="text-sm text-[var(--text-secondary)]">Loading practice phrases…</p>
      </main>
    );
  }

  const playUserAudio = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      setIsPlayingUserAudio(true);
      audio.onended = () => setIsPlayingUserAudio(false);
      audio.play();
    }
  };

  return (
    <main className="relative min-h-screen pt-28 md:pt-32 pb-12 px-4 md:px-6 flex flex-col items-center">
      <DynamicBackground />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex items-center justify-between mb-12"
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          ← Back to Home
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Pronunciation Coach
        </h1>
        <div className="w-20" />
      </motion.header>

      {/* Quote Card */}
      <AnimatePresence mode="wait">
        <motion.section
          key={currentQuoteIndex}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-[var(--surface-elevated)]/80 backdrop-blur-xl border border-[var(--border)] rounded-[2.5rem] p-6 sm:p-10 md:p-16 text-center shadow-2xl mb-12"
        >
          <span className="text-xs font-bold tracking-widest text-[var(--accent)] uppercase mb-6 block">
            Phase {currentQuoteIndex + 1} of {quotes.length}
          </span>
          <p className="text-xl sm:text-2xl md:text-4xl font-bold leading-tight text-[var(--text-primary)]">
            &ldquo;{quotes[currentQuoteIndex]}&rdquo;
          </p>
        </motion.section>
      </AnimatePresence>

      {/* Controls */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
        <ControlButton
          onClick={handleTTS}
          label="Listen to AI"
          subLabel="Speech Synthesis"
          icon={<Volume2 className="w-8 h-8" />}
          variant="indigo"
        />
        <ControlButton
          onClick={isRecording ? stopRecording : startRecording}
          label={isRecording ? "Stop Now" : "Record Voice"}
          subLabel={isRecording ? "Listening..." : "Start Practice"}
          icon={isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
          variant={isRecording ? "rose" : "default"}
          active={isRecording}
        />
        <ControlButton
          onClick={playUserAudio}
          disabled={!audioURL}
          label="Your Audio"
          subLabel={isPlayingUserAudio ? "Playing..." : "Playback"}
          icon={<Play className="w-8 h-8" />}
          variant="emerald"
        />
        <ControlButton
          onClick={handleNext}
          label={currentQuoteIndex < quotes.length - 1 ? "Next Quote" : "Complete"}
          subLabel="Continue"
          icon={<ArrowRight className="w-8 h-8" />}
          variant="violet"
        />
      </section>

      {/* Progress */}
      <div className="flex gap-2 mt-12">
        {quotes.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
              i === currentQuoteIndex
                ? "bg-[var(--accent)] w-12"
                : i < currentQuoteIndex
                ? "bg-[var(--accent)]/40"
                : "bg-[var(--border)]"
            }`}
          />
        ))}
      </div>
    </main>
  );
}

type ButtonVariant = "default" | "indigo" | "rose" | "emerald" | "violet";

interface ControlButtonProps {
  onClick: () => void;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  variant?: ButtonVariant;
  active?: boolean;
  disabled?: boolean;
}

function ControlButton({
  onClick,
  label,
  subLabel,
  icon,
  variant = "default",
  active = false,
  disabled = false,
}: ControlButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    default: "bg-[var(--surface-elevated)]/60 text-[var(--text-primary)]",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    violet: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 ${
        variants[variant]
      } ${disabled ? "opacity-30 cursor-not-allowed" : "border-[var(--border)] shadow-lg hover:shadow-xl"}`}
    >
      <div className={`mb-4 flex items-center justify-center size-14 rounded-2xl ${active ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      <span className="text-sm font-bold">{label}</span>
      <span className="text-[10px] opacity-60 uppercase tracking-widest mt-1">
        {subLabel}
      </span>
    </motion.button>
  );
}
