"use client";

import { create } from "zustand";

export type VoiceState =
  | "idle"
  | "passive_listening"
  | "wake_detected"
  | "alan_connecting"
  | "listening"
  | "speaking"
  | "processing"
  | "error"
  | "mic_blocked";

export interface VoiceStore {
  state: VoiceState;
  isOpen: boolean;
  transcript: string;
  assistantResponse: string;
  commandHistory: string[];
  micPermission: "granted" | "denied" | "prompt";
  errorMessage: string | null;
  wakeEngine: "web-speech" | "porcupine" | null;
  userName: string;
  setVoiceState: (state: VoiceState) => void;
  setOpen: (isOpen: boolean) => void;
  setTranscript: (text: string) => void;
  addCommand: (command: string) => void;
  setAssistantResponse: (text: string) => void;
  setMicPermission: (status: "granted" | "denied" | "prompt") => void;
  setError: (message: string | null) => void;
  setWakeEngine: (engine: "web-speech" | "porcupine" | null) => void;
  setUserName: (name: string) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  state: "idle",
  isOpen: false,
  transcript: "",
  assistantResponse: "I am listening for \"Hello Alan\". Click the microphone or toggle hands-free to start.",
  commandHistory: [],
  micPermission: "prompt",
  errorMessage: null,
  wakeEngine: null,
  userName: "Guest",

  setVoiceState: (state) => set(() => {
    // If transitioning to error or mic_blocked, keep current transcripts
    // Otherwise update state
    const updates: Partial<VoiceStore> = { state };
    if (state === "wake_detected") {
      updates.isOpen = true;
    }
    return updates;
  }),

  setOpen: (isOpen) => set((s) => {
    // If panel is closed, reset transcript and response state back to idle if was active
    const updates: Partial<VoiceStore> = { isOpen };
    if (!isOpen && (s.state === "listening" || s.state === "speaking" || s.state === "processing")) {
      updates.state = "passive_listening";
    }
    return updates;
  }),

  setTranscript: (transcript) => set({ transcript }),

  addCommand: (command) => set((s) => ({
    commandHistory: [command, ...s.commandHistory.slice(0, 19)], // Cap history at 20 commands
  })),

  setAssistantResponse: (assistantResponse) => set({ assistantResponse }),

  setMicPermission: (micPermission) => set({ micPermission }),

  setError: (errorMessage) => set({ errorMessage, state: errorMessage ? "error" : "idle" }),

  setWakeEngine: (wakeEngine) => set({ wakeEngine }),

  setUserName: (userName) => set({ userName }),

  reset: () => set({
    state: "idle",
    isOpen: false,
    transcript: "",
    assistantResponse: "I am listening for \"Hello Alan\". Click the microphone or toggle hands-free to start.",
    errorMessage: null,
  }),
}));
