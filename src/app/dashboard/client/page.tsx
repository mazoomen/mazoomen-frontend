"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { InvitationEditor, RsvpTracker } from "./_components";

interface PurchaseInvitation {
  id: string;
  slug: string;
  eventTitle: string;
  eventDate: string;
  isActive: boolean;
}

interface PurchaseTemplate {
  id: string;
  title: string;
  previewImage: string;
  price: string | number;
}

interface PurchaseData {
  id: string;
  templateId: string;
  purchaseRequestId: string;
  slug: string;
  createdAt: string;
  template: PurchaseTemplate;
  invitation: PurchaseInvitation | null;
}

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
      const firstActive = res.data.find(p => p.invitation !== null);
      if (firstActive && firstActive.invitation) {
        setTrackingInvitationId(firstActive.invitation.id);
        setTrackingTemplateTitle(firstActive.template.title);
      }
    } catch (err) {
      console.error("Error fetching purchases:", err);
      setError(t("Failed to load your purchased invitations. Make sure the backend server is running."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    setTimeout(() => {
      fetchPurchases();
    }, 0);
  }, [fetchPurchases]);

  // ── Copy Shareable link to clipboard ───────────────────────────────
  const handleCopyLink = async (purchaseId: string, slug: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
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
            ? { ...p, invitation: { ...p.invitation, isActive: newState } }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to toggle link activation:", err);
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

  // ── Loading state ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-neutral-200 border-t-black animate-spin"></div>
        <p className="text-xs text-neutral-500 font-medium">{t("Loading your dashboard...")}</p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-[#E6E2DA] rounded-2xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[#2D3142] mb-2">{t("Connection Issue")}</h3>
        <p className="text-xs text-[#7F8487] leading-relaxed mb-4">{error}</p>
        <button
          onClick={fetchPurchases}
          className="px-4 py-2 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-full transition-all"
        >
          {t("Retry Loading")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto space-y-10">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-serif font-medium text-neutral-800" dir={lang === "ar" ? "rtl" : "ltr"}>{t("My Purchases")}</h1>
        <p className="mt-1.5 text-xs text-[#7F8487] leading-relaxed" dir={lang === "ar" ? "rtl" : "ltr"}>
          {t("Manage your purchased templates, edit Groom & Bride details, copy shareable links, and monitor live RSVP statistics.")}
        </p>
      </div>

      {/* ── Empty State ────────────────────────────────────────────── */}
      {purchases.length === 0 ? (
        <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-12 text-center shadow-sm">
          <span className="text-4xl block mb-3">🛍️</span>
          <h3 className="font-bold text-sm text-[#2D3142] mb-1">{t("No Purchases Found")}</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed mb-4">
            {t("You haven't purchased any templates yet, or your orders are still pending admin approval.")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 h-10 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-xl transition-all shadow-sm"
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
              ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${purchase.invitation?.slug}`
              : "";

            return (
              <article
                key={purchase.id}
                className="bg-white border border-[#EBE7DF] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Image & Main Info Layout */}
                <div className={`p-5 flex gap-4 border-b border-[#F4F1EA] ${lang === "ar" ? "flex-row-reverse text-right" : "flex-row text-left"}`} dir={lang === "ar" ? "rtl" : "ltr"}>
                  <div className="w-24 h-24 rounded-xl bg-[#FAF8F5] border border-[#F0ECE3] overflow-hidden shrink-0 shadow-sm relative">
                    <img
                      src={purchase.template.previewImage}
                      alt={t(purchase.template.title)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-sans font-bold text-neutral-800 text-[14px] leading-tight">
                        {purchase.template.title}
                      </h3>
                      <p className="text-[10px] text-[#7F8487] mt-1 font-medium">
                        {t("Purchased")}: {new Date(purchase.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    {hasInvite ? (
                      <div className="flex flex-col gap-1.5 items-start">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] uppercase tracking-wider font-bold ${purchase.invitation!.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ● {purchase.invitation!.isActive ? t("Active Invitation") : t("Deactivated Link")}
                          </span>
                          <button
                            onClick={() => handleToggleLinkActivation(purchase.invitation!.id, !purchase.invitation!.isActive)}
                            className={`text-[9px] px-2 py-0.5 rounded-full border bg-white font-medium hover:bg-neutral-50 cursor-pointer transition-all ${
                              purchase.invitation!.isActive
                                ? 'text-rose-600 border-rose-100 hover:bg-rose-50'
                                : 'text-emerald-600 border-emerald-100 hover:bg-emerald-50'
                            }`}
                          >
                            {purchase.invitation!.isActive ? t("Cancel Link") : t("Activate Link")}
                          </button>
                        </div>
                        <a
                          href={inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[11px] text-neutral-500 underline hover:text-black transition-all line-clamp-1 ${!purchase.invitation!.isActive ? 'line-through opacity-60' : ''}`}
                        >
                          {inviteUrl}
                        </a>
                      </div>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">
                        ○ {t("Pending Setup")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-[#FAF8F5] flex flex-wrap gap-2 justify-between items-center">
                  {!hasInvite ? (
                    <button
                      onClick={() => handleOpenEditor(purchase)}
                      className="w-full py-2 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{t("Create Invitation")}</span>
                    </button>
                  ) : (
                    <div className="w-full flex gap-2">
                      <button
                        onClick={() => handleOpenEditor(purchase)}
                        className="flex-1 py-2 text-[11px] font-semibold bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl transition-all cursor-pointer text-center"
                      >
                        {t("Edit Details")}
                      </button>
                      <button
                        onClick={() => handleCopyLink(purchase.id, purchase.invitation!.slug)}
                        className="flex-1 py-2 text-[11px] font-semibold bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl transition-all cursor-pointer text-center"
                      >
                        {copiedId === purchase.id ? t("Copied!") : t("Copy Link")}
                      </button>
                      <button
                        onClick={() => {
                          setTrackingInvitationId(purchase.invitation!.id);
                          setTrackingTemplateTitle(purchase.template.title);
                          // Scroll to tracker
                          document.getElementById("rsvp-tracker-section")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`flex-1 py-2 text-[11px] font-semibold rounded-xl transition-all cursor-pointer text-center ${trackingInvitationId === purchase.invitation!.id
                            ? "bg-black text-white"
                            : "bg-[#E8DCC4] text-[#5C4D37] hover:bg-[#DECFA7]"
                          }`}
                      >
                        {t("Track RSVPs")}
                      </button>
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
        <section id="rsvp-tracker-section" className="bg-white border border-[#EBE7DF] rounded-[32px] p-6 sm:p-8 shadow-sm transition-all duration-300">
          <div className={`border-b border-[#F4F1EA] pb-4 mb-6 flex justify-between items-start gap-4 ${lang === "ar" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={lang === "ar" ? "text-right" : "text-left"}>
              <h2 className="text-xl font-serif font-medium text-neutral-800">
                {t("Audience RSVPs")} — <span className="text-[#B89C72]">{trackingTemplateTitle}</span>
              </h2>
              <p className="text-xs text-[#7F8487] mt-1">{t("Live guest feedback and attendance metrics.")}</p>
            </div>
            <button
              onClick={() => {
                setTrackingInvitationId(null);
                setTrackingTemplateTitle("");
              }}
              className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-xl transition-all text-xs font-semibold cursor-pointer shrink-0"
            >
              {t("Close")}
            </button>
          </div>
          <RsvpTracker invitationId={trackingInvitationId} />
        </section>
      )}

      {/* ── Invitation Editor Overlay Modal (Create / Edit Popup) ───── */}
      {isEditorOpen && editingPurchase && (
        <div className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm z-50 overflow-y-auto p-4">
          <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[32px] max-w-xl w-full p-8 shadow-2xl relative my-8 mx-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsEditorOpen(false);
                setEditingPurchase(null);
              }}
              className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
