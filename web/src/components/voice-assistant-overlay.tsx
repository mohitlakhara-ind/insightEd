"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  ArrowRight,
  History,
  AlertTriangle,
  Radio,
  Keyboard,
  Compass,
} from "lucide-react";
import { useVoiceStore } from "@/hooks/use-voice-store";
import { useAuth } from "@/context/auth-context";
import { AlanService } from "@/services/alan-service";
import { WakeWordDetector } from "@/services/wake-word-detector";
import { generateSessionId } from "@/services/voice-analytics";

export function VoiceAssistantOverlay() {
  const router = useRouter();
  const { profile } = useAuth();
  const store = useVoiceStore();

  const [handsFree, setHandsFree] = useState(true);
  const [manualText, setManualText] = useState("");
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sessionIdRef = useRef("");
  const wakeDetectorRef = useRef<WakeWordDetector | null>(null);
  const alanServiceRef = useRef<AlanService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Wake Word callback logic
  const handleWakeWordDetected = useCallback(async (spokenText?: string) => {
    if (!alanServiceRef.current) return;

    const userName = profile?.displayName?.split(" ")[0] || "user";
    
    // Set visual UI state immediately
    useVoiceStore.getState().setOpen(true);
    useVoiceStore.getState().setVoiceState("wake_detected");

    // Initialize Alan cloud connection
    const connected = await alanServiceRef.current.initialize();
    if (connected) {
      alanServiceRef.current.setContext(userName);

      // Check if the user spoke a command directly with the wake word
      // e.g. "hello alan open courses"
      const cleanText = spokenText ? spokenText.toLowerCase().trim() : "";
      
      const courseKeywords = [
        "course", "learn", "lesson", "class", "study", "vocational", "catalog", "track",
        "dsa", "python", "fullstack", "web", "speaking", "agile", "scrum", "design", "ui", "ux", "mastery", "basics"
      ];
      const gameKeywords = ["game", "mind", "play", "puzzle", "match", "cognitive", "brain", "toy"];
      const communityKeywords = ["community", "ai community", "mitra", "sarah", "companion", "coach", "chat", "connect", "social"];
      const pronunciationKeywords = ["pronunciation", "speech", "coach", "practice", "speak", "talk", "voice", "pronounce", "speaking", "talking"];
      const homeKeywords = ["home", "welcome", "main", "start", "dashboard", "index"];

      const matchesAny = (text: string, keywords: string[]) => {
        return keywords.some(keyword => text.includes(keyword));
      };

      // Check if it's a custom learned command in localStorage
      let isLearned = false;
      try {
        const stored = localStorage.getItem("insightEd_learned_commands");
        if (stored) {
          const learned = JSON.parse(stored);
          if (learned[cleanText]) {
            isLearned = true;
          }
        }
      } catch (e) {}

      const hasCommand = 
        isLearned ||
        matchesAny(cleanText, courseKeywords) ||
        matchesAny(cleanText, gameKeywords) ||
        matchesAny(cleanText, communityKeywords) ||
        matchesAny(cleanText, pronunciationKeywords) ||
        matchesAny(cleanText, homeKeywords);

      if (hasCommand) {
        // Set user transcript immediately so they see their command in the UI
        useVoiceStore.getState().setTranscript(spokenText || "");
        // Direct command execution (bypass welcome greeting to improve responsiveness)
        setTimeout(() => {
          alanServiceRef.current?.sendText(cleanText);
        }, 400);
      } else {
        // Standard interactive greeting
        setTimeout(() => {
          alanServiceRef.current?.playText(`Hello ${userName}, how can I help you today?`);
          
          // Open microphone capture after greeting speech finishes (approx 2.5 seconds)
          setTimeout(() => {
            alanServiceRef.current?.activate();
          }, 2500);
        }, 400);
      }
    }
  }, [profile]);

  // Initialize unique session details and service singletons
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    sessionIdRef.current = generateSessionId();

    const detector = WakeWordDetector.getInstance();
    const alan = AlanService.getInstance();
    
    const uid = profile?.uid || "Guest";
    detector.setSessionContext(sessionIdRef.current, uid);
    alan.setSessionContext(sessionIdRef.current, uid);

    wakeDetectorRef.current = detector;
    alanServiceRef.current = alan;

    // Bind route navigation from Alan to Next.js
    alan.setNavigationCallback((route: string) => {
      router.push(route);
      useVoiceStore.getState().setAssistantResponse(`Navigating to ${route.replace("/", "") || "home"}...`);
    });

    return () => {
      detector.stop();
      alan.destroy();
    };
  }, [profile, router]);

  // Handle auto-scroll inside transcript bubbles
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [store.transcript, store.assistantResponse]);

  // Synchronize hands-free setting with WakeWordDetector
  useEffect(() => {
    if (!mounted) return;

    const startWakeWordEngine = async () => {
      if (handsFree && (store.state === "idle" || store.state === "passive_listening")) {
        console.log("[Overlay] Enabling hands-free wake word detection...");
        await wakeDetectorRef.current?.start(
          handleWakeWordDetected,
          (err) => {
            console.error("[Overlay] Wake word engine error:", err);
            if (err === "not-allowed") {
              setHandsFree(false);
            }
          }
        );
      } else if (!handsFree) {
        console.log("[Overlay] Disabling hands-free wake word detection...");
        wakeDetectorRef.current?.stop();
      }
    };

    startWakeWordEngine();
  }, [handsFree, store.state, mounted, handleWakeWordDetected]);

  // Toggle overlay click events
  const handleOrbClick = async () => {
    if (!alanServiceRef.current) return;

    if (store.isOpen) {
      // Close panel and stop microphone capture
      store.setOpen(false);
      alanServiceRef.current.deactivate();
      // Resume passive listening if hands-free is enabled
      if (handsFree) {
        store.setVoiceState("passive_listening");
      } else {
        store.setVoiceState("idle");
      }
    } else {
      // Open panel and start active session
      store.setOpen(true);
      store.setVoiceState("alan_connecting");

      const connected = await alanServiceRef.current.initialize();
      if (connected) {
        const userName = profile?.displayName?.split(" ")[0] || "user";
        alanServiceRef.current.setContext(userName);
        alanServiceRef.current.activate();
      }
    }
  };

  // Stop active microphone
  const handleStopMic = () => {
    alanServiceRef.current?.deactivate();
    store.setVoiceState("idle");
  };

  // Retry voice setup
  const handleRetryPermission = async () => {
    store.setError(null);
    store.setVoiceState("idle");
    if (wakeDetectorRef.current) {
      await wakeDetectorRef.current.start(
        handleWakeWordDetected,
        (err) => console.error(err)
      );
    }
  };

  // Handle typing submission fallback
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim() || !alanServiceRef.current) return;

    const query = manualText.trim();
    store.setTranscript(query);
    store.addCommand(query);
    
    // Send raw text input directly to Alan NLP parsing
    alanServiceRef.current.sendText(query);
    setManualText("");
    setIsKeyboardMode(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Assistant Orb */}
      <motion.button
        onClick={handleOrbClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-[60] flex h-16 w-16 items-center justify-center rounded-full border shadow-2xl transition-all outline-none ${
          store.isOpen
            ? "bg-[var(--accent)] text-[var(--accent-fg)] border-white/20"
            : store.state === "passive_listening"
            ? "bg-gradient-to-tr from-emerald-500 to-teal-600 text-white border-white/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            : store.state === "listening"
            ? "bg-rose-500 text-white border-white/30 animate-pulse shadow-[0_0_25px_rgba(244,63,94,0.5)]"
            : store.state === "speaking"
            ? "bg-indigo-600 text-white border-white/30 shadow-[0_0_25px_rgba(79,70,229,0.5)]"
            : store.state === "processing"
            ? "bg-amber-500 text-white border-white/20 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            : "bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent)] text-[var(--accent-fg)] border-white/10 shadow-[0_0_20px_rgba(233,30,99,0.3)]"
        }`}
        aria-label={store.isOpen ? "Close voice panel" : "Open accessibility voice companion"}
        aria-expanded={store.isOpen}
      >
        {store.isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            {store.state === "listening" ? (
              <Mic className="h-6 w-6 animate-bounce" />
            ) : store.state === "processing" ? (
              <Sparkles className="h-6 w-6 animate-spin" />
            ) : store.state === "passive_listening" ? (
              <>
                <Radio className="h-6 w-6" />
                <span className="absolute -inset-1.5 animate-ping rounded-full border border-emerald-400 opacity-60" />
              </>
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </div>
        )}
      </motion.button>

      {/* Slide-out Sidebar Panel */}
      <AnimatePresence>
        {store.isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 420 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 420 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] border-l border-white/10 bg-[var(--surface-elevated)]/85 p-6 pt-24 shadow-2xl backdrop-blur-2xl flex flex-col justify-between"
            role="dialog"
            aria-modal="true"
          >
            {/* Top glassmorphic decor blobs */}
            <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-[var(--accent)]/10 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-10 left-0 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

            <div className="flex flex-col gap-6 flex-grow overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    store.state === "listening"
                      ? "bg-rose-500 animate-pulse"
                      : store.state === "passive_listening"
                      ? "bg-emerald-400"
                      : store.state === "speaking"
                      ? "bg-indigo-500 animate-ping"
                      : "bg-white/30"
                  }`} />
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                      InsightEd Voice <span className="text-[var(--accent)]">Companion</span>
                    </h2>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      {store.state === "passive_listening" ? "Hands-Free Awake Mode" : `State: ${store.state.replace("_", " ")}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => store.setOpen(false)}
                  className="rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status and Wave visualizer */}
              <div className="relative flex h-24 items-center justify-center gap-1.5 overflow-hidden rounded-2xl border border-white/10 bg-black/40 px-4">
                {store.state === "listening" && (
                  <span className="absolute top-2 left-4 flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-rose-400 uppercase">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                    </span>
                    Listening to you...
                  </span>
                )}
                {store.state === "speaking" && (
                  <span className="absolute top-2 left-4 flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-indigo-400 uppercase">
                    <Volume2 className="h-3.5 w-3.5" /> Speak Feedback
                  </span>
                )}
                {store.state === "passive_listening" && (
                  <span className="absolute top-2 left-4 flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-emerald-400 uppercase">
                    <Radio className="h-3.5 w-3.5" /> Passive listening for &quot;Hello Alan&quot;
                  </span>
                )}

                {/* Animated waves */}
                {Array.from({ length: 18 }).map((_, index) => {
                  const isActive = store.state === "listening" || store.state === "speaking" || store.state === "processing";
                  return (
                    <motion.div
                      key={index}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        store.state === "listening"
                          ? "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                          : store.state === "speaking"
                          ? "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                          : store.state === "processing"
                          ? "bg-amber-400"
                          : "bg-white/15"
                      }`}
                      style={{ height: isActive ? `${16 + (index % 6) * 7}px` : "8px" }}
                      animate={
                        isActive
                          ? {
                              scaleY: [1, 1.3, 0.7, 1],
                              transition: {
                                repeat: Infinity,
                                duration: 0.6,
                                delay: index * 0.02,
                              },
                            }
                          : {}
                      }
                    />
                  );
                })}

                {store.state === "alan_connecting" && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 backdrop-blur-sm">
                    <Sparkles className="h-5 w-5 animate-spin text-[var(--accent)]" />
                    <span className="text-xs font-semibold text-white/70">Connecting to Alan cloud...</span>
                  </div>
                )}
              </div>

              {/* Chat bubbles container */}
              <div
                ref={scrollRef}
                className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/10"
              >
                {/* Transcript bubble */}
                {store.transcript && (
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-bold text-white/40 tracking-wide uppercase mr-2">You</span>
                    <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-[var(--accent)] px-4 py-3 text-xs font-semibold text-white shadow-md">
                      {store.transcript}
                    </div>
                  </div>
                )}

                {/* Assistant bubble */}
                <div className="flex flex-col items-start gap-1.5">
                  <span className="text-[10px] font-bold text-white/40 tracking-wide uppercase ml-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-[var(--accent)]" /> Assistant
                  </span>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-none border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed font-medium text-white/90 shadow-md">
                    {store.assistantResponse}
                  </div>
                </div>

                {/* Error Banner Fallback */}
                {store.state === "mic_blocked" && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Microphone Access Blocked</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-white/70">
                      Microphone permission was denied. To use voice companion services:
                      <br />
                      1. Click the **lock icon** in the browser search bar.
                      <br />
                      2. Toggle **Microphone** to **Allow**.
                      <br />
                      3. Click retry below to restart the service.
                    </p>
                    <button
                      onClick={handleRetryPermission}
                      className="w-full rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/30"
                    >
                      Retry Permission Request
                    </button>
                  </div>
                )}

                {store.state === "error" && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Service Connection Issue</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-white/70">
                      {store.errorMessage || "Unable to reach the voice assistance endpoints."}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick shortcuts */}
              <div className="space-y-2.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-white/40 uppercase">
                  <Compass className="h-3.5 w-3.5" /> Navigation Commands
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { text: "Learn Vocations", cmd: "open courses" },
                    { text: "Play Mind Games", cmd: "open games" },
                    { text: "AI Speech Coach", cmd: "open pronunciation coach" },
                    { text: "Open AI Community", cmd: "open community" },
                  ].map((shortcut) => (
                    <button
                      key={shortcut.cmd}
                      onClick={() => {
                        store.setTranscript(shortcut.cmd);
                        alanServiceRef.current?.sendText(shortcut.cmd);
                      }}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white active:scale-95 transition-all"
                    >
                      {shortcut.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Command history drawer toggle */}
              {store.commandHistory.length > 0 && (
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-white/40 uppercase">
                    <History className="h-3.5 w-3.5" /> Recent Directives
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {store.commandHistory.map((item, idx) => (
                      <span
                        key={idx}
                        className="flex-shrink-0 rounded-lg bg-white/5 border border-white/5 px-2.5 py-1 text-[11px] text-white/60 font-semibold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls / Text Fallback Input */}
            <div className="border-t border-white/10 pt-4 mt-4 space-y-4 bg-[var(--surface-elevated)]">
              {/* Keyboard manual entry form */}
              {isKeyboardMode ? (
                <form onSubmit={handleTextSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Type a voice shortcut (e.g. open courses)..."
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/35 py-3.5 pl-4 pr-12 text-xs font-semibold text-white outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 rounded-lg bg-[var(--accent)] p-2 text-white hover:brightness-110 active:scale-95 transition-all"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="flex gap-3">
                  {store.state === "listening" ? (
                    <button
                      onClick={handleStopMic}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-rose-500 active:scale-98 transition-all"
                    >
                      <MicOff className="h-4 w-4" />
                      <span>Stop Active Mic</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => alanServiceRef.current?.activate()}
                      disabled={store.state === "alan_connecting"}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent)] px-4 py-3.5 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-98 disabled:opacity-50 transition-all"
                    >
                      <Mic className="h-4 w-4" />
                      <span>Activate Mic</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsKeyboardMode(true)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    aria-label="Switch to keyboard typing mode"
                  >
                    <Keyboard className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Hands-Free Settings controls */}
              <div className="flex items-center justify-between bg-black/20 rounded-xl p-3.5 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">Hands-Free Mode</p>
                    <p className="text-[10px] text-white/50">Listen for &quot;Hello Alan&quot; phrase</p>
                  </div>
                </div>
                <button
                  onClick={() => setHandsFree(!handsFree)}
                  role="switch"
                  aria-checked={handsFree}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none focus:ring-1 focus:ring-emerald-500 ${
                    handsFree ? "bg-emerald-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      handsFree ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Footnote showing engine status */}
              <div className="flex justify-between items-center text-[9px] text-white/30 font-semibold px-1">
                <span>Telemetry Logging: Active (Firebase)</span>
                <span>Wake engine: {store.wakeEngine || "offline"}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
