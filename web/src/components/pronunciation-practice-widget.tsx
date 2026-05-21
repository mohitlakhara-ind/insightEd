"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { AudioService } from "@/lib/audio-service";

const PRACTICE_PHRASE = "We leverage digital platforms to innovate.";

function scoreTranscript(spoken: string, target: string): number {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();

  const spokenWords = normalize(spoken).split(/\s+/).filter(Boolean);
  const targetWords = normalize(target).split(/\s+/).filter(Boolean);
  if (!spokenWords.length || !targetWords.length) return 0;

  const matches = targetWords.filter((word, index) => spokenWords[index] === word).length;
  const coverage = matches / targetWords.length;
  const lengthPenalty = Math.min(spokenWords.length, targetWords.length) / targetWords.length;
  return Math.round(Math.min(100, coverage * 85 + lengthPenalty * 15));
}

export function PronunciationPracticeWidget() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");

  // Simulated audio playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const finishPractice = useCallback((spokenText: string) => {
    const computedScore = scoreTranscript(spokenText, PRACTICE_PHRASE);
    setScore(computedScore);
    setHasRecorded(true);
    setLiveTranscript(spokenText);
  }, []);

  const { start, stop, isListening, isSupported } = useSpeechRecognition({
    lang: "en-US",
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      setLiveTranscript(text);
      if (isFinal) {
        finishPractice(text);
      }
    },
    onError: (error) => {
      setRecognitionError(
        error === "not-allowed"
          ? "Microphone access is required for pronunciation practice."
          : error === "unsupported"
            ? "Speech recognition is not supported in this browser. Try Chrome or Edge."
            : "Could not capture your voice. Please try again."
      );
    },
  });

  const handlePlayDemo = async () => {
    if (isListening) return;
    setProgress(0);
    setIsPlaying(true);
    setRecognitionError(null);
    try {
      await AudioService.speak(PRACTICE_PHRASE);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleRecord = async () => {
    if (isPlaying) setIsPlaying(false);
    setHasRecorded(false);
    setScore(null);
    setRecognitionError(null);
    setLiveTranscript("");

    if (!isSupported) {
      setRecognitionError("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      stop();
      return;
    }

    const started = await start();
    if (!started) {
      setRecognitionError("Could not start listening. Check microphone permissions and try again.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] glass-card p-5 sm:p-8 md:p-12 border border-[var(--border)] max-w-4xl mx-auto">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-[var(--accent-primary)]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="grid gap-8 md:gap-12 md:grid-cols-12 items-center relative z-10">
        
        {/* Widget Info (Left 5 columns) */}
        <div className="md:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)]/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Interactive Lab
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            AI Pronunciation Coach
          </h3>

          <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
            Try a live practice card below. Hear the perfect pronunciation, record your attempt, 
            and receive instant phoneme-level voice coaching designed for absolute clarity.
          </p>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Practice Phrase</span>
            <h4 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              &ldquo;{PRACTICE_PHRASE}&rdquo;
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--accent)] font-semibold mt-1">
              <span>Phonetic Focus:</span>
              <span className="bg-[var(--accent-subtle)] px-2 py-0.5 rounded-md">/ˈlɛv.ər.ɪdʒ/</span>
            </div>
          </div>
        </div>

        {/* Waveform & Recording Interaction (Right 7 columns) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center p-5 sm:p-6 md:p-8 rounded-2xl bg-[var(--background)]/40 border border-[var(--border)] min-h-[280px] relative">
          
          {/* Simulated Waveform Visualization */}
          <div className="w-full h-32 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 mb-8">
            {Array.from({ length: 28 }).map((_, index) => {
              // Calculate heights dynamically based on active state
              let height = "h-4";
              if (isPlaying) {
                // Wave moving left to right based on play progress
                const activeIndex = Math.floor((progress / 100) * 28);
                const distance = Math.abs(index - activeIndex);
                if (distance === 0) height = "h-20";
                else if (distance === 1) height = "h-16";
                else if (distance === 2) height = "h-12";
                else if (distance === 3) height = "h-8";
                else height = "h-6";
              } else if (isListening) {
                // Determine base height based on index to simulate nice bar variation
                const heights = [24, 16, 8, 16, 24, 16, 8, 12];
                const heightVal = heights[index % heights.length];
                height = `h-${heightVal}`;
              } else {
                // Default inactive resting state heights
                const restingHeights = [4, 6, 8, 10, 14, 18, 14, 10, 8, 12, 16, 20, 24, 20, 16, 12, 8, 6, 10, 14, 18, 14, 10, 8, 6, 4, 4, 4];
                const heightVal = restingHeights[index % restingHeights.length];
                height = `h-${heightVal}`;
              }

              return (
                <motion.span
                  key={index}
                  className={`w-1 md:w-1.5 rounded-full transition-all duration-150 ${
                    index >= 18 ? "hidden sm:block" : "block"
                  } ${
                    isPlaying
                      ? "bg-[var(--accent-primary)] shadow-[0_0_10px_rgba(63,81,181,0.5)]"
                      : isListening
                      ? "bg-[var(--accent)] shadow-[0_0_10px_rgba(233,30,99,0.5)]"
                      : "bg-white/20"
                  }`}
                  style={{
                    height: height.startsWith("h-") ? `${parseInt(height.replace("h-", "")) * 4}px` : "16px",
                  }}
                  animate={isListening ? { scaleY: [1, 1.2, 0.8, 1], transition: { repeat: Infinity, duration: 0.5, delay: index * 0.02 } } : {}}
                />
              );
            })}
          </div>

          {/* Action Button Row */}
          <div className="flex items-center gap-6 z-10">
            <button
              onClick={handlePlayDemo}
              disabled={isPlaying || isListening}
              className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                isPlaying 
                  ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30" 
                  : "bg-white/5 text-[var(--text-primary)] border border-[var(--border)] hover:bg-white/10 hover:border-white/20 active:scale-95"
              }`}
              aria-label="Listen to model voice"
            >
              {isPlaying ? (
                <svg className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Microphone Trigger Button */}
            <motion.button
              onClick={handleRecord}
              disabled={isPlaying}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`h-20 w-20 rounded-full flex flex-col items-center justify-center shadow-2xl relative transition-all ${
                isListening
                  ? "bg-[var(--accent)] text-[var(--accent-fg)] shadow-[0_0_35px_rgba(233,30,99,0.7)]"
                  : "bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent)] text-[var(--accent-fg)] hover:shadow-[0_0_25px_rgba(233,30,99,0.4)]"
              }`}
              aria-label={isListening ? "Listening. Speak the practice phrase." : "Press to start pronunciation practice"}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              
              {/* Outer pulsing ring during recording */}
              {isListening && (
                <span className="absolute inset-0 rounded-full border-4 border-[var(--accent)] animate-ping opacity-60 pointer-events-none" />
              )}
            </motion.button>

            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/5 border border-[var(--border)] text-[var(--text-secondary)]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* Feedback & Score Announcement Overlay */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 bottom-4 text-center px-4"
              >
                <span className="text-sm font-bold text-[var(--accent)] animate-pulse uppercase tracking-wider">
                  Listening... Speak the phrase clearly
                </span>
                {liveTranscript && (
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">&ldquo;{liveTranscript}&rdquo;</p>
                )}
              </motion.div>
            )}

            {recognitionError && !isListening && (
              <p className="absolute inset-x-0 bottom-4 px-4 text-center text-xs font-semibold text-red-400">
                {recognitionError}
              </p>
            )}

            {!isListening && score !== null && hasRecorded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-[var(--background)]/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 space-y-4"
              >
                <div className="relative flex items-center justify-center">
                  {/* Glowing Score Ring */}
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="url(#roseGradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * score) / 100}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-primary)" />
                        <stop offset="100%" stopColor="var(--accent)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-2xl font-black text-white">{score}%</span>
                </div>

                <div className="text-center space-y-1">
                  <h4 className="text-lg font-bold text-white">
                    {score >= 80 ? "Excellent Pronunciation!" : "Keep Practicing!"}
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {liveTranscript
                      ? <>You said: &ldquo;{liveTranscript}&rdquo;</>
                      : "Try speaking the full practice phrase again."}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setScore(null);
                    setHasRecorded(false);
                    setLiveTranscript("");
                    setRecognitionError(null);
                  }}
                  className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/5 text-xs font-bold text-white transition-all active:scale-95"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
