"use client";

import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { DynamicBackground } from "@/components/dynamic-background";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  User,
  Sparkles,
} from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const {
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    loading: authLoading,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setError("");
    setResetSent(false);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!trimmedPassword) {
      setError("Password is required.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (isSignUp) {
      if (!displayName.trim()) {
        setError("Please enter your name.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(
          trimmedEmail,
          password,
          displayName.trim(),
          "student"
        );
      } else {
        await signInWithEmail(trimmedEmail, password);
      }
      router.push(redirectTo.startsWith("/") ? redirectTo : "/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mb-8 flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
      >
        <ArrowLeft size={16} /> Back to home
      </button>

      <div className="bg-[var(--surface-elevated)]/80 backdrop-blur-2xl border border-[var(--border)] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[var(--accent)]/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-10">
            <div className="size-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mx-auto mb-4 border border-[var(--accent)]/15">
              <Sparkles className="size-6 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
              {isSignUp ? "Create account" : "Welcome back"}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              {isSignUp
                ? "Begin your accessibility-first learning profile"
                : "Sign in to continue your learning journey"}
            </p>
          </div>

          {resetSent && (
            <p className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400">
              Password reset email sent. Check your inbox.
            </p>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            {isSignUp && (
              <>
                <div>
                  <label className="sr-only" htmlFor="name">
                    Your name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <User className="size-5" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full h-14 bg-[var(--background)]/50 border border-[var(--border)] rounded-2xl pl-12 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-sm font-semibold"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                {/* Role selection is resolved automatically based on email domain */}
              </>
            )}

            <div>
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Mail className="size-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-[var(--background)]/50 border border-[var(--border)] rounded-2xl pl-12 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-sm font-semibold"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="sr-only" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="size-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-[var(--background)]/50 border border-[var(--border)] rounded-2xl pl-12 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-sm font-semibold"
                  placeholder="Enter password (min 6 chars)"
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end text-xs font-semibold">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[var(--accent)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full h-14 rounded-2xl bg-[var(--accent)] text-white font-extrabold text-base hover:scale-[1.01] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isSignUp ? "Create account" : "Sign in"}{" "}
                  <ArrowRight className="size-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-sm text-[var(--text-secondary)]">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setError("");
                setIsSignUp(!isSignUp);
              }}
              className="text-[var(--accent)] font-extrabold hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function SignInPage() {
  return (
    <main className="relative min-h-screen pt-28 md:pt-32 pb-12 flex items-center justify-center p-4 md:p-6">
      <DynamicBackground />
      <Suspense
        fallback={
          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <Loader2 className="size-6 animate-spin" />
            Loading…
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </main>
  );
}
