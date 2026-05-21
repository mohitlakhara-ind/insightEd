import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface VoiceEvent {
  sessionId: string;
  userId: string;
  event:
    | "mic_permission_granted"
    | "mic_permission_denied"
    | "wake_word_detected"
    | "alan_session_started"
    | "alan_command_executed"
    | "voice_error"
    | "session_completed";
  latencyMs?: number;
  commandText?: string;
  errorCode?: string;
  errorMessage?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

// Generate a simple UUID/unique string for sessions client-side
export function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function logVoiceEvent(voiceEvent: Omit<VoiceEvent, "userAgent">): Promise<void> {
  try {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "Server/Unknown";
    const docData = {
      ...voiceEvent,
      userAgent,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "voice_assistant_logs"), docData);
    console.log("[VoiceAnalytics] Logged voice telemetry event:", voiceEvent.event, docRef.id);
  } catch (error) {
    // Fail silently in production, but log warning to console in dev
    console.warn("[VoiceAnalytics] Failed to write telemetry to Firestore:", error);
  }
}
