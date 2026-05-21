"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/context/auth-context";
import { LogOut, Menu, X } from "lucide-react";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const { user, profile, signOutUser } = useAuth();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 28);
  });

  const nav = [
    { href: "/courses", label: "Courses & audio" },
    { href: "/pronunciation", label: "Pronunciation" },
    { href: "/community", label: "Community" },
    { href: "/games", label: "Mind games" },
  ];

  // If user is an authorized educator, inject the panel link dynamically
  if (profile?.role === "educator") {
    nav.push({ href: "/educator", label: "Educator center" });
  }

  return (
    <motion.header
      layout
      className={`sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 glass-panel ${
        scrolled
          ? "border-[var(--border)] bg-[var(--background)]/90 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)]"
          : "border-transparent bg-[var(--background)]/60 shadow-none"
      }`}
      initial={false}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group relative text-xl font-bold tracking-tight outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
            aria-label="InsightEd home"
          >
            <span className="relative z-10 bg-linear-to-r from-[var(--text-primary)] via-[var(--accent)] to-[var(--text-primary)] bg-clip-text text-transparent transition-opacity group-hover:opacity-90">
              InsightEd
            </span>
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-1 h-px bg-linear-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          </Link>
          <p className="hidden text-sm text-[var(--text-muted)] md:block">
            Vocational training · accessibility-first
          </p>
        </div>

        {/* Desktop Navigation */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-1 sm:gap-0.5"
        >
          {nav.map((item) => (
            <motion.span key={item.href} whileHover={reduceMotion ? {} : { y: -1 }}>
              <Link
                href={item.href}
                className="relative rounded-full px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)]/80 hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              >
                {item.label}
              </Link>
            </motion.span>
          ))}

          {user ? (
            /* Authenticated User Controls (Authz visual representation) */
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)] ml-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {profile?.displayName || "User"}
                </span>
                <span className={`text-[9px] uppercase tracking-wider font-extrabold ${
                  profile?.role === "educator" ? "text-indigo-400" : "text-[var(--accent)]"
                }`}>
                  {profile?.role || "student"}
                </span>
              </div>
              
              <button
                onClick={() => signOutUser()}
                className="p-2 rounded-full hover:bg-white/5 border border-transparent hover:border-[var(--border)] text-[var(--text-muted)] hover:text-rose-400 transition-all ml-1"
                title="Sign out of account"
                aria-label="Sign out of account"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            /* Unauthenticated Trigger Button */
            <motion.div
              className="ml-1"
              whileHover={reduceMotion ? {} : { scale: 1.02 }}
              whileTap={reduceMotion ? {} : { scale: 0.98 }}
            >
              <Link
                href="/sign-in"
                className="relative inline-flex overflow-hidden rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--accent-fg)] shadow-[0_10px_28px_-8px_var(--accent-glow)] border border-white/10 transition-[filter,transform] hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              >
                <span className="relative z-10">Sign in</span>
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100 ${reduceMotion ? "hidden" : ""}`}
                />
              </Link>
            </motion.div>
          )}

          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile controls row (Hamburger, theme toggle) */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          
          {user && (
            <button
              onClick={() => signOutUser()}
              className="p-2 rounded-full hover:bg-white/5 border border-transparent hover:border-[var(--border)] text-[var(--text-muted)] hover:text-rose-400 transition-all"
              title="Sign out of account"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-[var(--border)] bg-[var(--background)]/95 glass-panel overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3 flex flex-col">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-base font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]/80 hover:text-[var(--text-primary)] transition-all"
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                <div className="border-t border-[var(--border)] pt-3 mt-2 flex items-center justify-between px-4 py-2 bg-[var(--surface-muted)]/50 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {profile?.displayName || "User"}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold ${
                      profile?.role === "educator" ? "text-indigo-400" : "text-[var(--accent)]"
                    }`}>
                      {profile?.role || "student"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOutUser();
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/20 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
                  >
                    <LogOut size={12} />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-[var(--border)]">
                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent)] text-base font-bold text-[var(--accent-fg)] shadow-md"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
