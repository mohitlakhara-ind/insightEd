import { AuthGuard } from "@/components/auth-guard";

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
