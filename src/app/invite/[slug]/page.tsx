import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { InvitationData } from "@/types/invitation";
import {
  HeroSection,
  MusicPlayer,
  CountdownTimer,
  ImageGallery,
  EventDetailsSection,
  RsvpForm,
} from "./_components";

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

  return {
    title: `You're Invited — ${invitation.slug}`,
    description:
      invitation.welcomeText.slice(0, 160) ||
      "You have received a beautiful wedding invitation.",
    openGraph: {
      title: `You're Invited — ${invitation.slug}`,
      description: invitation.welcomeText.slice(0, 160),
      images: invitation.images[0] ? [invitation.images[0]] : [],
    },
  };
}

// ── Page Component ─────────────────────────────────────────────────────

export default async function InvitePage({ params }: InvitePageProps) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) notFound();

  return (
    <main className="relative min-h-screen bg-[#FBF9F5]">
      {/* ── Background texture ─────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #D4AF37 0.5px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Music player (conditional) ─────────────────────────── */}
      {invitation.musicUrl && <MusicPlayer musicUrl={invitation.musicUrl} />}

      {/* ── Hero ───────────────────────────────────────────────── */}
      <HeroSection welcomeText={invitation.welcomeText} />

      {/* ── Divider ────────────────────────────────────────────── */}
      <div className="mx-auto h-[1px] max-w-xs bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      {/* ── Countdown ──────────────────────────────────────────── */}
      <CountdownTimer eventDate={invitation.eventDate} />

      {/* ── Divider ────────────────────────────────────────────── */}
      <div className="mx-auto h-[1px] max-w-xs bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      {/* ── Gallery ────────────────────────────────────────────── */}
      {invitation.images.length > 0 && (
        <ImageGallery images={invitation.images} />
      )}

      {/* ── Divider ────────────────────────────────────────────── */}
      <div className="mx-auto h-[1px] max-w-xs bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      {/* ── Event Details ──────────────────────────────────────── */}
      <EventDetailsSection
        eventDate={invitation.eventDate}
        locationUrl={invitation.locationUrl}
      />

      {/* ── Divider ────────────────────────────────────────────── */}
      <div className="mx-auto h-[1px] max-w-xs bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      {/* ── RSVP Form ──────────────────────────────────────────── */}
      <RsvpForm invitationId={invitation.id} />

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="pb-24 pt-12 text-center">
        <div className="mb-4 text-2xl">✦</div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#C8C8C8]">
          Made with love on Mazoom
        </p>
      </footer>
    </main>
  );
}
