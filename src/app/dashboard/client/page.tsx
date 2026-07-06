"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import { useLanguage } from "@/components/LanguageContext";
import { InvitationEditor, RsvpTracker } from "./_components";
import type { PurchaseData } from "@/types/invitation";
import { Spinner, ErrorState, Button } from "@/components/ui";

export default function ClientDashboardPage() {
  const { lang, t } = useLanguage();
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseData | null>(null);

  // RSVP panel state
  const [trackingInvitationId, setTrackingInvitationId] = useState<string | null>(null);
  const [trackingTemplateTitle, setTrackingTemplateTitle] = useState<string>("");

  // Copy status
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Fetch client purchases ──────────────────────────────────────────
  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<PurchaseData[]>("/purchases/my-purchases");
      setPurchases(res.data);
      setError(null);

      // Auto-select first active invitation for RSVP tracking if exists
      const firstActive = res.data.find((p) => p.invitation !== null);
      if (firstActive && firstActive.invitation) {
        setTrackingInvitationId(firstActive.invitation.id);
        setTrackingTemplateTitle(firstActive.template.title);
      }
    } catch (err) {
      logger.error("Error fetching purchases", err);
      setError(
        t("Failed to load your purchased invitations. Make sure the backend server is running.")
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  // ── Copy Shareable link to clipboard ───────────────────────────────
  const handleCopyLink = async (purchaseId: string, slug: string) => {
    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
    const liveUrl = `${baseUrl}/invite/${slug}`;
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopiedId(purchaseId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = liveUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(purchaseId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // ── Toggle Link Activation ──────────────────────────────────────────
  const handleToggleLinkActivation = async (invitationId: string, newState: boolean) => {
    try {
      await api.put(`/invitations/${invitationId}`, { isActive: newState });
      setPurchases((prev) =>
        prev.map((p) =>
          p.invitation?.id === invitationId
            ? {
                ...p,
                invitation: p.invitation ? { ...p.invitation, isActive: newState } : null,
              }
            : p
        )
      );
    } catch (err) {
      logger.error("Failed to toggle link activation", err);
    }
  };

  // ── Open Editor (Create or Edit) ──────────────────────────────────
  const handleOpenEditor = (purchase: PurchaseData) => {
    setEditingPurchase(purchase);
    setIsEditorOpen(true);
  };

  // ── Handle Editor Save Callback ──────────────────────────────────
  const handleInvitationSaved = () => {
    setIsEditorOpen(false);
    setEditingPurchase(null);
    fetchPurchases(); // Re-fetch all purchases to update statuses
  };

  if (loading) {
    return (
      <div className="py-24">
        <Spinner label={t("Loading your dashboard...")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-12">
        <ErrorState
          title={t("Connection Issue")}
          message={error}
          retryLabel={t("Retry Loading")}
          onRetry={fetchPurchases}
          className="max-w-md mx-auto"
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto space-y-10">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-serif font-medium text-neutral-800" dir={lang === "ar" ? "rtl" : "ltr"}>
          {t("My Purchases")}
        </h1>
        <p className="mt-1.5 text-xs text-[#7F8487] leading-relaxed" dir={lang === "ar" ? "rtl" : "ltr"}>
          {t(
            "Manage your purchased templates, edit Groom & Bride details, copy shareable links, and monitor live RSVP statistics."
          )}
        </p>
      </div>

      {/* ── Empty State ────────────────────────────────────────────── */}
      {purchases.length === 0 ? (
        <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-12 text-center shadow-sm">
          <span className="text-4xl block mb-3" role="img" aria-label="shopping bag">
            🛍️
          </span>
          <h3 className="font-bold text-sm text-[#2D3142] mb-1">{t("No Purchases Found")}</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed mb-4">
            {t("You haven't purchased any templates yet, or your orders are still pending admin approval.")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 h-10 text-xs font-semibold text-[#E5C38B] bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] rounded-xl transition-all shadow-sm"
          >
            {t("Browse Mazoom")}
          </Link>
        </div>
      ) : (
        /* ── Purchases List Grid ──────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {purchases.map((purchase) => {
            const hasInvite = purchase.invitation !== null;
            const inviteUrl = hasInvite
              ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${
                  purchase.invitation?.slug
                }`
              : "";

            return (
              <article
                key={purchase.id}
                className="bg-white border border-[#EBE7DF] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Image & Main Info Layout */}
                <div
                  className={`p-5 flex gap-4 border-b border-[#F4F1EA] ${
                    lang === "ar" ? "flex-row-reverse text-right" : "flex-row text-left"
                  }`}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  <div className="w-24 h-24 rounded-xl bg-[#FAF8F5] border border-[#F0ECE3] overflow-hidden shrink-0 shadow-sm relative">
                    <Image
                      src={purchase.template.previewImage}
                      alt={t(purchase.template.title)}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-sans font-bold text-neutral-800 text-[14px] leading-tight">
                          {purchase.template.title}
                        </h3>
                        {/* Toggle Switch - top right */}
                        {hasInvite && (
                          <button
                            onClick={() =>
                              handleToggleLinkActivation(
                                purchase.invitation!.id,
                                !purchase.invitation!.isActive
                              )
                            }
                            className="shrink-0 relative cursor-pointer group"
                            title={
                              purchase.invitation!.isActive
                                ? t("Deactivate Link")
                                : t("Activate Link")
                            }
                            aria-label={
                              purchase.invitation!.isActive
                                ? "Deactivate public link"
                                : "Activate public link"
                            }
                          >
                            <div
                              className={`w-9 h-5 rounded-full transition-colors duration-300 ${
                                purchase.invitation!.isActive ? "bg-[#0B1528]" : "bg-neutral-300"
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-300 ${
                                  purchase.invitation!.isActive
                                    ? `${lang === "ar" ? "left-0.5" : "left-[18px]"} bg-[#E5C38B]`
                                    : `${lang === "ar" ? "left-[18px]" : "left-0.5"} bg-white`
                                }`}
                              />
                            </div>
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-[#7F8487] mt-1 font-medium">
                        {t("Purchased")}:{" "}
                        {new Date(purchase.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {hasInvite ? (
                      <div className="flex flex-col gap-1.5 items-start">
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                            purchase.invitation!.isActive
                              ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                              : "text-rose-600 bg-rose-50 border-rose-100"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              purchase.invitation!.isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {purchase.invitation!.isActive
                            ? t("Active Invitation")
                            : t("Deactivated Link")}
                        </span>
                        <a
                          href={purchase.invitation!.isActive ? inviteUrl : undefined}
                          target={purchase.invitation!.isActive ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className={`text-[11px] transition-all line-clamp-1 ${
                            purchase.invitation!.isActive
                              ? "text-neutral-500 underline hover:text-black cursor-pointer"
                              : "text-neutral-400 line-through opacity-60 cursor-not-allowed"
                          }`}
                          onClick={(e) => {
                            if (!purchase.invitation!.isActive) e.preventDefault();
                          }}
                        >
                          {inviteUrl}
                        </a>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {t("Pending Setup")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-[#FAF8F5] flex flex-wrap gap-2 justify-between items-center">
                  {!hasInvite ? (
                    <Button
                      variant="primary"
                      onClick={() => handleOpenEditor(purchase)}
                      className="w-full flex items-center justify-center gap-1"
                    >
                      <span>{t("Create Invitation")}</span>
                    </Button>
                  ) : (
                    <div className="w-full flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditor(purchase)}
                        className="flex-1"
                      >
                        {t("Edit Details")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(purchase.id, purchase.invitation!.slug)}
                        className="flex-1"
                      >
                        {copiedId === purchase.id ? t("Copied!") : t("Copy Link")}
                      </Button>
                      <Button
                        variant={
                          trackingInvitationId === purchase.invitation!.id
                            ? "primary"
                            : "secondary"
                        }
                        size="sm"
                        onClick={() => {
                          setTrackingInvitationId(purchase.invitation!.id);
                          setTrackingTemplateTitle(purchase.template.title);
                          document
                            .getElementById("rsvp-tracker-section")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="flex-1"
                      >
                        {t("Track RSVPs")}
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── RSVP Tracker Panel (Only if selected) ───────────────────── */}
      {trackingInvitationId && (
        <section
          id="rsvp-tracker-section"
          className="bg-white border border-[#EBE7DF] rounded-[32px] p-6 sm:p-8 shadow-sm transition-all duration-300"
        >
          <div
            className={`border-b border-[#F4F1EA] pb-4 mb-6 flex justify-between items-start gap-4 ${
              lang === "ar" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div className={lang === "ar" ? "text-right" : "text-left"}>
              <h2 className="text-xl font-serif font-medium text-neutral-800">
                {t("Audience RSVPs")} —{" "}
                <span className="text-[#B89C72]">{trackingTemplateTitle}</span>
              </h2>
              <p className="text-xs text-[#7F8487] mt-1">
                {t("Live guest feedback and attendance metrics.")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setTrackingInvitationId(null)}>
              {t("Close")}
            </Button>
          </div>
          <RsvpTracker invitationId={trackingInvitationId} />
        </section>
      )}

      {/* ── Invitation Editor Overlay Modal (Create / Edit Popup) ───── */}
      {isEditorOpen && editingPurchase && (
        <div
          className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm z-50 overflow-y-auto p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[32px] max-w-xl w-full p-8 shadow-2xl relative my-8 mx-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsEditorOpen(false);
                setEditingPurchase(null);
              }}
              className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors cursor-pointer"
              aria-label="Close editor"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Body */}
            <InvitationEditor
              purchaseId={editingPurchase.id}
              invitation={editingPurchase.invitation}
              templateTitle={editingPurchase.template.title}
              onSaved={handleInvitationSaved}
            />
          </div>
        </div>
      )}
    </div>
  );
}
