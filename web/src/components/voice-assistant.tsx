"use client";

import dynamic from "next/dynamic";

// Dynamically load the VoiceAssistantOverlay with Server-Side Rendering disabled.
// This ensures that WebAudio, WebSpeech, and WASM packages load exclusively in client-side secure contexts.
const VoiceAssistantOverlay = dynamic(
  () =>
    import("./voice-assistant-overlay").then((mod) => mod.VoiceAssistantOverlay),
  { ssr: false }
);

export function VoiceAssistant() {
  return <VoiceAssistantOverlay />;
}
