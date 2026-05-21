/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useVoiceStore } from "@/hooks/use-voice-store";
import { logVoiceEvent } from "./voice-analytics";

type NavigationCallback = (route: string) => void;

export class AlanService {
  private static instance: AlanService | null = null;
  private recognition: any = null;
  private onNavigateCallback: NavigationCallback | null = null;
  private sessionId = "";
  private userId = "Guest";
  private isListening = false;
  private userName = "Learner";

  private learnedCommands: Record<string, string> = {};
  private pendingQuery = "";
  private pendingQueryTime = 0;
  private commandListeners: Set<(query: string, cleanQuery: string) => boolean> = new Set();

  private constructor() {
    if (typeof window !== "undefined") {
      this.loadLearnedCommands();
      this.initSpeechRecognition();
    }
  }

  private loadLearnedCommands() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("insightEd_learned_commands");
      if (stored) {
        this.learnedCommands = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("[VoiceAssistantService] Failed to load learned commands:", e);
    }
  }

  private saveLearnedCommands() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("insightEd_learned_commands", JSON.stringify(this.learnedCommands));
    } catch (e) {
      console.warn("[VoiceAssistantService] Failed to save learned commands:", e);
    }
  }

  public static getInstance(): AlanService {
    if (!AlanService.instance) {
      AlanService.instance = new AlanService();
    }
    return AlanService.instance;
  }

  public setSessionContext(sessionId: string, userId: string) {
    this.sessionId = sessionId;
    this.userId = userId;
  }

  public setNavigationCallback(callback: NavigationCallback) {
    this.onNavigateCallback = callback;
  }

  public registerCommandListener(listener: (query: string, cleanQuery: string) => boolean) {
    this.commandListeners.add(listener);
    return () => {
      this.commandListeners.delete(listener);
    };
  }

  private initSpeechRecognition() {
    const SpeechCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechCtor) {
      console.warn("[VoiceAssistantService] Web Speech API not supported in this browser.");
      return;
    }

    try {
      const rec = new SpeechCtor();
      rec.continuous = false; // Stop automatically when user stops speaking to mimic push-to-talk activation
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        console.log("[VoiceAssistantService] Active recognition started");
        this.isListening = true;
        useVoiceStore.getState().setVoiceState("listening");
        useVoiceStore.getState().setTranscript("Listening...");
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        console.log("[VoiceAssistantService] Active speech recognized:", text);
        useVoiceStore.getState().setTranscript(text);
        this.processQuery(text);
      };

      rec.onerror = (event: any) => {
        const err = event.error;
        if (err === "no-speech" || err === "network" || err === "aborted") {
          console.warn("[VoiceAssistantService] Transient active recognition event:", err);
        } else {
          console.error("[VoiceAssistantService] Active recognition error:", err);
        }
        useVoiceStore.getState().setVoiceState("idle");
        if (err !== "no-speech" && err !== "aborted" && err !== "network") {
          logVoiceEvent({
            sessionId: this.sessionId,
            userId: this.userId,
            event: "voice_error",
            errorCode: err,
            errorMessage: `Active Web Speech API error: ${err}`,
          });
        }
      };

      rec.onend = () => {
        console.log("[VoiceAssistantService] Active recognition ended");
        this.isListening = false;
        if (useVoiceStore.getState().state === "listening") {
          useVoiceStore.getState().setVoiceState("idle");
        }
      };

      this.recognition = rec;
    } catch (e) {
      console.error("[VoiceAssistantService] Failed to initialize SpeechRecognition:", e);
    }
  }

  public async initialize(): Promise<boolean> {
    // No external API keys needed!
    useVoiceStore.getState().setVoiceState("idle");
    return true;
  }

  public activate() {
    if (!this.recognition) {
      useVoiceStore.getState().setError("Voice recognition not supported in this browser.");
      return;
    }
    if (this.isListening) return;

    try {
      // Cancel any ongoing speech synthesis before starting to listen
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      this.recognition.start();
    } catch (e) {
      console.error("[VoiceAssistantService] Error starting active recognition:", e);
    }
  }

  public deactivate() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.error("[VoiceAssistantService] Error stopping active recognition:", e);
    }
  }

  public playText(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel(); // Stop any current speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => {
        useVoiceStore.getState().setVoiceState("speaking");
        useVoiceStore.getState().setAssistantResponse(text);
      };
      utterance.onend = () => {
        useVoiceStore.getState().setVoiceState("idle");
      };
      utterance.onerror = (e) => {
        console.error("[VoiceAssistantService] SpeechSynthesis error:", e);
        useVoiceStore.getState().setVoiceState("idle");
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("[VoiceAssistantService] playText failed:", e);
    }
  }

  public setContext(userName: string) {
    this.userName = userName;
  }

  public sendText(text: string) {
    this.processQuery(text);
  }

  private processQuery(query: string) {
    // Strip punctuation and normalize spacing for robust matching
    const cleanQuery = query
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    console.log("[VoiceAssistantService] Processing query:", cleanQuery);

    logVoiceEvent({
      sessionId: this.sessionId,
      userId: this.userId,
      event: "alan_command_executed", // Keep telemetry event name for compatibility
      commandText: cleanQuery,
    });

    useVoiceStore.getState().addCommand(query);

    // Check if any registered command listeners handle this query
    for (const listener of this.commandListeners) {
      try {
        if (listener(query, cleanQuery)) {
          console.log("[VoiceAssistantService] Query handled by custom command listener");
          return;
        }
      } catch (e) {
        console.error("[VoiceAssistantService] Error in custom command listener:", e);
      }
    }

    let responseText = "";
    let targetRoute = "";
    let pageName = "";

    const courseKeywords = ["course", "learn", "lesson", "class", "study", "vocational", "catalog", "track"];
    const gameKeywords = ["game", "mind", "play", "puzzle", "match", "cognitive", "brain", "toy"];
    const communityKeywords = ["community", "ai community", "mitra", "sarah", "companion", "coach", "chat", "connect", "social"];
    const pronunciationKeywords = ["pronunciation", "speech", "coach", "practice", "speak", "talk", "voice", "pronounce", "speaking", "talking"];
    const homeKeywords = ["home", "welcome", "main", "start", "dashboard", "index"];

    const matchesAny = (text: string, keywords: string[]) => {
      return keywords.some(keyword => text.includes(keyword));
    };

    // 1. Check for explicit teaching command
    // e.g. "remember study tracks means courses" or "when I say let's play open mind games"
    const teachRegex = /(?:when i say|remember)\s+(.+?)\s+(?:means|open|go to|show|opens|navigates to)\s+(.+)/i;
    const match = cleanQuery.match(teachRegex);
    if (match) {
      const userPhrase = match[1].trim();
      const targetSection = match[2].trim();
      
      let matchedRoute = "";
      let sectionLabel = "";
      if (matchesAny(targetSection, courseKeywords)) {
        matchedRoute = "/courses";
        sectionLabel = "vocational courses";
      } else if (matchesAny(targetSection, gameKeywords)) {
        matchedRoute = "/games";
        sectionLabel = "mind games";
      } else if (matchesAny(targetSection, communityKeywords)) {
        matchedRoute = "/community";
        sectionLabel = "community rooms";
      } else if (matchesAny(targetSection, pronunciationKeywords)) {
        matchedRoute = "/pronunciation";
        sectionLabel = "pronunciation coach";
      } else if (matchesAny(targetSection, homeKeywords)) {
        matchedRoute = "/";
        sectionLabel = "home screen";
      }

      if (matchedRoute) {
        this.learnedCommands[userPhrase] = matchedRoute;
        this.saveLearnedCommands();
        responseText = `Got it! I have learned to open ${sectionLabel} when you say "${userPhrase}".`;
        this.playText(responseText);
        return;
      }
    }

    // 2. Check learned commands map first
    if (this.learnedCommands[cleanQuery]) {
      targetRoute = this.learnedCommands[cleanQuery];
      // Get human readable label for response
      if (targetRoute === "/courses") pageName = "vocational courses catalog";
      else if (targetRoute === "/games") pageName = "mind games page";
      else if (targetRoute === "/community") pageName = "community rooms";
      else if (targetRoute === "/pronunciation") pageName = "pronunciation coach";
      else if (targetRoute === "/") pageName = "home page";

      responseText = `Opening the ${pageName} based on what you taught me.`;
    } 
    // 3. Regular keyword matching
    else if (matchesAny(cleanQuery, courseKeywords)) {
      responseText = "Sure, opening the vocational courses catalog for you.";
      targetRoute = "/courses";
      pageName = "courses page";
    } else if (matchesAny(cleanQuery, gameKeywords)) {
      responseText = "Opening the accessibility-first mind games.";
      targetRoute = "/games";
      pageName = "games page";
    } else if (matchesAny(cleanQuery, communityKeywords)) {
      responseText = "Connecting you to the AI Community workspace.";
      targetRoute = "/community";
      pageName = "community page";
    } else if (matchesAny(cleanQuery, pronunciationKeywords)) {
      responseText = "Launching the AI speech and pronunciation coach.";
      targetRoute = "/pronunciation";
      pageName = "pronunciation coach";
    } else if (matchesAny(cleanQuery, homeKeywords)) {
      responseText = "Navigating to the home screen.";
      targetRoute = "/";
      pageName = "home page";
    }

    // 4. Handle implicit association if there was a pending query
    if (targetRoute && responseText) {
      const now = Date.now();
      if (this.pendingQuery && now - this.pendingQueryTime < 20000) { // 20s association window
        const learnedPhrase = this.pendingQuery;
        // Don't learn standard command matches themselves
        if (learnedPhrase !== cleanQuery && !this.learnedCommands[learnedPhrase]) {
          this.learnedCommands[learnedPhrase] = targetRoute;
          this.saveLearnedCommands();
          responseText += ` I have also learned that "${learnedPhrase}" means opening the ${pageName}.`;
        }
        // Clear pending query
        this.pendingQuery = "";
        this.pendingQueryTime = 0;
      }
    }

    // 5. General greetings and fallbacks
    if (!targetRoute) {
      if (
        cleanQuery.includes("hello") ||
        cleanQuery.includes("hi") ||
        cleanQuery.includes("hey") ||
        cleanQuery.includes("greetings")
      ) {
        responseText = `Hello ${this.userName}! I am your voice companion. You can say open courses, open games, open community, or open pronunciation coach. You can also teach me custom commands by saying: remember "let's study" means courses.`;
      } else if (
        cleanQuery.includes("help") ||
        cleanQuery.includes("what can you do") ||
        cleanQuery.includes("instructions") ||
        cleanQuery.includes("guide")
      ) {
        responseText = "I can help you navigate InsightEd. Try saying: open courses, open games, open community, or open pronunciation coach. Or teach me custom commands by saying: remember 'go to chat' means community.";
      } else {
        responseText = `I heard: "${query}". Try saying: open courses, open games, open community, or open pronunciation coach. Or teach me by typing/saying what you wanted to open.`;
        // Save as pending unrecognized query for learning
        this.pendingQuery = cleanQuery;
        this.pendingQueryTime = Date.now();
      }
    }

    if (responseText) {
      this.playText(responseText);
    }

    if (targetRoute && this.onNavigateCallback) {
      const callback = this.onNavigateCallback;
      // Delay navigation slightly so the speech starts first
      setTimeout(() => {
        callback(targetRoute);
      }, 1200);
    }
  }

  public destroy() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.deactivate();
    AlanService.instance = null;
  }
}
