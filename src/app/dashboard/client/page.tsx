"use client";

import { useEffect, useState, useCallback } from "react";
import { getS3Url } from "@/lib/s3";
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

  // RSVP / Tracking panel state
  const [trackingInvitationId, setTrackingInvitationId] = useState<string | null>(null);
  const [trackingTemplateTitle, setTrackingTemplateTitle] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"rsvps" | "image">("rsvps");
  const [selectedLightboxMoment, setSelectedLightboxMoment] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  // ── Delete a guest photo/moment or host gallery image ─────────────
  const handleDeleteMoment = async (invitationId: string, urlToDelete: string) => {
    const confirmed = window.confirm(
      lang === "ar"
        ? "هل أنت متأكد من رغبتك في حذف هذه الصورة؟"
        : "Are you sure you want to delete this image?"
    );
    if (!confirmed) return;

    try {
      const purchase = purchases.find((p) => p.invitation?.id === invitationId);
      if (!purchase || !purchase.invitation) return;

      const hostImages = purchase.invitation.images || [];
      const currentMoments = purchase.invitation.moments || [];
      const currentHidden = purchase.invitation.hiddenMoments || [];
      const isHostImage = hostImages.includes(urlToDelete);

      if (isHostImage) {
        const updatedImages = hostImages.filter((url) => url !== urlToDelete);
        const updatedDeletedImages = [
          ...Array.from(new Set([...(purchase.invitation.deletedImages || []), urlToDelete])),
        ];

        await api.put(`/invitations/${invitationId}`, {
          images: updatedImages,
          deletedImages: updatedDeletedImages,
        });

        // Update local state so UI updates instantly
        setPurchases((prev) =>
          prev.map((p) =>
            p.invitation?.id === invitationId
              ? {
                  ...p,
                  invitation: p.invitation
                    ? { 
                        ...p.invitation, 
                        images: updatedImages,
                        deletedImages: updatedDeletedImages
                      }
                    : null,
                }
              : p
          )
        );
      } else {
        const updatedMoments = currentMoments.filter((url) => url !== urlToDelete);
        const updatedHidden = currentHidden.filter((url) => url !== urlToDelete);
        const updatedDeletedMoments = [
          ...Array.from(new Set([...(purchase.invitation.deletedMoments || []), urlToDelete])),
        ];

        await api.put(`/invitations/${invitationId}`, {
          moments: updatedMoments,
          hiddenMoments: updatedHidden,
          deletedMoments: updatedDeletedMoments,
        });

        // Update local state so UI updates instantly
        setPurchases((prev) =>
          prev.map((p) =>
            p.invitation?.id === invitationId
              ? {
                  ...p,
                  invitation: p.invitation
                    ? { 
                        ...p.invitation, 
                        moments: updatedMoments,
                        hiddenMoments: updatedHidden,
                        deletedMoments: updatedDeletedMoments
                      }
                    : null,
                }
              : p
          )
        );
      }
      setSelectedLightboxMoment(null);
    } catch (err) {
      logger.error("Failed to delete image", err);
      alert(
        lang === "ar"
          ? "فشل حذف الصورة. يرجى المحاولة مرة أخرى."
          : "Failed to delete image. Please try again."
      );
    }
  };

  // ── Toggle visibility of guest photo/moment ──────────────────────
  const handleToggleHideMoment = async (invitationId: string, urlToToggle: string) => {
    try {
      const purchase = purchases.find((p) => p.invitation?.id === invitationId);
      if (!purchase || !purchase.invitation) return;

      const currentMoments = purchase.invitation.moments || [];
      const currentHidden = purchase.invitation.hiddenMoments || [];
      const isCurrentlyHidden = currentHidden.includes(urlToToggle);

      let updatedMoments: string[];
      let updatedHidden: string[];

      if (isCurrentlyHidden) {
        // Move from hidden to visible
        updatedHidden = currentHidden.filter((url) => url !== urlToToggle);
        updatedMoments = currentMoments.includes(urlToToggle)
          ? currentMoments
          : [...currentMoments, urlToToggle];
      } else {
        // Move from visible to hidden
        updatedHidden = [...currentHidden, urlToToggle];
        updatedMoments = currentMoments.filter((url) => url !== urlToToggle);
      }

      await api.put(`/invitations/${invitationId}`, {
        moments: updatedMoments,
        hiddenMoments: updatedHidden,
      });

      // Update local state so UI updates instantly
      setPurchases((prev) =>
        prev.map((p) =>
          p.invitation?.id === invitationId
            ? {
                ...p,
                invitation: p.invitation
                  ? {
                      ...p.invitation,
                      moments: updatedMoments,
                      hiddenMoments: updatedHidden,
                    }
                  : null,
              }
            : p
        )
      );
    } catch (err) {
      logger.error("Failed to toggle hide moment", err);
      alert(
        lang === "ar"
          ? "فشل تعديل حالة ظهور الصورة. يرجى المحاولة مرة أخرى."
          : "Failed to update image visibility. Please try again."
      );
    }
  };

  // ── Drag and Drop Image Reordering ────────────────────────────────
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number, allFeedImages: any[]) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updatedList = [...allFeedImages];
    const draggedItem = updatedList[draggedIndex];
    updatedList.splice(draggedIndex, 1);
    updatedList.splice(targetIndex, 0, draggedItem);

    const newImages = updatedList.filter(item => !item.isGuest).map(item => item.url);
    const newMoments = updatedList.filter(item => item.isGuest && !item.isHidden).map(item => item.url);
    const newHidden = updatedList.filter(item => item.isGuest && item.isHidden).map(item => item.url);

    setPurchases(prev => prev.map(p => {
      if (p.invitation?.id === trackingInvitationId) {
        return {
          ...p,
          invitation: p.invitation
            ? {
                ...p.invitation,
                images: newImages,
                moments: newMoments,
                hiddenMoments: newHidden
              }
            : null
        };
      }
      return p;
    }));

    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    if (!trackingInvitationId) return;

    const purchase = purchases.find(p => p.invitation?.id === trackingInvitationId);
    if (!purchase || !purchase.invitation) return;

    try {
      await api.put(`/invitations/${trackingInvitationId}`, {
        images: purchase.invitation.images || [],
        moments: purchase.invitation.moments || [],
        hiddenMoments: purchase.invitation.hiddenMoments || []
      });
    } catch (err) {
      logger.error("Failed to save reordered images", err);
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
                      src={getS3Url(purchase.template.previewImage)}
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
                          setActiveTab("rsvps");
                          document
                            .getElementById("rsvp-tracker-section")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="flex-1"
                      >
                        {t("Track")}
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Tracking Dashboard Panel (Only if selected) ──────────────── */}
      {trackingInvitationId && (() => {
        const trackingPurchase = purchases.find((p) => p.invitation?.id === trackingInvitationId);
        const hostImages = trackingPurchase?.invitation?.images || [];
        const moments = trackingPurchase?.invitation?.moments || [];
        const hiddenMoments = trackingPurchase?.invitation?.hiddenMoments || [];
        const allFeedImages = [
          ...hostImages.map((url) => ({ url, isGuest: false, isHidden: false })),
          ...moments.map((url) => ({ url, isGuest: true, isHidden: false })),
          ...hiddenMoments.map((url) => ({ url, isGuest: true, isHidden: true })),
        ];

        return (
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
                  {t("Track")} —{" "}
                  <span className="text-[#B89C72]">{trackingTemplateTitle}</span>
                </h2>
                <p className="text-xs text-[#7F8487] mt-1">
                  {t("Live guest RSVPs and uploaded photos.")}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setTrackingInvitationId(null)}>
                {t("Close")}
              </Button>
            </div>

            {/* Tabs Header */}
            <div
              className={`flex border-b border-[#F4F1EA] mb-6 gap-1 ${
                lang === "ar" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <button
                onClick={() => setActiveTab("rsvps")}
                className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-px cursor-pointer ${
                  activeTab === "rsvps"
                    ? "border-[#B89C72] text-[#B89C72]"
                    : "border-transparent text-[#7F8487] hover:text-neutral-800"
                }`}
              >
                {t("RSVPs")}
              </button>
              <button
                onClick={() => setActiveTab("image")}
                className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-px cursor-pointer ${
                  activeTab === "image"
                    ? "border-[#B89C72] text-[#B89C72]"
                    : "border-transparent text-[#7F8487] hover:text-neutral-800"
                }`}
              >
                {t("Image")}
              </button>
            </div>

            {/* Active Tab Content */}
            {activeTab === "rsvps" && (
              <RsvpTracker invitationId={trackingInvitationId} />
            )}

            {activeTab === "image" && (
              <div className="space-y-6">
                {allFeedImages.length === 0 ? (
                  <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF8F5] p-10 text-center shadow-inner">
                    <p className="text-4xl block mb-2 select-none">📸</p>
                    <h4 className="font-bold text-sm text-neutral-800">
                      {t("No guest photos uploaded yet.")}
                    </h4>
                    <p className="mt-1 text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                      {t("Photos uploaded by guests using the moments gallery will appear here.")}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {allFeedImages.map((item, index) => {
                      return (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index, allFeedImages)}
                          onDragEnd={handleDragEnd}
                          className={`relative aspect-square overflow-hidden shadow-md cursor-grab active:scale-[0.97] transition-all duration-300 ${
                            draggedIndex === index
                              ? "opacity-40 scale-[0.95] border-2 border-dashed border-[#B89C72]"
                              : ""
                          }`}
                          style={{
                            background: "rgba(255, 255, 255, 0.55)",
                            backdropFilter: "blur(12px)",
                            border: draggedIndex === index ? undefined : "1px solid rgba(0, 0, 0, 0.08)",
                            borderRadius: "22px",
                          }}
                          onClick={() => setSelectedLightboxMoment(item.url)}
                        >
                          {/* Image Thumbnail */}
                          <img
                            src={getS3Url(item.url)}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />

                          {item.isHidden && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold bg-black/60 backdrop-blur-xs text-white rounded-full border border-white/10 shadow-md z-10 select-none">
                              {t("Hidden")}
                            </span>
                          )}

                          {item.isGuest && (
                            <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 bg-black/40 text-white/90 rounded backdrop-blur-[2px] uppercase tracking-wider select-none z-10">
                              {lang === "ar" ? "ضيف" : "Guest"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })()}

      {/* ── Image Lightbox Popup Modal ──────────────────────────────── */}
      {selectedLightboxMoment && ((moment: string) => {
        const trackingPurchase = purchases.find((p) => p.invitation?.id === trackingInvitationId);
        const hostImages = trackingPurchase?.invitation?.images || [];
        const moments = trackingPurchase?.invitation?.moments || [];
        const hiddenMoments = trackingPurchase?.invitation?.hiddenMoments || [];
        const allFeedImages = [
          ...hostImages.map((url) => ({ url, isGuest: false, isHidden: false })),
          ...moments.map((url) => ({ url, isGuest: true, isHidden: false })),
          ...hiddenMoments.map((url) => ({ url, isGuest: true, isHidden: true })),
        ];
        const selectedItem = allFeedImages.find((item) => item.url === moment);
        const isGuest = selectedItem?.isGuest;
        const isHidden = selectedItem?.isHidden;
        const displayUrl = getS3Url(moment);

        return (
          <div
            className="fixed inset-0 bg-[#2D3142]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            onClick={() => setSelectedLightboxMoment(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center bg-black/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Left Controls */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                {isGuest && (
                  <button
                    onClick={() => handleToggleHideMoment(trackingInvitationId!, moment)}
                    className="flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-semibold text-white bg-black/40 hover:bg-black/70 hover:scale-105 transition-all cursor-pointer select-none"
                  >
                    {isHidden ? t("Show") : t("Hide")}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMoment(trackingInvitationId!, moment)}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-semibold text-white bg-black/40 hover:bg-black/70 hover:scale-105 transition-all cursor-pointer select-none"
                >
                  {lang === "ar" ? "حذف" : "Delete"}
                </button>
              </div>

              {/* Close Button Top Right */}
              <button
                onClick={() => setSelectedLightboxMoment(null)}
                className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/70 hover:scale-105 transition-all cursor-pointer p-2 rounded-full z-10"
                aria-label="Close preview"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Fullscreen Image */}
              <img
                src={displayUrl}
                alt="Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-xl select-none"
              />
            </div>
          </div>
        );
      })(selectedLightboxMoment)}

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
              editableFields={editingPurchase.template?.editableFields}
            />
          </div>
        </div>
      )}
    </div>
  );
}
