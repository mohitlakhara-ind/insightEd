import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { VoiceAssistant } from "@/components/voice-assistant";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InsightEd — Accessible vocational training",
    template: "%s · InsightEd",
  },
  description:
    "Web experience for InsightEd: courses, pronunciation practice, community, and games—with accessibility at the center.",
  applicationName: "InsightEd",
  openGraph: {
    title: "InsightEd",
    description:
      "Modern Next.js web client for vocational training and accessibility-first learning.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full scroll-smooth relative`} data-scroll-behavior="smooth">
      <body className="relative min-h-full overflow-x-hidden text-[var(--foreground)] antialiased">
        <AuthProvider>
          <AmbientBackdrop />
          <SkipLink />
          <div className="relative z-10 flex min-h-full flex-col">
            <SiteHeader />
            {children}
            <SiteFooter />
            <VoiceAssistant />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
