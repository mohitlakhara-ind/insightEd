"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicBackground } from "@/components/dynamic-background";
import { ArrowLeft, BookOpen, Volume2, Sparkles, Wand2, Compass } from "lucide-react";

interface StoryScenario {
  title: string;
  theme: string;
  intro: string;
  steps: {
    prompt: string;
    choices: {
      text: string;
      narration: string;
      outcome: string;
    }[];
  }[];
}

const SCENARIOS: StoryScenario[] = [
  {
    title: "The Neon Observatory",
    theme: "Sci-Fi Space Exploration",
    intro: "You stand before the ancient telescope on the outer rings of Saturn. The primary optical array flickers, picking up a rhythmic, repeating pulse from an uncharted sector of the cosmos.",
    steps: [
      {
        prompt: "To establish a secure line of communication, how do you tune the receiver?",
        choices: [
          { 
            text: "Boost broad-spectrum radio bands", 
            narration: "You open the radio dampeners. Deep, static roaring fills the room, slowly resolving into a structured acoustic sequence that sounds like mathematical pulses.",
            outcome: "The mathematical signal is successfully logged by the mainframe." 
          },
          { 
            text: "Align narrow-beam quantum optics", 
            narration: "A pencil-thin violet beam shoots into the void. The screen instantly maps a dense, hyper-dimensional lattice of encrypted light data.",
            outcome: "An encoded quantum coordinates database begins downloading." 
          }
        ]
      },
      {
        prompt: "The signal responds with a series of alien coordinates. What is your flight vector?",
        choices: [
          { 
            text: "Accelerate warp cores into the anomaly", 
            narration: "Engaging thrusters. The space-time fabric stretches. You plunge into the glowing blue event horizon, surrounded by ribbons of starlight.",
            outcome: "You emerge safe, parked right before a monolithic crystal city." 
          },
          { 
            text: "Deploy automated sensory sub-drones", 
            narration: "Three metallic scout probes hiss out of the bay. They record massive heat signatures and ancient ruins hidden beneath planetary dust.",
            outcome: "You successfully secure detailed planetary telemetry risk-free." 
          }
        ]
      }
    ]
  },
  {
    title: "The Obsidian Citadel",
    theme: "Ancient Magic & Mystery",
    intro: "You reach the heavy, black-stone archway of the Citadel of Whispers. A warm wind blows from within, smelling of elderberries and scorched copper. Two massive gargoyle guards sit carved on the pillars.",
    steps: [
      {
        prompt: "The stone archway is sealed by a burning runic lock. How do you bypass it?",
        choices: [
          { 
            text: "Recant the ancient chant of fire", 
            narration: "You speak the harsh syllables. The stone runes glow bright gold, matching the pitch of your voice, and sink quietly into the archway floor.",
            outcome: "The seals dissolve, swinging the heavy obsidian doors open." 
          },
          { 
            text: "Shatter the glyph using focus energy", 
            narration: "You raise your staff. A bright cyan spark fractures the air. The obsidian shell cracks, releasing a hum of trapped energy.",
            outcome: "The doors shatter, clearing a dusty path into the inner sanctum." 
          }
        ]
      },
      {
        prompt: "Inside, you find a floating glass container containing a glowing crimson flame. How do you capture it?",
        choices: [
          { 
            text: "Encircle the flame in standard glass containers", 
            narration: "You carefully trap the flame. Its heat dims to a warm, gentle pulse, perfectly illuminating the map coordinates on the table.",
            outcome: "You safely secure the legendary Ember of Whispers." 
          },
          { 
            text: "Absorb its residual heat directly into your staff", 
            narration: "You touch your staff to the core. Runes along the wood light up in a fiery blaze, granting you immense elemental power.",
            outcome: "Your staff is permanently imbued with the primary heat element." 
          }
        ]
      }
    ]
  }
];

export default function StoryTellingGame() {
  const router = useRouter();
  
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [narrativeHistory, setNarrativeHistory] = useState<string[]>([]);
  const [activeNarration, setActiveNarration] = useState("");
  const [isNarrating, setIsNarrating] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const startScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    setCurrentStepIndex(0);
    setNarrativeHistory([SCENARIOS[index].intro]);
    setGameCompleted(false);
    setActiveNarration("");
    setIsNarrating(false);
  };

  const handleMakeChoice = (choice: typeof SCENARIOS[0]["steps"][0]["choices"][0]) => {
    setIsNarrating(true);
    setActiveNarration(choice.narration);
    
    // Append the choice, the narrative voice, and outcome to history
    setNarrativeHistory((prev) => [
      ...prev,
      `> Your Choice: "${choice.text}"`,
      choice.narration,
      choice.outcome
    ]);

    // Delay step progression for immersion/simulated voice speaking duration
    setTimeout(() => {
      setIsNarrating(false);
      const activeScenario = SCENARIOS[selectedScenarioIndex!];
      if (currentStepIndex < activeScenario.steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        setGameCompleted(true);
      }
    }, 4500);
  };

  const resetGame = () => {
    setSelectedScenarioIndex(null);
    setCurrentStepIndex(0);
    setNarrativeHistory([]);
    setActiveNarration("");
    setIsNarrating(false);
    setGameCompleted(false);
  };

  return (
    <main className="relative min-h-screen pt-28 md:pt-32 pb-20 px-4 md:px-8 flex flex-col items-center">
      <DynamicBackground />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl flex items-center justify-between mb-12 relative z-10"
      >
        <button
          onClick={() => (selectedScenarioIndex === null ? router.push("/games") : resetGame())}
          className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          {selectedScenarioIndex === null ? "Back to Games" : "Switch Scenario"}
        </button>
        
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
          <BookOpen className="size-4 text-[var(--accent)]" />
          <span className="text-xs font-black uppercase tracking-wider text-white">Narrator Live</span>
        </div>
      </motion.header>

      <div className="w-full max-w-4xl relative z-10">
        <AnimatePresence mode="wait">
          {/* Scenario Selection Hub */}
          {selectedScenarioIndex === null ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  Interactive <span className="text-gradient-shimmer">Storytelling</span>
                </h1>
                <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-sm leading-relaxed">
                  Train your vocabulary, verbal response time, and situational focus. Pick a narrative universe below to embark.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {SCENARIOS.map((scenario, idx) => (
                  <button
                    key={idx}
                    onClick={() => startScenario(idx)}
                    className="group relative rounded-[2rem] glass-card p-6 sm:p-8 border border-[var(--border)] text-left hover:border-[var(--accent)]/50 transition-all hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-white/5 border border-white/5 text-[var(--text-muted)]">
                        {scenario.theme}
                      </span>
                      <Wand2 className="size-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[var(--accent)] transition-colors">
                      {scenario.title}
                    </h2>
                    
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                      {scenario.intro}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] mt-auto pt-4 border-t border-white/5">
                      <span>Begin Journey</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Active Game Console */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
            >
              {/* Story narration log (7 Columns) */}
              <div className="md:col-span-8 space-y-6">
                <div className="rounded-3xl glass-card p-6 border border-[var(--border)] flex flex-col h-[480px]">
                  <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                    <h3 className="font-bold text-white text-sm">Adventure Log</h3>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <span>Step {currentStepIndex + 1} of {SCENARIOS[selectedScenarioIndex].steps.length}</span>
                    </div>
                  </div>

                  {/* Scrollable history log */}
                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                    {narrativeHistory.map((para, i) => {
                      const isChoice = para.startsWith("> ");
                      return (
                        <div 
                          key={i} 
                          className={`p-3 rounded-2xl border transition-all ${
                            isChoice 
                              ? "bg-[var(--accent-subtle)] border-[var(--accent)]/20 text-[var(--accent)] text-xs font-bold pl-4" 
                              : "bg-transparent border-transparent text-sm text-[var(--text-secondary)] leading-relaxed"
                          }`}
                        >
                          {para}
                        </div>
                      );
                    })}

                    {/* Glowing pulse indicator while narrator speaks */}
                    {isNarrating && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-[var(--accent)] font-bold"
                      >
                        <Volume2 className="size-4 animate-bounce shrink-0" />
                        <span className="animate-pulse">{`Narrator speaking: "${activeNarration.slice(0, 35)}..."`}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interaction Decision Hub (4 Columns) */}
              <div className="md:col-span-4 space-y-6">
                
                {/* Decision Panel */}
                <div className="rounded-3xl glass-card border border-[var(--border)] p-6 space-y-6">
                  <div className="flex items-center gap-2">
                    <Compass className="size-5 text-[var(--accent)]" />
                    <h3 className="font-bold text-white text-sm">Choose Your Action</h3>
                  </div>

                  {!gameCompleted ? (
                    <div className="space-y-4">
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                        {SCENARIOS[selectedScenarioIndex].steps[currentStepIndex].prompt}
                      </p>

                      <div className="space-y-3 pt-2">
                        {SCENARIOS[selectedScenarioIndex].steps[currentStepIndex].choices.map((choice, i) => (
                          <button
                            key={i}
                            onClick={() => !isNarrating && handleMakeChoice(choice)}
                            disabled={isNarrating}
                            className="w-full p-4 rounded-xl text-left text-xs font-bold border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 disabled:opacity-40 transition-all text-white flex flex-col gap-1 relative overflow-hidden group"
                          >
                            <span>{choice.text}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-medium group-hover:text-[var(--accent)] transition-colors">
                              Select choice
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Adventure Completed Panel */
                    <div className="text-center space-y-6 py-6">
                      <div className="size-16 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto">
                        <Sparkles className="size-8 text-emerald-400 animate-pulse" />
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-white text-lg">Adventure Completed!</h4>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          You navigated through the hazards successfully. Your lexical and vocabulary scores have updated!
                        </p>
                      </div>

                      <button
                        onClick={resetGame}
                        className="w-full h-11 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent)] font-bold text-xs text-white shadow-lg active:scale-95 transition-all"
                      >
                        Return to Hub
                      </button>
                    </div>
                  )}
                </div>

                {/* Score panel */}
                <div className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
                  <h4 className="font-bold text-white text-xs tracking-wider uppercase">Active Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-white/5 text-center">
                      <span className="text-[10px] text-[var(--text-muted)] font-bold block mb-1">Vocabulary</span>
                      <span className="text-xl font-black text-white">+180 XP</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 text-center">
                      <span className="text-[10px] text-[var(--text-muted)] font-bold block mb-1">Decisions</span>
                      <span className="text-xl font-black text-white">4 Checked</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
