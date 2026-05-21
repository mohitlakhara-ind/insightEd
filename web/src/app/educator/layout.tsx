import { AuthGuard } from "@/components/auth-guard";

/** Educator panel: auth required; passcode/role checks happen on the page */
export default function EducatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
