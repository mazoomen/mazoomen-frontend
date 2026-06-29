import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Mazoom",
  description: "Sign in to manage your wedding invitations.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
