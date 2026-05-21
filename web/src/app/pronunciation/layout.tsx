import { AuthGuard } from "@/components/auth-guard";

export default function PronunciationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
