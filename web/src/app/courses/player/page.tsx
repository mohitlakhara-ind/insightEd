"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { DynamicBackground } from "@/components/dynamic-background";
import { db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, 
  Settings, ChevronLeft, Headphones, MessageSquare, 
  HelpCircle, CheckCircle, BookOpen, Loader2
} from "lucide-react";

interface Course {
  id?: string;
  name: string;
  category: "technical" | "non-technical";
  episodes: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  description?: string;
}

const FALLBACK_COURSE: Course = {
  name: "Data Structures & Algorithms Mastery",
  category: "technical",
  episodes: 10,
  level: "Intermediate",
  description: "Master core algorithms, complexity analysis, and modern problem solving strategies."
};

// Simulated episodes / chapters data for playback
const CHAPTERS = [
  {
    title: "Introduction to Computational Complexity",
    duration: "12:45",
    transcript: [
      { time: "0:00", text: "Welcome to Data Structures and Algorithms. Today we are diving into algorithmic complexity." },
      { time: "0:15", text: "First, let's consider why efficiency matters. If you have millions of rows, execution speed is paramount." },
      { time: "0:45", text: "Big O notation allows us to mathematically express how run time scales with input size." },
      { time: "1:20", text: "We will compare constant time O(1), linear time O(n), and quadratic time O(n squared)." },
      { time: "2:05", text: "Remember: always prioritize minimizing space complexity along with time complexity." }
    ],
    quiz: {
      question: "Which time complexity scales linearly with the input size?",
      options: ["O(1) - Constant Time", "O(n) - Linear Time", "O(log n) - Logarithmic Time", "O(n²) - Quadratic Time"],
      answerIndex: 1
    }
  },
  {
    title: "Understanding Arrays and Memory Allocation",
    duration: "09:30",
    transcript: [
      { time: "0:00", text: "In this second session, we are analyzing contiguous memory blocks, commonly known as arrays." },
      { time: "0:30", text: "An array stores elements of the same type in sequential memory locations." },
      { time: "1:00", text: "Accessing elements in an array takes O(1) constant time, because we can compute offsets directly." },
      { time: "1:45", text: "However, insertion and deletion are slower, typically scaling to O(n) due to shifting." }
    ],
    quiz: {
      question: "What is the time complexity to access an element by index in a standard array?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
      answerIndex: 2
    }
  },
  {
    title: "Singly and Doubly Linked Lists Structure",
    duration: "14:15",
    transcript: [
      { time: "0:00", text: "Welcome back. Today we transition from contiguous memory to node-based storage: Linked Lists." },
      { time: "0:25", text: "Unlike arrays, linked lists do not require contiguous allocation. Nodes point to their neighbors." },
      { time: "1:10", text: "A singly linked list has a next pointer, while a doubly linked list has both next and previous pointers." }
    ],
    quiz: {
      question: "Which of the following is an advantage of Linked Lists over static Arrays?",
      options: ["Dynamic allocation size", "O(1) random access", "Less memory overhead", "Better cache locality"],
      answerIndex: 0
    }
  }
];

function CoursePlayer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isQuizCorrect, setIsQuizCorrect] = useState(false);

  // Audio wave animation simulation
  const [waveBars, setWaveBars] = useState<number[]>(() => Array.from({ length: 20 }, () => Math.floor(Math.random() * 20) + 5));

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        setCourse(FALLBACK_COURSE);
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "courses", courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourse(docSnap.data() as Course);
        } else {
          setCourse(FALLBACK_COURSE);
        }
      } catch (err) {
        console.error("Firestore retrieval error, falling back:", err);
        setCourse(FALLBACK_COURSE);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [courseId]);

  // Audio time simulator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 180) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1 * playbackSpeed;
        });
        // Jitter the audio visualization live bars
        setWaveBars((prev) => prev.map(() => Math.floor(Math.random() * 32) + 6));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const activeChapter = CHAPTERS[activeChapterIndex % CHAPTERS.length];

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextChapter = () => {
    if (activeChapterIndex < CHAPTERS.length - 1) {
      setActiveChapterIndex(activeChapterIndex + 1);
      setCurrentTime(0);
      setIsPlaying(false);
      setSelectedQuizOption(null);
      setQuizSubmitted(false);
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex(activeChapterIndex - 1);
      setCurrentTime(0);
      setIsPlaying(false);
      setSelectedQuizOption(null);
      setQuizSubmitted(false);
    }
  };

  const handleQuizSubmit = () => {
    if (selectedQuizOption === null) return;
    setQuizSubmitted(true);
    const correct = selectedQuizOption === activeChapter.quiz.answerIndex;
    setIsQuizCorrect(correct);
  };

  // Convert seconds to MM:SS format
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#11131c]">
        <Loader2 className="animate-spin text-[var(--accent)] mb-4" size={48} />
        <span className="text-[var(--text-secondary)] font-bold">Connecting secure media pipelines...</span>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen pt-24 pb-20 px-4 md:px-8 flex flex-col items-center">
      <DynamicBackground />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl flex items-center justify-between mb-10 relative z-10"
      >
        <button
          onClick={() => router.push("/courses")}
          className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Catalog
        </button>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
          <Headphones className="size-4 text-[var(--accent)] animate-bounce" />
          <span className="text-xs font-black uppercase tracking-wider text-white">Audio Deck Active</span>
        </div>
      </motion.header>

      {/* Main Player Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl relative z-10 items-start">
        
        {/* Left Column: Player and Controls (8 Columns) */}
        <section className="lg:col-span-7 space-y-8">
          
          {/* Main Course Info Card */}
          <div className="rounded-3xl glass-card p-8 border border-[var(--border)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-4">
              <BookOpen className="size-4" />
              <span>Chapter {activeChapterIndex + 1} of {CHAPTERS.length}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              {activeChapter.title}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              Track: {course?.name || FALLBACK_COURSE.name} · Level: {course?.level || "Intermediate"}
            </p>

            {/* Simulated Live Audio Stream Visualization */}
            <div className="h-28 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-center gap-1.5 px-6 mb-6">
              {waveBars.map((val, idx) => (
                <span
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlaying 
                      ? "bg-gradient-to-t from-[var(--accent-primary)] to-[var(--accent)]" 
                      : "bg-white/10"
                  }`}
                  style={{ height: `${val * 2}px` }}
                />
              ))}
            </div>

            {/* Time Slider */}
            <div className="space-y-2 mb-8">
              <div className="w-full h-1.5 rounded-full bg-white/10 relative overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent)] rounded-full transition-all"
                  style={{ width: `${(currentTime / 180) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
                <span>{formatTime(currentTime)}</span>
                <span>{activeChapter.duration}</span>
              </div>
            </div>

            {/* Interactive Deck Control buttons */}
            <div className="flex flex-wrap items-center justify-between gap-6">
              
              {/* Skip Back / Play / Skip Forward */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePrevChapter}
                  disabled={activeChapterIndex === 0}
                  className="size-11 rounded-full border border-[var(--border)] bg-white/5 text-white flex items-center justify-center hover:bg-white/10 active:scale-95 disabled:opacity-40"
                  aria-label="Previous chapter"
                >
                  <SkipBack size={18} />
                </button>

                <button 
                  onClick={handleTogglePlay}
                  className="size-16 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent)] text-white flex items-center justify-center hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(233,30,99,0.3)] hover:shadow-[0_0_30px_rgba(233,30,99,0.5)] transition-all"
                  aria-label={isPlaying ? "Pause chapter narration" : "Play chapter narration"}
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>

                <button 
                  onClick={handleNextChapter}
                  disabled={activeChapterIndex === CHAPTERS.length - 1}
                  className="size-11 rounded-full border border-[var(--border)] bg-white/5 text-white flex items-center justify-center hover:bg-white/10 active:scale-95 disabled:opacity-40"
                  aria-label="Next chapter"
                >
                  <SkipForward size={18} />
                </button>
              </div>

              {/* Playback Speed Selection */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1 rounded-xl">
                {[0.5, 1.0, 1.5, 2.0].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`h-9 px-3 rounded-lg text-xs font-black transition-all ${
                      playbackSpeed === speed
                        ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                        : "text-[var(--text-secondary)] hover:text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Volume Controller */}
              <div className="flex items-center gap-2">
                <Volume2 className="size-4 text-[var(--text-muted)]" />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 accent-[var(--accent)] h-1 rounded-lg cursor-pointer bg-white/10"
                />
              </div>

            </div>
          </div>

          {/* Quick Concept Checkpoint Card */}
          <div className="rounded-3xl glass-card p-8 border border-[var(--border)] space-y-6">
            <div className="flex items-center gap-2">
              <span className="size-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <HelpCircle size={18} />
              </span>
              <h3 className="text-xl font-bold text-white">Concept Checkpoint</h3>
            </div>
            
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {activeChapter.quiz.question}
            </p>

            <div className="space-y-3">
              {activeChapter.quiz.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => !quizSubmitted && setSelectedQuizOption(idx)}
                  disabled={quizSubmitted}
                  className={`w-full p-4 rounded-xl text-left text-xs font-bold border transition-all flex items-center justify-between ${
                    quizSubmitted 
                      ? idx === activeChapter.quiz.answerIndex 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                        : idx === selectedQuizOption 
                        ? "bg-rose-500/10 border-rose-500 text-rose-400" 
                        : "bg-white/5 border-transparent text-[var(--text-muted)]"
                      : selectedQuizOption === idx 
                      ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]" 
                      : "bg-white/5 border-white/5 text-[var(--text-secondary)] hover:bg-white/10"
                  }`}
                >
                  <span>{opt}</span>
                  {quizSubmitted && idx === activeChapter.quiz.answerIndex && (
                    <CheckCircle size={16} className="text-emerald-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              {!quizSubmitted ? (
                <button
                  onClick={handleQuizSubmit}
                  disabled={selectedQuizOption === null}
                  className="h-11 px-6 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent)] text-white font-bold text-xs hover:scale-105 active:scale-95 disabled:opacity-40 transition-all"
                >
                  Verify Answer
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-extrabold ${isQuizCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                    {isQuizCorrect ? "Excellent, Correct Concept!" : "Incorrect option selected."}
                  </span>
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setSelectedQuizOption(null);
                    }}
                    className="h-10 px-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10"
                  >
                    Retry Quiz
                  </button>
                </div>
              )}
            </div>
          </div>

        </section>

        {/* Right Column: Scrolling Transcript and Audio Tips (4 Columns) */}
        <section className="lg:col-span-5 space-y-8">
          
          {/* Synchronized Scrolling Transcript */}
          <div className="rounded-3xl glass-card border border-[var(--border)] p-6 flex flex-col h-[400px]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-[var(--accent)]" />
                <h3 className="font-bold text-white text-sm">Live Audio Transcript</h3>
              </div>
              <span className="text-[10px] font-black uppercase text-[var(--accent)] tracking-wider px-2 py-0.5 rounded-md bg-[var(--accent-subtle)] border border-[var(--accent)]/10">
                Sync-On
              </span>
            </div>

            {/* Scrolling pane */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
              {activeChapter.transcript.map((line, idx) => {
                // Highlight active text block based on mock play timer offsets
                const lineSecs = Number(line.time.split(":")[0]) * 60 + Number(line.time.split(":")[1]);
                const isActive = isPlaying && currentTime >= lineSecs && currentTime < lineSecs + 20;

                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      isActive 
                        ? "bg-white/10 border-[var(--accent)]/40 shadow-sm" 
                        : "bg-transparent border-transparent"
                    }`}
                  >
                    <span className={`text-[10px] font-bold block mb-1 ${isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                      Offset {line.time}
                    </span>
                    <p className={`text-xs leading-relaxed ${isActive ? "text-white font-semibold" : "text-[var(--text-secondary)]"}`}>
                      {line.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accessible Control Shortcuts */}
          <div className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Settings className="size-4 text-[var(--accent)]" />
              Acoustic Hotkeys Guide
            </h3>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              For rapid, voice-controlled operations or screen readers, enjoy seamless global focus shortcuts:
            </p>

            <div className="space-y-2 pt-2 text-xs">
              {[
                { keys: "SPACEBAR", action: "Toggle Play / Pause narration" },
                { keys: "CTRL + RIGHT", action: "Fast-forward to next chapter" },
                { keys: "CTRL + LEFT", action: "Go back to previous chapter" },
                { keys: "UP / DOWN", action: "Shift playback narration volume" }
              ].map((shortcut, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-[var(--text-secondary)]">{shortcut.action}</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[10px] font-black text-white tracking-wide">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}

export default function CoursePlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#11131c]">
        <Loader2 className="animate-spin text-[var(--accent)] mb-4" size={48} />
        <span className="text-[var(--text-secondary)] font-bold">Connecting secure media pipelines...</span>
      </div>
    }>
      <CoursePlayer />
    </Suspense>
  );
}
