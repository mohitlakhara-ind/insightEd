"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Cpu, 
  BookOpen, 
  Loader2, 
  Layers, 
  Award,
  AlertCircle,
  CheckCircle2,
  Undo,
  Lock,
  Zap
} from "lucide-react";
import { db } from "@/services/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { DynamicBackground } from "@/components/dynamic-background";
import { useAuth } from "@/context/auth-context";
import { educatorPasscode } from "@/lib/env";

interface Course {
  id?: string;
  name: string;
  category: "technical" | "non-technical";
  episodes: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  description?: string;
}

const DEFAULT_COURSES: Course[] = [
  { name: "DSA Mastery", category: "technical", episodes: 10, level: "Intermediate", description: "Master core algorithms and data structures." },
  { name: "Fullstack Web", category: "technical", episodes: 15, level: "Advanced", description: "Build scalable cloud web applications." },
  { name: "Python Basics", category: "technical", episodes: 8, level: "Beginner", description: "Learn fundamentals of coding." },
  { name: "Public Speaking", category: "non-technical", episodes: 6, level: "Beginner", description: "Communicate with confidence." },
  { name: "Project Management", category: "non-technical", episodes: 12, level: "Intermediate", description: "Agile methodologies and workflows." },
  { name: "UI/UX Design", category: "non-technical", episodes: 9, level: "Intermediate", description: "Learn user-centric design principles." }
];

export default function EducatorPanelPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  
  // Security State
  const [isSandboxUnlocked, setIsSandboxUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"technical" | "non-technical">("technical");
  const [episodes, setEpisodes] = useState(10);
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [description, setDescription] = useState("");

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const showFeedback = useCallback((text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    
    // Strict 2.5 second timeout to prevent infinite hangs
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timed out.")), 2500)
    );

    const fetchPromise = (async () => {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const coursesList: Course[] = [];
      querySnapshot.forEach((docSnap) => {
        coursesList.push({ id: docSnap.id, ...docSnap.data() } as Course);
      });

      // If Firestore is empty, let's seed default courses
      if (coursesList.length === 0) {
        console.log("Seeding default courses to Firestore...");
        for (const item of DEFAULT_COURSES) {
          const docRef = await addDoc(collection(db, "courses"), item);
          coursesList.push({ id: docRef.id, ...item });
        }
      }
      return coursesList;
    })();

    try {
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      setCourses(result);
      setIsOffline(false);
    } catch (error) {
      console.warn("Firestore fetch error/timeout, loading defaults:", error);
      setCourses(DEFAULT_COURSES.map((c, i) => ({ ...c, id: `local-${i}` })));
      setIsOffline(true);
      showFeedback("Firestore connection timed out. Loading local academy database...", "error");
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  const isAuthenticated = isSandboxUnlocked || (!!user && profile?.role === "educator");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authState = sessionStorage.getItem("educator_authenticated");
      if (authState === "true") {
        const handle = requestAnimationFrame(() => {
          setIsSandboxUnlocked(true);
        });
        return () => cancelAnimationFrame(handle);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const handle = requestAnimationFrame(() => {
        fetchCourses();
      });
      return () => cancelAnimationFrame(handle);
    }
  }, [isAuthenticated, fetchCourses]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!educatorPasscode) {
      setAuthError("Educator passcode is not configured. Contact your administrator.");
      return;
    }
    if (passcode === educatorPasscode) {
      setIsSandboxUnlocked(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("educator_authenticated", "true");
      }
      setAuthError("");
    } else {
      setAuthError("Invalid security passcode. Access denied.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showFeedback("Course name cannot be empty.", "error");
      return;
    }

    setSaving(true);
    const courseData: Omit<Course, "id"> = {
      name: name.trim(),
      category,
      episodes: Number(episodes),
      level,
      description: description.trim() || undefined,
    };

    try {
      if (editingId) {
        // Update existing course
        await updateDoc(doc(db, "courses", editingId), courseData);
        setCourses(prev => prev.map(c => c.id === editingId ? { id: editingId, ...courseData } : c));
        showFeedback("Course updated successfully!", "success");
      } else {
        // Add new course
        const docRef = await addDoc(collection(db, "courses"), courseData);
        setCourses(prev => [...prev, { id: docRef.id, ...courseData }]);
        showFeedback("New course added to academy!", "success");
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error saving course:", error);
      showFeedback("Failed to save course to Firestore.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course from the academy?")) return;

    try {
      await deleteDoc(doc(db, "courses", courseId));
      setCourses(prev => prev.filter(c => c.id !== courseId));
      showFeedback("Course deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting course:", error);
      showFeedback("Failed to delete course.", "error");
    }
  };

  const handleEdit = (course: Course) => {
    if (!course.id) return;
    setEditingId(course.id);
    setName(course.name);
    setCategory(course.category);
    setEpisodes(course.episodes);
    setLevel(course.level);
    setDescription(course.description || "");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategory("technical");
    setEpisodes(10);
    setLevel("Intermediate");
    setDescription("");
  };

  // Loading State for Auth check
  if (authLoading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center p-4">
        <DynamicBackground />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
          <span className="text-[var(--text-secondary)] font-semibold text-sm">Verifying educator credentials...</span>
        </div>
      </main>
    );
  }

  // Lock Screen rendering if unauthenticated
  if (!isAuthenticated) {
    return (
      <main className="relative min-h-screen flex items-center justify-center p-4 md:p-6">
        <DynamicBackground />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[var(--surface-elevated)]/85 backdrop-blur-2xl border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 text-center">
            <div className="size-16 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-8 border border-indigo-500/20 shadow-inner">
              <Lock size={32} />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
              Restricted Area
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
              This panel is restricted to authorized educators only. Please enter the Security Passcode to gain access.
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Enter Security Passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full h-14 px-4 text-center rounded-2xl bg-[var(--background)]/70 border border-[var(--border)] text-white focus:outline-hidden focus:border-[var(--accent)] transition-all font-bold tracking-widest"
                />
              </div>

              {authError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-semibold text-rose-400 mt-2"
                >
                  {authError}
                </motion.p>
              )}

              <button
                type="submit"
                className="w-full h-14 rounded-2xl bg-linear-to-r from-indigo-500 to-cyan-500 text-white font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-500/20 mt-4"
              >
                Unlock Panel
              </button>
            </form>

            <p className="mt-8 pt-6 border-t border-[var(--border)] text-xs text-[var(--text-muted)] leading-relaxed">
              Access requires an educator account or a passcode issued by your organization.
            </p>
          </div>
        </motion.div>
      </main>
    );
  }

  // Metrics calculations
  const totalCourses = courses.length;
  const techCoursesCount = courses.filter(c => c.category === "technical").length;
  const nonTechCoursesCount = courses.filter(c => c.category === "non-technical").length;
  const totalEpisodes = courses.reduce((acc, c) => acc + c.episodes, 0);

  return (
    <main className="relative min-h-screen pt-20 pb-12 px-4 md:px-6 flex flex-col items-center">
      <DynamicBackground />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between mb-12 gap-4"
      >
        <div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-2"
          >
            ← Back to Student Hub
          </button>
          <h1 className="text-4xl font-extrabold tracking-tight text-white bg-linear-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Educator Control Center
          </h1>
        </div>
        <div className="text-[var(--text-muted)] text-sm bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          Role: <span className="font-bold text-[var(--accent)]">Academy Administrator</span>
        </div>
      </motion.header>

      {/* Feedback message banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`w-full max-w-6xl p-4 mb-6 rounded-2xl flex items-center gap-3 backdrop-blur-md border ${
              message.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="shrink-0" /> : <AlertCircle className="shrink-0" />}
            <span className="font-semibold text-sm">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Resilient Banner */}
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-6xl p-4 mb-6 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl flex items-center gap-3 backdrop-blur-md relative z-10"
        >
          <Zap className="shrink-0 animate-pulse text-cyan-400" size={20} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Offline Sandbox Mode Enabled · Course metrics are read from standard cached defaults. DB mutations are disabled.
          </span>
        </motion.div>
      )}

      <div className="w-full max-w-6xl space-y-10">
        
        {/* Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Courses"
            value={totalCourses}
            icon={<Layers className="text-cyan-400" />}
            color="cyan"
            delay={0}
          />
          <MetricCard
            title="Technical Tracks"
            value={techCoursesCount}
            icon={<Cpu className="text-indigo-400" />}
            color="indigo"
            delay={0.05}
          />
          <MetricCard
            title="Non-Tech Skills"
            value={nonTechCoursesCount}
            icon={<BookOpen className="text-rose-400" />}
            color="rose"
            delay={0.1}
          />
          <MetricCard
            title="Total Episodes"
            value={totalEpisodes}
            icon={<Award className="text-amber-400" />}
            color="amber"
            delay={0.15}
          />
        </section>

        {/* Dynamic Dual Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Controls */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-5 bg-[var(--surface-elevated)]/85 backdrop-blur-xl border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 size-40 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
            
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Plus size={20} />
              </span>
              {editingId ? "Edit Course Module" : "Add Course Module"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Course Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Cybersecurity"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[var(--background)]/70 border border-[var(--border)] text-white focus:outline-hidden focus:border-[var(--accent)] transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    Category Track
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as "technical" | "non-technical")}
                    className="w-full h-12 px-3 rounded-xl bg-[var(--background)]/70 border border-[var(--border)] text-white focus:outline-hidden focus:border-[var(--accent)] transition-all font-semibold"
                  >
                    <option value="technical">Technical</option>
                    <option value="non-technical">Non-Technical</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    Difficulty Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as "Beginner" | "Intermediate" | "Advanced")}
                    className="w-full h-12 px-3 rounded-xl bg-[var(--background)]/70 border border-[var(--border)] text-white focus:outline-hidden focus:border-[var(--accent)] transition-all font-semibold"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Total Audio Episodes
                </label>
                <input
                  type="number"
                  min={1}
                  value={episodes}
                  onChange={(e) => setEpisodes(Math.max(1, Number(e.target.value)))}
                  className="w-full h-12 px-4 rounded-xl bg-[var(--background)]/70 border border-[var(--border)] text-white focus:outline-hidden focus:border-[var(--accent)] transition-all font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Brief Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize course content and learning goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[var(--background)]/70 border border-[var(--border)] text-white focus:outline-hidden focus:border-[var(--accent)] transition-all font-medium leading-relaxed resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                  >
                    <Undo size={16} /> Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-2 h-12 rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 text-white font-bold transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20`}
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {editingId ? "Update Module" : "Publish Module"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.section>

          {/* Right Column: Existing Courses Table */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-7 bg-[var(--surface-elevated)]/85 backdrop-blur-xl border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl flex flex-col"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <Layers size={20} />
              </span>
              Active Curriculum
            </h2>

            {loading ? (
              <div className="flex-grow flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
                <span className="text-[var(--text-secondary)] font-semibold">Connecting to Firestore database...</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="text-[var(--text-muted)] mb-3" size={48} />
                <h3 className="text-xl font-bold text-white mb-1">No Courses Found</h3>
                <p className="text-[var(--text-secondary)] text-sm max-w-sm">Create your first training course module using the form on the left.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    className="p-5 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)] hover:border-white/10 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                          course.category === "technical" 
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {course.category}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-white/5 text-white border border-white/10">
                          {course.level}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {course.episodes} Episodes
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-white leading-tight">
                        {course.name}
                      </h3>
                      {course.description && (
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md line-clamp-1">
                          {course.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                        title="Edit course"
                      >
                        <Plus className="rotate-45" size={16} /> {/* Custom edit representation or we use inline/Plus icons */}
                      </button>
                      <button
                        onClick={() => course.id && handleDelete(course.id)}
                        className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors"
                        title="Delete course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

        </div>

      </div>
    </main>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "cyan" | "indigo" | "rose" | "amber";
  delay: number;
}

function MetricCard({ title, value, icon, color, delay }: MetricCardProps) {
  const glowVariants: Record<MetricCardProps["color"], string> = {
    cyan: "group-hover:shadow-[0_0_24px_-4px_rgba(6,182,212,0.15)]",
    indigo: "group-hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.15)]",
    rose: "group-hover:shadow-[0_0_24px_-4px_rgba(244,63,94,0.15)]",
    amber: "group-hover:shadow-[0_0_24px_-4px_rgba(245,158,11,0.15)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`group flex items-center justify-between p-6 bg-[var(--surface-elevated)]/85 backdrop-blur-xl border border-[var(--border)] rounded-3xl transition-all duration-500 ${glowVariants[color]}`}
    >
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {title}
        </span>
        <h4 className="text-3xl font-extrabold text-white">
          {value}
        </h4>
      </div>
      <div className="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] shadow-inner">
        {icon}
      </div>
    </motion.div>
  );
}
