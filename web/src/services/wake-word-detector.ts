/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useVoiceStore } from "@/hooks/use-voice-store";
import { logVoiceEvent } from "./voice-analytics";

type WakeWordCallback = (text: string) => void;
type ErrorCallback = (error: string) => void;

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export class WakeWordDetector {
  private static instance: WakeWordDetector | null = null;
  private recognition: any = null;
  private isListening = false;
  private onWakeWordDetectedCallback: WakeWordCallback | null = null;
  private onErrorCallback: ErrorCallback | null = null;
  private sessionId = "";
  private userId = "Guest";

  // Re-start throttling properties
  private lastStartTime = 0;
  private restartCount = 0;
  private readonly RESTART_COOLDOWN = 1500; // ms
  private readonly MAX_RAPID_RESTARTS = 5;
  private restartTimeout: NodeJS.Timeout | null = null;
  private lastError: string | null = null;

  // Porcupine Engine properties (optional, deferred load)
  private porcupineWorker: any = null;

  private constructor() {
    if (typeof window !== "undefined") {
      this.initSpeechRecognition();
      // Handle tab visibility updates to save battery and micro-permissions
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }

  public static getInstance(): WakeWordDetector {
    if (!WakeWordDetector.instance) {
      WakeWordDetector.instance = new WakeWordDetector();
    }
    return WakeWordDetector.instance;
  }

  public setSessionContext(sessionId: string, userId: string) {
    this.sessionId = sessionId;
    this.userId = userId;
  }

  private initSpeechRecognition() {
    const SpeechCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechCtor) {
      console.warn("[WakeWordDetector] Web Speech API not supported in this browser.");
      return;
    }

    try {
      const rec = new SpeechCtor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        console.log("[WakeWordDetector] Continuous speech recognition started");
        this.restartCount = 0;
        this.lastError = null;
        useVoiceStore.getState().setVoiceState("passive_listening");
        useVoiceStore.getState().setWakeEngine("web-speech");
        // Clear any previous transient network errors
        if (useVoiceStore.getState().errorMessage?.includes("network") || useVoiceStore.getState().errorMessage?.includes("reconnecting")) {
          useVoiceStore.getState().setError(null);
        }
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }

        // Clean punctuation and normalize spacing for robust matching
        const cleanText = text
          .toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        console.log("[WakeWordDetector] Speech chunk observed:", cleanText);

        // Phonetic variants of "alan"
        const alanVariants = [
          "alan", "allen", "alans", "ellen", "alon", "alana", "alone", 
          "elena", "allan", "alans", "ellens", "alons", "ellin", "hellen", "helan"
        ];
        // Wake-word activation prefixes
        const prefixes = ["hello", "hey", "hi", "ok", "okay"];

        const words = cleanText.split(" ");
        let isMatched = false;

        // Check word-by-word for prefix followed by variant, or variant alone
        for (let i = 0; i < words.length; i++) {
          const currentWord = words[i];

          // Check if current word is a variant of alan
          if (alanVariants.includes(currentWord)) {
            // Check prefix before the variant (e.g. "hey alan")
            const prevWord = i > 0 ? words[i - 1] : null;
            if (prevWord && prefixes.includes(prevWord)) {
              isMatched = true;
              break;
            }

            // Fallback: variant in a short utterance (<= 3 words total)
            if (words.length <= 3) {
              isMatched = true;
              break;
            }
          }
        }

        // Check if cleanText contains any direct commands or custom learned commands
        let isDirectCommand = false;
        const directPhrases = [
          "courses", "course", "open courses", "go to courses", "learn vocations", "vocational courses", "catalog", "browse catalog",
          "games", "game", "open games", "go to games", "mind games", "play games", "play mind games",
          "community", "open community", "go to community", "ai community", "ai companions", "ai coach", "chat rooms", "chat room",
          "pronunciation", "pronunciation coach", "open pronunciation", "speech coach", "ai speech coach", "practice pronunciation", "practice speaking",
          "home", "go home", "go to home", "main page", "welcome page", "dashboard"
        ];

        try {
          const stored = localStorage.getItem("insightEd_learned_commands");
          if (stored) {
            const learned = JSON.parse(stored);
            directPhrases.push(...Object.keys(learned));
          }
        } catch (e) {}

        const cleanWords = cleanText.split(" ");
        if (cleanWords.length <= 5) { // Only trigger on short direct commands to avoid false positives in long sentences
          for (const phrase of directPhrases) {
            const normalizedPhrase = phrase.toLowerCase().trim();
            if (
              cleanText === normalizedPhrase ||
              cleanText.endsWith(" " + normalizedPhrase) ||
              cleanText.startsWith(normalizedPhrase + " ")
            ) {
              isDirectCommand = true;
              break;
            }
          }
        }

        if (!isDirectCommand) {
          const courseActionKeywords = [
            "select", "play", "pause", "resume", "stop", "next", "previous", "close", "exit", "start", "take", "choose", "submit"
          ];
          const courseNounKeywords = [
            "lesson", "episode", "course", "quiz", "option", "question", "answer", "track",
            "dsa", "mastery", "fullstack", "web", "python", "basics", "speaking", "project", "management", "design"
          ];
          const hasAction = courseActionKeywords.some(kw => cleanText.includes(kw));
          const hasNoun = courseNounKeywords.some(kw => cleanText.includes(kw));
          if (hasAction && hasNoun) {
            isDirectCommand = true;
          }
        }

        if (isMatched || isDirectCommand) {
          console.log("[WakeWordDetector] Wake word or direct command DETECTED!");
          this.triggerWakeWord(cleanText);
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        const err = event.error;
        if (err === "no-speech" || err === "network" || err === "aborted") {
          console.warn("[WakeWordDetector] Transient event during recognition:", err);
        } else {
          console.error("[WakeWordDetector] Error during recognition:", err);
        }
        this.lastError = err;

        if (err === "not-allowed" || err === "permission-denied") {
          this.isListening = false;
          useVoiceStore.getState().setMicPermission("denied");
          useVoiceStore.getState().setVoiceState("mic_blocked");
          this.onErrorCallback?.("not-allowed");
          logVoiceEvent({
            sessionId: this.sessionId,
            userId: this.userId,
            event: "mic_permission_denied",
            errorCode: "not-allowed",
            errorMessage: "Microphone permission denied by browser policy",
          });
          return;
        }

        if (err === "no-speech" || err === "aborted" || err === "network") {
          // Normal or transient behavior, ignore telemetry logs to prevent database spam
          return;
        }

        // Catch other errors (network, audio-capture, etc.)
        logVoiceEvent({
          sessionId: this.sessionId,
          userId: this.userId,
          event: "voice_error",
          errorCode: err,
          errorMessage: `Web Speech API error: ${err}`,
        });
      };

      rec.onend = () => {
        console.log("[WakeWordDetector] Recognition stream ended");
        if (this.isListening) {
          this.selfHealRestart();
        }
      };

      this.recognition = rec;
    } catch (e) {
      console.error("[WakeWordDetector] Failed to instantiate SpeechRecognition:", e);
    }
  }

  private triggerWakeWord(text: string) {
    // Temporarily stop listening to avoid self-triggering during Alan greetings
    this.stop();
    useVoiceStore.getState().setVoiceState("wake_detected");
    
    logVoiceEvent({
      sessionId: this.sessionId,
      userId: this.userId,
      event: "wake_word_detected",
      metadata: { engine: "web-speech", text },
    });

    if (this.onWakeWordDetectedCallback) {
      this.onWakeWordDetectedCallback(text);
    }
  }

  private selfHealRestart() {
    if (!this.isListening) return;

    const isNetworkError = this.lastError === "network";
    const delay = isNetworkError ? 5000 : 100;

    const now = Date.now();
    if (!isNetworkError) {
      if (now - this.lastStartTime < this.RESTART_COOLDOWN) {
        this.restartCount++;
      } else {
        this.restartCount = 0;
      }
    } else {
      // Reset rapid restart counter on network backoff to prevent permanent shutdown
      this.restartCount = 0;
      console.log("[WakeWordDetector] Network issue detected. Scheduling reconnect in 5s.");
      useVoiceStore.getState().setVoiceState("error");
      useVoiceStore.getState().setError("Speech connection interrupted. Retrying in 5 seconds...");
    }

    this.lastStartTime = now;

    if (this.restartCount > this.MAX_RAPID_RESTARTS) {
      console.error("[WakeWordDetector] Too many rapid restarts. Pausing voice assistant engine.");
      useVoiceStore.getState().setError("Voice engine was paused due to excessive reconnection loops.");
      this.isListening = false;
      return;
    }

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }

    this.restartTimeout = setTimeout(() => {
      if (this.isListening && this.recognition) {
        try {
          console.log("[WakeWordDetector] Attempting self-healing restart...");
          this.recognition.start();
        } catch (e) {
          // Recognition might already be running, ignore
          console.warn("[WakeWordDetector] Restart attempt failed (likely already running):", e);
        }
      }
    }, delay);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      console.log("[WakeWordDetector] Tab went to background. Suspending wake-word engine.");
      // Temporarily halt Web Speech recognition to conserve client CPU and respect privacy
      if (this.isListening && this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {
          /* ignore */
        }
      }
    } else {
      console.log("[WakeWordDetector] Tab returned to foreground. Resuming wake-word engine.");
      if (this.isListening && this.recognition) {
        this.selfHealRestart();
      }
    }
  };

  public async start(
    onWakeDetected: WakeWordCallback,
    onError: ErrorCallback
  ): Promise<boolean> {
    this.onWakeWordDetectedCallback = onWakeDetected;
    this.onErrorCallback = onError;

    if (this.isListening) return true;

    // Check for HTTPS/localhost context security constraints
    if (typeof window !== "undefined" && !window.isSecureContext) {
      useVoiceStore.getState().setError("Microphone services require a secure HTTPS context.");
      onError("insecure-context");
      return false;
    }

    // Try to trigger Picovoice Porcupine if config key is available
    const hasPorcupineKey = process.env.NEXT_PUBLIC_PICOVOICE_ACCESS_KEY;
    if (hasPorcupineKey) {
      const initialized = await this.startPorcupineEngine(hasPorcupineKey);
      if (initialized) {
        this.isListening = true;
        return true;
      }
      console.log("[WakeWordDetector] Falling back to browser Web Speech API...");
    }

    if (!this.recognition) {
      useVoiceStore.getState().setVoiceState("error");
      onError("unsupported");
      return false;
    }

    this.isListening = true;
    try {
      this.recognition.start();
      useVoiceStore.getState().setMicPermission("granted");
      
      logVoiceEvent({
        sessionId: this.sessionId,
        userId: this.userId,
        event: "mic_permission_granted",
        metadata: { method: "web-speech" },
      });
      return true;
    } catch (e: any) {
      // If error due to already started
      if (
        e?.name === "InvalidStateError" ||
        e?.message?.includes("already started") ||
        (e instanceof Error && e.message.includes("already started"))
      ) {
        return true;
      }
      console.error("[WakeWordDetector] Error starting SpeechRecognition:", e);
      this.isListening = false;
      return false;
    }
  }

  public stop() {
    this.isListening = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    // Stop Web Speech engine
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        /* ignore */
      }
    }

    // Stop Porcupine engine if active
    if (this.porcupineWorker) {
      try {
        this.porcupineWorker.terminate();
        this.porcupineWorker = null;
        console.log("[WakeWordDetector] Porcupine worker terminated");
      } catch (e) {
        /* ignore */
      }
    }

    if (useVoiceStore.getState().state === "passive_listening") {
      useVoiceStore.getState().setVoiceState("idle");
    }
  }

  // Implementation helper for Picovoice Porcupine WASM integration
  private async startPorcupineEngine(accessKey: string): Promise<boolean> {
    try {
      console.log("[WakeWordDetector] Initializing Picovoice Porcupine WASM engine...");
      // Dynamically import Porcupine to prevent Server-Side compilation crashes in Next.js
      const { PorcupineWorker } = await import("@picovoice/porcupine-web");
      const { WebVoiceProcessor } = await import("@picovoice/web-voice-processor");

      // Porcupine built-in keyword "Jarvis" or "Computer" serves as the wake word
      // For "Hello Alan", a custom .ppn file is required, fallback on default keyword if needed
      const keyword: any = "Jarvis"; 

      this.porcupineWorker = await PorcupineWorker.create(
        accessKey,
        keyword,
        (detection) => {
          console.log(`[WakeWordDetector] Porcupine detected keyword: ${detection.label}`);
          this.triggerWakeWord(detection.label);
        },
        {
          // Path to custom keyword model files can go here if compiled:
          // publicPath: "/models/hello-alan.ppn"
        }
      );

      // Attach browser audio thread to WASM worker stream
      await WebVoiceProcessor.subscribe(this.porcupineWorker);
      
      useVoiceStore.getState().setVoiceState("passive_listening");
      useVoiceStore.getState().setWakeEngine("porcupine");
      useVoiceStore.getState().setMicPermission("granted");
      
      logVoiceEvent({
        sessionId: this.sessionId,
        userId: this.userId,
        event: "mic_permission_granted",
        metadata: { method: "porcupine" },
      });

      console.log("[WakeWordDetector] Porcupine WASM voice processor active");
      return true;
    } catch (error) {
      console.warn("[WakeWordDetector] Porcupine WASM initialization failed:", error);
      return false;
    }
  }

  public destroy() {
    this.stop();
    if (typeof window !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
    WakeWordDetector.instance = null;
  }
}
