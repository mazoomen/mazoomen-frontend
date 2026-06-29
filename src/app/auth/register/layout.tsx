import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Mazoom",
  description: "Register for a Mazoom account to create digital wedding invitations.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
