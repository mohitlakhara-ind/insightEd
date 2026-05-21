"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechRecognitionStatus =
  | "idle"
  | "listening"
  | "error"
  | "unsupported";

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;

const BENIGN_ERRORS = new Set(["aborted", "no-speech"]);

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [status, setStatus] = useState<SpeechRecognitionStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [lastError, setLastError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const pendingStartRef = useRef(false);
  const optionsRef = useRef(options);
  
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const attachHandlers = useCallback((rec: ISpeechRecognition) => {
    rec.onstart = () => {
      isListeningRef.current = true;
      pendingStartRef.current = false;
      setStatus("listening");
      setLastError(null);
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalText += chunk;
        } else {
          interimText += chunk;
        }
      }

      const text = (finalText || interimText).trim();
      if (!text) return;

      setTranscript(text);
      optionsRef.current.onResult?.(text, Boolean(finalText));
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = event.error ?? "unknown";
      if (BENIGN_ERRORS.has(code)) {
        return;
      }

      isListeningRef.current = false;
      pendingStartRef.current = false;
      setStatus("error");
      setLastError(code);
      optionsRef.current.onError?.(code);
    };

    rec.onend = () => {
      isListeningRef.current = false;

      if (pendingStartRef.current && recognitionRef.current) {
        pendingStartRef.current = false;
        try {
          recognitionRef.current.start();
          return;
        } catch {
          setStatus("error");
          setLastError("failed-to-start");
          optionsRef.current.onError?.("failed-to-start");
          return;
        }
      }

      setStatus((current) => (current === "error" ? "error" : "idle"));
    };
  }, []);

  const ensureRecognition = useCallback((): ISpeechRecognition | null => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setIsSupported(false);
      setStatus("unsupported");
      return null;
    }

    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const rec = new Ctor();
    rec.continuous = optionsRef.current.continuous ?? false;
    rec.interimResults = optionsRef.current.interimResults ?? true;
    rec.maxAlternatives = 1;
    rec.lang =
      optionsRef.current.lang ??
      (typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US");

    attachHandlers(rec);
    recognitionRef.current = rec;
    return rec;
  }, [attachHandlers]);

  const start = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    if (!window.isSecureContext) {
      setStatus("error");
      setLastError("insecure-context");
      optionsRef.current.onError?.("insecure-context");
      return false;
    }

    if (!getSpeechRecognitionCtor()) {
      setIsSupported(false);
      setStatus("unsupported");
      setLastError("unsupported");
      optionsRef.current.onError?.("unsupported");
      return false;
    }

    const rec = ensureRecognition();
    if (!rec) return false;

    setTranscript("");
    setLastError(null);

    if (isListeningRef.current) {
      return true;
    }

    try {
      rec.start();
      return true;
    } catch {
      pendingStartRef.current = true;
      try {
        rec.stop();
        return true;
      } catch {
        pendingStartRef.current = false;
        recognitionRef.current = null;
        const fresh = ensureRecognition();
        if (!fresh) return false;
        try {
          fresh.start();
          return true;
        } catch {
          setStatus("error");
          setLastError("failed-to-start");
          optionsRef.current.onError?.("failed-to-start");
          return false;
        }
      }
    }
  }, [ensureRecognition]);

  const stop = useCallback(() => {
    pendingStartRef.current = false;
    const rec = recognitionRef.current;
    if (!rec) return;

    try {
      if (isListeningRef.current) {
        rec.stop();
      }
    } catch {
      /* ignore */
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setLastError(null);
    if (!isListeningRef.current) {
      setStatus("idle");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported(Boolean(getSpeechRecognitionCtor()));

    return () => {
      pendingStartRef.current = false;
      const rec = recognitionRef.current;
      if (!rec) return;

      rec.onstart = null;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;

      try {
        rec.abort();
      } catch {
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
      }

      recognitionRef.current = null;
      isListeningRef.current = false;
    };
  }, []);

  return {
    start,
    stop,
    reset,
    status,
    transcript,
    lastError,
    isSupported,
    isListening: status === "listening",
  };
}
