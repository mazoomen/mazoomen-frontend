"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { InvitationData } from "@/types/invitation";
import {
  InvitationEditor,
  RsvpTracker,
  LiveLinkBanner,
} from "./_components";

type PageStatus = "loading" | "no-invitation" | "has-invitation" | "error";

export default function ClientDashboardPage() {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");

  // ── Fetch existing invitation on mount ───────────────────────────────
  // Since there's no "list my invitations" endpoint, we store the
  // invitation ID locally after creation and re-fetch it.
  const fetchInvitation = useCallback(async () => {
    const invitationId = localStorage.getItem("my_invitation_id");
    const invitationSlug = localStorage.getItem("my_invitation_slug");

    if (!invitationId && !invitationSlug) {
      setStatus("no-invitation");
      return;
    }

    try {
      // Try fetching by slug first (public endpoint — more reliable)
      if (invitationSlug) {
        const res = await api.get<InvitationData>(
          `/invitations/slug/${invitationSlug}`,
        );
        setInvitation(res.data);
        setStatus("has-invitation");
        return;
      }
    } catch {
      // Slug might have changed — clear and let user create again
      localStorage.removeItem("my_invitation_slug");
      localStorage.removeItem("my_invitation_id");
      setStatus("no-invitation");
    }
  }, []);

  useEffect(() => {
    fetchInvitation();
  }, [fetchInvitation]);

  // ── Handle successful save ───────────────────────────────────────────
  const handleSaved = (saved: InvitationData) => {
    setInvitation(saved);
    setStatus("has-invitation");
    localStorage.setItem("my_invitation_id", saved.id);
    localStorage.setItem("my_invitation_slug", saved.slug);
  };

  // ── Loading state ────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-800" />
        <div className="h-96 animate-pulse rounded-xl bg-gray-800/50" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* ── Page header ────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          My Invitation
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {status === "has-invitation"
            ? "Edit your invitation details and track RSVPs."
            : "Create your digital wedding invitation."}
        </p>
      </div>

      {/* ── Live link banner (if slug exists) ──────────────────── */}
      {invitation?.slug && <LiveLinkBanner slug={invitation.slug} />}

      {/* ── Editor ─────────────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 sm:p-8">
        <InvitationEditor
          invitation={invitation}
          onSaved={handleSaved}
        />
      </section>

      {/* ── RSVP Tracker (only when invitation exists) ─────────── */}
      {invitation && (
        <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 sm:p-8">
          <RsvpTracker invitationId={invitation.id} />
        </section>
      )}
    </div>
  );
}
