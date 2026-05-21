import { AuthGuard } from "@/components/auth-guard";

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
