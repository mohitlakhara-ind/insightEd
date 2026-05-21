import { AuthGuard } from "@/components/auth-guard";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
