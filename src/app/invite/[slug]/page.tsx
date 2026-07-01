import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { InvitationData } from "@/types/invitation";
import InvitationClientPage from "./_components/InvitationClientPage";

// ── Types ──────────────────────────────────────────────────────────────

interface InvitePageProps {
  params: Promise<{ slug: string }>;
}

// ── Data Fetching (Server-Side) ────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getInvitation(slug: string): Promise<InvitationData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/invitations/slug/${slug}`, {
      next: { revalidate: 60 }, // ISR — revalidate every 60s
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Dynamic SEO Metadata ───────────────────────────────────────────────

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) {
    return { title: "Invitation Not Found" };
  }

  const desc = invitation.welcomeText 
    ? invitation.welcomeText.slice(0, 160) 
    : `تشرف دعوتكم لحضور حفل زفاف: ${invitation.eventTitle}`;

  return {
    title: `دعوة حضور: ${invitation.eventTitle}`,
    description: desc,
    openGraph: {
      title: `دعوة حضور: ${invitation.eventTitle}`,
      description: desc,
      images: invitation.images && invitation.images[0] ? [invitation.images[0]] : [],
    },
  };
}

// ── Page Component ─────────────────────────────────────────────────────

export default async function InvitePage({ params }: InvitePageProps) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) notFound();

  return <InvitationClientPage invitation={invitation} />;
}

