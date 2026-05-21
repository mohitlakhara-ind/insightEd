"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { DynamicBackground } from "@/components/dynamic-background";
import { 
  ArrowLeft, 
  Bot, 
  MessageSquare, 
  X, 
  Send, 
  Volume2, 
  Sparkles
} from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
  feedback?: string;
}

export default function CommunityPage() {
  const router = useRouter();

  // Dialog Modals State
  const [activeModal, setActiveModal] = useState<"professional" | "mitra" | null>(null);
  
  // AI Interview states
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewMessages, setInterviewMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I am your InsightEd Professional AI Coach. Today we will conduct a mock interview. Can you describe a challenging technical project you worked on and how you resolved a major bug?"
    }
  ]);
  const [interviewInput, setInterviewInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Mitra states
  const [mitraMessages, setMitraMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Namaste! I am Mitra, your learning companion. Whether you feel stressed about exams, need motivation, or want to discuss non-technical goals, I am here. How is your day going?"
    }
  ]);
  const [mitraInput, setMitraInput] = useState("");



  // TTS Helper
  const announceSpeech = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendInterview = () => {
    if (!interviewInput.trim() || isAiTyping) return;

    const userMsg = interviewInput;
    setInterviewMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInterviewInput("");
    setIsAiTyping(true);

    // Dynamic mock interview progression and feedback
    setTimeout(() => {
      let aiResponse = "";
      let analysisFeedback = "";
      
      if (interviewStep === 0) {
        aiResponse = "Excellent analysis of technical scoping! For our next question: How do you handle conflicts or misaligned deadlines inside a cross-functional agile team?";
        analysisFeedback = "Good focus on systematic debugging! Tip: Try utilizing the STAR method (Situation, Task, Action, Result) to state exactly what impact your fix made.";
        setInterviewStep(1);
      } else {
        aiResponse = "Splendid response. You focused heavily on communication and joint scrum planning, which modern tech organizations love. That concludes our mock evaluation! Feel free to review your feedback.";
        analysisFeedback = "Great communication tactics! Tip: Emphasize how you documented the compromise so the team avoids the same bottleneck in future sprints.";
        setInterviewStep(2);
      }

      setInterviewMessages((prev) => [
        ...prev,
        { sender: "ai", text: aiResponse, feedback: analysisFeedback }
      ]);
      setIsAiTyping(false);
      announceSpeech(aiResponse);
    }, 1800);
  };

  const handleSendMitra = () => {
    if (!mitraInput.trim() || isAiTyping) return;

    const userMsg = mitraInput;
    setMitraMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setMitraInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      const responses = [
        "That sounds wonderful! Learning is a marathon, not a sprint. Remember to celebrate tiny successes like finishing a simple sorting function!",
        "It is completely okay to feel overwhelmed. Why don't you take a deep, five-second breath, drink some water, and come back? I am right here with you!",
        "Superb goals! Let's break them down into bite-sized milestones. You have already completed courses today, which is amazing!"
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];

      setMitraMessages((prev) => [...prev, { sender: "ai", text: randomReply }]);
      setIsAiTyping(false);
      announceSpeech(randomReply);
    }, 1200);
  };

  return (
    <main className="relative min-h-screen pt-28 md:pt-32 pb-20 px-4 md:px-6 flex flex-col items-center">
      <DynamicBackground />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl flex items-center justify-between mb-16 relative z-10"
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Community Workspace
        </h1>
        <div className="w-20" />
      </motion.header>

      {/* Feature Cards Grid */}
      <div className="grid gap-8 md:grid-cols-2 w-full max-w-4xl relative z-10">
        
        {/* InsightEd Professional Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/20 to-purple-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-full bg-[var(--surface-elevated)]/85 backdrop-blur-xl border border-[var(--border)] rounded-[3rem] p-8 flex flex-col shadow-xl overflow-hidden hover:border-indigo-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full pointer-events-none" />
            <div className="size-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/20 shadow-inner">
              <Bot size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              InsightEd Professional
            </h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8 flex-grow">
              AI-driven mock interviews, technical project analysis, and agile coaching to ready your communication skills for real careers.
            </p>
            <button 
              onClick={() => {
                setActiveModal("professional");
                announceSpeech("Professional Interview Mode active. Say hello to begin.");
              }}
              className="w-full h-13 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-sm hover:bg-indigo-500 hover:text-white transition-all hover:scale-[1.02]"
            >
              Start Session
            </button>
          </div>
        </motion.div>

        {/* InsightEd Mitra Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-linear-to-br from-rose-500/20 to-orange-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-full bg-[var(--surface-elevated)]/85 backdrop-blur-xl border border-[var(--border)] rounded-[3rem] p-8 flex flex-col shadow-xl overflow-hidden hover:border-rose-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] rounded-full pointer-events-none" />
            <div className="size-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6 border border-rose-500/20 shadow-inner">
              <MessageSquare size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              InsightEd Mitra
            </h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8 flex-grow">
              Your supportive learning companion. Share progress updates, discuss exam anxiety, or enjoy warm motivation tips.
            </p>
            <button 
              onClick={() => {
                setActiveModal("mitra");
                announceSpeech("Mitra learning companion active. Let's discuss your progress!");
              }}
              className="w-full h-13 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all hover:scale-[1.02]"
            >
              Chat Now
            </button>
          </div>
        </motion.div>

      </div>

      {/* Floating Interactive Workspace Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--surface-elevated)]/90 border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setActiveModal(null);
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-colors z-10"
              >
                <X size={18} />
              </button>

              {/* MODAL 1: AI Mock Interview (Professional) */}
              {activeModal === "professional" && (
                <div className="flex flex-col h-full flex-grow overflow-hidden pt-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)] mb-4">
                    <Bot className="text-indigo-400" size={24} />
                    <div>
                      <h3 className="font-extrabold text-white text-base">Professional Interview Workspace</h3>
                      <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">AI Recruiter Sarah · Dynamic Evaluation Mode</span>
                    </div>
                  </div>

                  {/* Message scroll container */}
                  <div className="flex-grow overflow-y-auto space-y-4 pr-1 mb-6 scrollbar-thin flex flex-col">
                    {interviewMessages.map((msg, i) => (
                      <div key={i} className={`flex flex-col gap-2 max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}>
                        <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                          msg.sender === "user" 
                            ? "bg-indigo-500 text-white rounded-tr-none" 
                            : "bg-white/5 border border-white/5 text-[var(--text-secondary)] rounded-tl-none"
                        }`}>
                          {msg.text}
                          {msg.sender === "ai" && (
                            <button
                              onClick={() => announceSpeech(msg.text)}
                              className="block mt-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              <Volume2 size={12} /> Speak Response
                            </button>
                          )}
                        </div>

                        {/* Evaluator Analysis Feedback */}
                        {msg.feedback && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] leading-relaxed font-bold flex items-start gap-2 shadow-inner"
                          >
                            <Sparkles className="size-4 shrink-0 mt-0.5" />
                            <span>{msg.feedback}</span>
                          </motion.div>
                        )}
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="self-start bg-white/5 border border-white/5 p-4 rounded-3xl rounded-tl-none text-xs text-[var(--text-muted)] animate-pulse flex items-center gap-2">
                        <Sparkles size={14} className="animate-spin text-indigo-400" />
                        AI Sarah is analyzing your response...
                      </div>
                    )}
                  </div>

                  {/* Input container */}
                  <div className="flex gap-3 pt-4 border-t border-[var(--border)] items-center">
                    <input
                      type="text"
                      placeholder="Type your response here..."
                      value={interviewInput}
                      onChange={(e) => setInterviewInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendInterview()}
                      disabled={isAiTyping || interviewStep === 2}
                      className="flex-grow h-13 px-5 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)] text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40"
                    />
                    <button
                      onClick={handleSendInterview}
                      disabled={!interviewInput.trim() || isAiTyping || interviewStep === 2}
                      className="size-13 rounded-2xl bg-indigo-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 transition-all shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL 2: Mitra Companion Chat */}
              {activeModal === "mitra" && (
                <div className="flex flex-col h-full flex-grow overflow-hidden pt-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)] mb-4">
                    <MessageSquare className="text-rose-400" size={24} />
                    <div>
                      <h3 className="font-extrabold text-white text-base">Mitra Encouragement Zone</h3>
                      <span className="text-[10px] text-rose-400 font-black uppercase tracking-wider">Companion Mitra · Mental Well-Being & Support</span>
                    </div>
                  </div>

                  {/* Message scroll container */}
                  <div className="flex-grow overflow-y-auto space-y-4 pr-1 mb-6 scrollbar-thin flex flex-col">
                    {mitraMessages.map((msg, i) => (
                      <div key={i} className={`flex flex-col gap-2 max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}>
                        <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                          msg.sender === "user" 
                            ? "bg-rose-500 text-white rounded-tr-none" 
                            : "bg-white/5 border border-white/5 text-[var(--text-secondary)] rounded-tl-none"
                        }`}>
                          {msg.text}
                          {msg.sender === "ai" && (
                            <button
                              onClick={() => announceSpeech(msg.text)}
                              className="block mt-2 text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                            >
                              <Volume2 size={12} /> Speak Support
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="self-start bg-white/5 border border-white/5 p-4 rounded-3xl rounded-tl-none text-xs text-[var(--text-muted)] animate-pulse flex items-center gap-2">
                        <Sparkles size={14} className="animate-spin text-rose-400" />
                        Mitra is crafting a warm note...
                      </div>
                    )}
                  </div>

                  {/* Input container */}
                  <div className="flex gap-3 pt-4 border-t border-[var(--border)] items-center">
                    <input
                      type="text"
                      placeholder="Share what is on your mind..."
                      value={mitraInput}
                      onChange={(e) => setMitraInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMitra()}
                      disabled={isAiTyping}
                      className="flex-grow h-13 px-5 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)] text-white text-sm focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-40"
                    />
                    <button
                      onClick={handleSendMitra}
                      disabled={!mitraInput.trim() || isAiTyping}
                      className="size-13 rounded-2xl bg-rose-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 transition-all shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
