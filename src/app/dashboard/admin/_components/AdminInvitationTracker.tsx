"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { API_BASE_URL } from "@/lib/env";
import { getS3Url } from "@/lib/s3";
import { useLanguage } from "@/components/LanguageContext";
import { Modal, Button, Spinner } from "@/components/ui";
import type { RsvpListResponse, RsvpResponse, InvitationData } from "@/types/invitation";

interface AdminInvitationTrackerProps {
  slug?: string | null;
  invitationId?: string | null;
  title?: string;
  onClose: () => void;
}

// ── Metric Stat Card Sub-component ─────────────────────────────────────────
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "emerald" | "rose" | "amber" | "neutral";
}) {
  const styles = {
    emerald: "bg-emerald-50/60 border-emerald-200/80 text-emerald-800",
    rose: "bg-rose-50/60 border-rose-200/80 text-rose-800",
    amber: "bg-amber-50/60 border-amber-200/80 text-amber-800",
    neutral: "bg-[#FAF8F5] border-[#EBE7DF] text-neutral-800",
  };

  return (
    <div className={`rounded-2xl border p-4 transition-all shadow-2xs ${styles[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold font-serif leading-none">{value}</p>
    </div>
  );
}

export default function AdminInvitationTracker({
  slug,
  invitationId: initialInvitationId,
  title,
  onClose,
}: AdminInvitationTrackerProps) {
  const { lang, t } = useLanguage();
  const isRtl = lang === "ar";

  const [activeTab, setActiveTab] = useState<"rsvps" | "images">("rsvps");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invitation state
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [invitationId, setInvitationId] = useState<string | null>(initialInvitationId || null);

  // RSVPs state
  const [rsvpData, setRsvpData] = useState<RsvpListResponse | null>(null);
  const [selectedRsvp, setSelectedRsvp] = useState<RsvpResponse | null>(null);
  const [rsvpFilter, setRsvpFilter] = useState<"ALL" | "ATTENDING" | "EXCUSED" | "HIDDEN">("ALL");
  const [rsvpSearch, setRsvpSearch] = useState("");
  const [actionLoadingRsvpId, setActionLoadingRsvpId] = useState<string | null>(null);

  // Images state
  const [actionLoadingImg, setActionLoadingImg] = useState<string | null>(null);
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<{
    url: string;
    isGuest: boolean;
    isHidden: boolean;
  } | null>(null);

  // ── 1. Fetch Invitation Details ──────────────────────────────────────────
  const fetchInvitation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let targetInv: InvitationData | null = null;

      if (slug) {
        const cleanSlug = slug.replace(/^\/invite\//, "").replace(/^\//, "");
        const res = await api.get<InvitationData>(`/invitations/slug/${cleanSlug}`);
        targetInv = res.data;
      } else if (initialInvitationId) {
        const res = await api.get<InvitationData>(`/invitations/${initialInvitationId}`);
        targetInv = res.data;
      }

      if (!targetInv) {
        throw new Error(isRtl ? "تعذر العثور على الدعوة المطلوبة" : "Invitation not found");
      }

      setInvitation(targetInv);
      setInvitationId(targetInv.id);

      // ── 2. Fetch RSVPs for this invitation ────────────────────────────────
      if (targetInv.id) {
        const rsvpRes = await api.get<RsvpListResponse>(`/invitations/${targetInv.id}/rsvps`);
        setRsvpData(rsvpRes.data);
      }
    } catch (err: any) {
      console.error("Failed to load invitation tracking data:", err);
      setError(
        err?.response?.data?.message ||
          (isRtl ? "فشل في تحميل بيانات المتابعة للدعوة" : "Failed to load tracking data")
      );
    } finally {
      setLoading(false);
    }
  }, [slug, initialInvitationId, isRtl]);

  useEffect(() => {
    fetchInvitation();
  }, [fetchInvitation]);

  // Refresh RSVPs silently
  const refreshRsvps = async () => {
    if (!invitationId) return;
    try {
      const rsvpRes = await api.get<RsvpListResponse>(`/invitations/${invitationId}/rsvps`);
      setRsvpData(rsvpRes.data);
    } catch (err) {
      console.error("Failed to refresh RSVPs", err);
    }
  };

  // ── RSVP Actions ────────────────────────────────────────────────────────
  const handleToggleHideRsvp = async (rsvp: RsvpResponse, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoadingRsvpId(rsvp.id);
    try {
      await api.patch(`/rsvp/${rsvp.id}/toggle-hide`);
      if (selectedRsvp?.id === rsvp.id) {
        setSelectedRsvp((prev) => (prev ? { ...prev, isHidden: !prev.isHidden } : null));
      }
      await refreshRsvps();
    } catch (err) {
      console.error("Failed to toggle RSVP visibility", err);
      alert(isRtl ? "فشل تعديل حالة ظهور الرد" : "Failed to update RSVP visibility");
    } finally {
      setActionLoadingRsvpId(null);
    }
  };

  const handleDeleteRsvp = async (rsvp: RsvpResponse, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = confirm(
      isRtl
        ? `هل أنت متأكد من حذف رد (${rsvp.name})؟`
        : `Are you sure you want to delete RSVP response from (${rsvp.name})?`
    );
    if (!confirmed) return;

    setActionLoadingRsvpId(rsvp.id);
    try {
      await api.delete(`/rsvp/${rsvp.id}`);
      if (selectedRsvp?.id === rsvp.id) {
        setSelectedRsvp(null);
      }
      await refreshRsvps();
    } catch (err) {
      console.error("Failed to delete RSVP", err);
      alert(isRtl ? "فشل حذف الرد" : "Failed to delete RSVP");
    } finally {
      setActionLoadingRsvpId(null);
    }
  };

  // ── Image Moderation Actions ─────────────────────────────────────────────
  const handleToggleHideImage = async (
    url: string,
    isGuest: boolean,
    currentlyHidden: boolean
  ) => {
    if (!invitation || !invitationId) return;
    setActionLoadingImg(url);

    try {
      let updatedPayload: Record<string, any> = {};

      if (isGuest) {
        const currentMoments = invitation.moments || [];
        const currentHiddenMoments = invitation.hiddenMoments || [];

        if (currentlyHidden) {
          updatedPayload = {
            hiddenMoments: currentHiddenMoments.filter((u: string) => u !== url),
            moments: Array.from(new Set([...currentMoments, url])),
          };
        } else {
          updatedPayload = {
            moments: currentMoments.filter((u: string) => u !== url),
            hiddenMoments: Array.from(new Set([...currentHiddenMoments, url])),
          };
        }
      } else {
        const currentImages = invitation.images || [];
        const currentHiddenImages = invitation.hiddenImages || [];

        if (currentlyHidden) {
          updatedPayload = {
            hiddenImages: currentHiddenImages.filter((u: string) => u !== url),
            images: Array.from(new Set([...currentImages, url])),
          };
        } else {
          updatedPayload = {
            images: currentImages.filter((u: string) => u !== url),
            hiddenImages: Array.from(new Set([...currentHiddenImages, url])),
          };
        }
      }

      await api.put(`/invitations/${invitationId}`, updatedPayload);
      await fetchInvitation();
    } catch (err) {
      console.error("Failed to update image visibility", err);
      alert(isRtl ? "فشل تعديل حالة ظهور الصورة" : "Failed to update image visibility");
    } finally {
      setActionLoadingImg(null);
    }
  };

  const handleDeleteImage = async (url: string, isGuest: boolean) => {
    if (!invitation || !invitationId) return;
    const confirmed = confirm(
      isRtl
        ? "هل أنت متأكد من حذف هذه الصورة نهائياً؟"
        : "Are you sure you want to delete this photo permanently?"
    );
    if (!confirmed) return;

    setActionLoadingImg(url);
    try {
      let updatedPayload: Record<string, any> = {};

      if (isGuest) {
        const currentMoments = invitation.moments || [];
        const currentHiddenMoments = invitation.hiddenMoments || [];
        updatedPayload = {
          moments: currentMoments.filter((u: string) => u !== url),
          hiddenMoments: currentHiddenMoments.filter((u: string) => u !== url),
        };
      } else {
        const currentImages = invitation.images || [];
        const currentHiddenImages = invitation.hiddenImages || [];
        updatedPayload = {
          images: currentImages.filter((u: string) => u !== url),
          hiddenImages: currentHiddenImages.filter((u: string) => u !== url),
        };
      }

      await api.put(`/invitations/${invitationId}`, updatedPayload);
      await fetchInvitation();
    } catch (err) {
      console.error("Failed to delete image", err);
      alert(isRtl ? "فشل حذف الصورة" : "Failed to delete photo");
    } finally {
      setActionLoadingImg(null);
    }
  };

  const handleDownloadImage = async (url: string) => {
    const fullUrl = getS3Url(url);
    const filename = url.split("/").pop()?.split("?")[0] || "photo.jpg";
    const proxyUrl = `${API_BASE_URL}/invitations/download-file?url=${encodeURIComponent(fullUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Proxy download fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      console.warn("Direct blob download from proxy failed, falling back to direct anchor link:", err);
      const link = document.createElement("a");
      link.href = proxyUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ── Helper: Format companions ────────────
  const formatCompanions = (count: number) => {
    if (count === 0) return isRtl ? "بدون مرافقين" : "None";
    if (isRtl) {
      if (count === 1) return "مرافق واحد";
      if (count === 2) return "مرافقين اثنين";
      return `+${count} مرافقين`;
    }
    return `+${count} companion${count > 1 ? "s" : ""}`;
  };

  // ── Prepare image list ────────────────────
  const hostImages = invitation?.images || [];
  const hiddenImages = invitation?.hiddenImages || [];
  const guestMoments = invitation?.moments || [];
  const hiddenMoments = invitation?.hiddenMoments || [];

  const allImages = [
    ...hostImages.map((url: string) => ({ url, isGuest: false, isHidden: false })),
    ...hiddenImages.map((url: string) => ({ url, isGuest: false, isHidden: true })),
    ...guestMoments.map((url: string) => ({ url, isGuest: true, isHidden: false })),
    ...hiddenMoments.map((url: string) => ({ url, isGuest: true, isHidden: true })),
  ];

  // ── Filter RSVPs ──────────────────────────
  const filteredRsvps = (rsvpData?.rsvps || []).filter((r) => {
    if (rsvpFilter === "ATTENDING" && r.attendance !== "YES") return false;
    if (rsvpFilter === "EXCUSED" && r.attendance !== "NO") return false;
    if (rsvpFilter === "HIDDEN" && !r.isHidden) return false;

    if (rsvpSearch.trim()) {
      const q = rsvpSearch.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        (r.message && r.message.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      backdrop="dark"
      className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[32px] max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative font-sans"
      ariaLabel={title || (isRtl ? "متابعة الردود والصور" : "Track Invitation")}
    >
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
        {/* Header Bar (Matching Client Dashboard) */}
        <div
          className={`border-b border-[#F4F1EA] pb-4 flex justify-between items-start gap-4 ${
            isRtl ? "flex-row-reverse text-right" : "flex-row text-left"
          }`}
        >
          <div>
            <h2 className="text-xl font-serif font-semibold text-neutral-800">
              {isRtl ? "متابعة والتحكم" : "Track"} —{" "}
              <span className="text-[#B89C72]">
                {title || invitation?.eventTitle || (isRtl ? "الدعوة" : "Invitation")}
              </span>
            </h2>
            <p className="text-xs text-[#7F8487] mt-1">
              {isRtl
                ? "ردود الضيوف المباشرة والصور المرفوعة في المعرض واللحظات مع إمكانية التحكم والإخفاء أو الحذف."
                : "Live guest RSVPs and uploaded photos with moderation controls."}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            {invitation?.slug && (
              <a
                href={`/invite/${invitation.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E6E2DA] bg-white hover:bg-[#F4F1EA] text-[#2C2A29] text-xs font-semibold transition-colors shadow-2xs font-mono"
              >
                /invite/{invitation.slug} ↗
              </a>
            )}

            <Button variant="outline" size="sm" onClick={onClose} className="!rounded-xl text-xs">
              {isRtl ? "إغلاق" : "Close"}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <Spinner label={isRtl ? "جاري تحميل بيانات المتابعة..." : "Loading live tracking data..."} />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-3">
            <p className="text-xs font-semibold text-red-600">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchInvitation}>
              {isRtl ? "إعادة المحاولة" : "Retry"}
            </Button>
          </div>
        )}

        {/* Main Content Area */}
        {!loading && !error && (
          <div className="space-y-6">
            {/* Tabs Bar Header (Matching Client Dashboard) */}
            <div
              className={`flex border-b border-[#F4F1EA] gap-1 ${
                isRtl ? "flex-row-reverse" : "flex-row"
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
                {isRtl ? "الردود والتهاني (RSVPs)" : "Guest RSVPs"}
                {rsvpData?.rsvps?.length != null && (
                  <span className="mr-2 ml-2 px-2 py-0.5 text-[10px] font-mono font-bold bg-[#B89C72]/15 text-[#B89C72] rounded-full">
                    {rsvpData.rsvps.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("images")}
                className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-px cursor-pointer ${
                  activeTab === "images"
                    ? "border-[#B89C72] text-[#B89C72]"
                    : "border-transparent text-[#7F8487] hover:text-neutral-800"
                }`}
              >
                {isRtl ? "الصور واللحظات (Photos)" : "Photos & Moments"}
                {allImages.length > 0 && (
                  <span className="mr-2 ml-2 px-2 py-0.5 text-[10px] font-mono font-bold bg-[#B89C72]/15 text-[#B89C72] rounded-full">
                    {allImages.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: RSVPs */}
            {activeTab === "rsvps" && (
              <div className="space-y-6">
                {/* ── Stats Metric Cards ───────────────────────────────── */}
                {rsvpData?.statistics && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                      label={isRtl ? "إجمالي الردود" : "Total Responses"}
                      value={rsvpData.statistics.totalResponses}
                      color="neutral"
                    />
                    <StatCard
                      label={isRtl ? "الحضور المؤكد" : "Attending"}
                      value={rsvpData.statistics.totalAttending}
                      color="emerald"
                    />
                    <StatCard
                      label={isRtl ? "المعتذرون" : "Excused"}
                      value={rsvpData.statistics.totalExcused}
                      color="rose"
                    />
                    <StatCard
                      label={isRtl ? "المرافقون" : "Companions"}
                      value={rsvpData.statistics.totalCompanions}
                      color="amber"
                    />
                  </div>
                )}

                {/* Search & Filter Toolbar */}
                {rsvpData?.rsvps && rsvpData.rsvps.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl border border-[#EBE7DF] shadow-2xs">
                    <input
                      type="text"
                      value={rsvpSearch}
                      onChange={(e) => setRsvpSearch(e.target.value)}
                      placeholder={isRtl ? "ابحث باسم الضيف أو بالرسالة..." : "Search by guest name or wish message..."}
                      className="px-4 py-2 bg-[#FAF8F5] border border-[#EBE7DF] rounded-xl text-xs focus:outline-none focus:border-[#B89C72] w-full sm:w-64 font-sans"
                    />

                    <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#EBE7DF] text-xs self-end sm:self-auto">
                      {(["ALL", "ATTENDING", "EXCUSED", "HIDDEN"] as const).map((filterKey) => (
                        <button
                          key={filterKey}
                          onClick={() => setRsvpFilter(filterKey)}
                          className={`px-3 py-1 rounded-lg font-medium transition-all ${
                            rsvpFilter === filterKey
                              ? "bg-white text-neutral-800 shadow-2xs"
                              : "text-neutral-500 hover:text-neutral-800"
                          }`}
                        >
                          {filterKey === "ALL" && (isRtl ? "الكل" : "All")}
                          {filterKey === "ATTENDING" && (isRtl ? "حاضر" : "Attending")}
                          {filterKey === "EXCUSED" && (isRtl ? "معتذر" : "Excused")}
                          {filterKey === "HIDDEN" && (isRtl ? "مخفي" : "Hidden")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* RSVPs Table */}
                {!rsvpData || rsvpData.rsvps.length === 0 ? (
                  <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF8F5] p-10 text-center shadow-inner">
                    <p className="text-4xl block mb-2 select-none">📋</p>
                    <h4 className="font-bold text-sm text-neutral-800">
                      {isRtl ? "لا توجد ردود مسجلة بعد" : "No responses yet"}
                    </h4>
                    <p className="mt-1 text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                      {isRtl
                        ? "عندما يقدم أي ضيف رد حضور في هذه الدعوة، سيتظهر تفاصيله هنا."
                        : "When guests respond to this invitation, their RSVPs will appear here."}
                    </p>
                  </div>
                ) : filteredRsvps.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-[#EBE7DF] rounded-2xl text-neutral-400 text-xs">
                    {isRtl ? "لا توجد ردود مطابقة للبحث أو التصفية." : "No RSVPs match your search or filter."}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-[#EBE7DF] bg-white shadow-sm">
                    <div className="overflow-x-auto max-h-[400px]">
                      <table className="w-full text-xs border-collapse" dir={isRtl ? "rtl" : "ltr"}>
                        <thead className="bg-[#FAF8F5] border-b border-[#EBE7DF] text-neutral-500 font-semibold uppercase tracking-wider text-[10px] sticky top-0 z-10">
                          <tr>
                            <th className="px-5 py-3.5 text-start">{isRtl ? "اسم الضيف" : "Guest Name"}</th>
                            <th className="px-5 py-3.5 text-start">{isRtl ? "حالة الحضور" : "Status"}</th>
                            <th className="px-5 py-3.5 text-start">{isRtl ? "عدد المرافقين" : "Companions"}</th>
                            <th className="px-5 py-3.5 text-start">{isRtl ? "الرسالة والتهنئة" : "Message / Wish"}</th>
                            <th className="px-5 py-3.5 text-start">{isRtl ? "التاريخ" : "Date"}</th>
                            <th className="px-5 py-3.5 text-center">{isRtl ? "التحكم والإجراءات" : "Moderation"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#FAF1EA]">
                          {filteredRsvps.map((rsvp: RsvpResponse) => {
                            const isAttending = rsvp.attendance === "YES";
                            const isHidden = rsvp.isHidden;

                            return (
                              <tr
                                key={rsvp.id}
                                onClick={() => setSelectedRsvp(rsvp)}
                                className={`transition-colors hover:bg-[#FAF8F5] text-neutral-700 cursor-pointer ${
                                  isHidden ? "bg-amber-50/30" : ""
                                }`}
                              >
                                <td className="px-5 py-3.5 font-bold text-neutral-800 text-start">
                                  <div className="flex items-center gap-1.5">
                                    <span>{rsvp.name}</span>
                                    {isHidden && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
                                        {isRtl ? "مخفي" : "Hidden"}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="px-5 py-3.5 text-start">
                                  {isAttending ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                      {isRtl ? "حاضر" : "Attending"}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 border border-neutral-300 text-neutral-500">
                                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                                      {isRtl ? "معتذر" : "Declined"}
                                    </span>
                                  )}
                                </td>

                                <td className="px-5 py-3.5 font-medium text-neutral-500 text-start font-mono">
                                  {formatCompanions(rsvp.guestsCount)}
                                </td>

                                <td className="px-5 py-3.5 text-neutral-600 font-normal italic max-w-xs truncate text-start">
                                  {rsvp.message || "—"}
                                </td>

                                <td className="px-5 py-3.5 text-neutral-400 font-mono text-[11px] text-start whitespace-nowrap">
                                  {new Date(rsvp.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </td>

                                <td className="px-5 py-3.5 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={(e) => handleToggleHideRsvp(rsvp, e)}
                                      disabled={actionLoadingRsvpId === rsvp.id}
                                      className={`px-2.5 py-1 border rounded-xl text-[11px] font-semibold transition-all shadow-2xs cursor-pointer ${
                                        isHidden
                                          ? "bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-white hover:bg-amber-50 text-amber-700 border-amber-200"
                                      }`}
                                    >
                                      {isHidden
                                        ? isRtl
                                          ? "إظهار"
                                          : "Unhide"
                                        : isRtl
                                        ? "إخفاء"
                                        : "Hide"}
                                    </button>

                                    <button
                                      onClick={(e) => handleDeleteRsvp(rsvp, e)}
                                      disabled={actionLoadingRsvpId === rsvp.id}
                                      className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-[11px] font-semibold transition-all shadow-2xs cursor-pointer"
                                    >
                                      {isRtl ? "حذف" : "Delete"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Images & Moments */}
            {activeTab === "images" && (
              <div className="space-y-6">
                {allImages.length === 0 ? (
                  <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF8F5] p-10 text-center shadow-inner">
                    <p className="text-4xl block mb-2 select-none">📸</p>
                    <h4 className="font-bold text-sm text-neutral-800">
                      {isRtl ? "لا توجد صور مرفوعة بعد" : "No photos uploaded yet"}
                    </h4>
                    <p className="mt-1 text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                      {isRtl
                        ? "الصور المرفوعة في معرض القالب أو الملتقطة من قِبل الضيوف ستظهر هنا."
                        : "Photos uploaded by the host or captured by guests in moments will appear here."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[460px] overflow-y-auto p-1">
                    {allImages.map((item, index) => {
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedLightboxItem(item)}
                          className={`relative aspect-square overflow-hidden shadow-md group transition-all duration-300 rounded-[22px] cursor-pointer ${
                            item.isHidden ? "opacity-65 border-2 border-dashed border-amber-400" : ""
                          }`}
                          style={{
                            background: "rgba(255, 255, 255, 0.55)",
                            backdropFilter: "blur(12px)",
                            border: item.isHidden ? undefined : "1px solid rgba(0, 0, 0, 0.08)",
                          }}
                        >
                          {/* Image Thumbnail */}
                          <img
                            src={getS3Url(item.url)}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                          />

                          {/* Top Badges */}
                          <div className="absolute top-2 inset-x-2 flex justify-between items-center z-10 pointer-events-none">
                            {item.isGuest ? (
                              <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-900/80 text-purple-100 rounded-full backdrop-blur-md uppercase tracking-wider shadow-xs">
                                {isRtl ? "ضيف" : "Guest"}
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-2 py-0.5 bg-black/60 text-white/90 rounded-full backdrop-blur-md uppercase tracking-wider shadow-xs">
                                {isRtl ? "المضيف" : "Host"}
                              </span>
                            )}

                            {item.isHidden && (
                              <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-600 text-white rounded-full border border-white/20 shadow-md">
                                {isRtl ? "مخفي" : "Hidden"}
                              </span>
                            )}
                          </div>

                          {/* Subtle Hover Zoom Overlay */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20 backdrop-blur-[2px]">
                            <span className="p-2.5 rounded-full bg-black/60 text-white shadow-lg transform group-hover:scale-110 transition-transform">
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                              </svg>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── RSVP Details Modal Overlay ─────────────────────────────── */}
      {selectedRsvp && (
        <div
          className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl relative font-sans"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedRsvp(null)}
              className={`absolute top-6 ${isRtl ? "left-6" : "right-6"} text-[#7F8487] hover:text-neutral-900 transition-colors cursor-pointer p-1 rounded-full hover:bg-neutral-100/55`}
              aria-label={isRtl ? "إغلاق" : "Close"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className={`border-b border-[#F4F1EA] pb-4 mb-5 ${isRtl ? "text-right" : "text-left"}`}>
              <h3 className="text-lg font-serif font-semibold text-neutral-800">
                {isRtl ? "تفاصيل الرد" : "RSVP Details"}
              </h3>
            </div>

            {/* Content Details Grid */}
            <div className="space-y-4">
              {/* Guest Name */}
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  {isRtl ? "اسم الضيف" : "Guest Name"}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base font-semibold text-neutral-800">
                    {selectedRsvp.name}
                  </p>
                  {selectedRsvp.isHidden && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                      {isRtl ? "مخفي عن الضيوف" : "Hidden"}
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Companions Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    {isRtl ? "حالة الحضور" : "Status"}
                  </span>
                  <div className="mt-1">
                    {selectedRsvp.attendance === "YES" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {isRtl ? "حاضر" : "Attending"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 border border-neutral-300 text-neutral-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                        {isRtl ? "معتذر" : "Declined"}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    {isRtl ? "عدد المرافقين" : "Companions"}
                  </span>
                  <p className="text-xs font-semibold text-neutral-700 mt-1">
                    {formatCompanions(selectedRsvp.guestsCount)}
                  </p>
                </div>
              </div>

              {/* Message / Wish */}
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  {isRtl ? "الرسالة والتهنئة" : "Message / Wish"}
                </span>
                <p className="text-xs text-neutral-700 mt-1 p-3 bg-[#FAF9F6] border border-[#EBE7DF] rounded-xl leading-relaxed whitespace-pre-wrap">
                  {selectedRsvp.message || (isRtl ? "لا توجد رسالة مرفقة" : "No message provided")}
                </p>
              </div>

              {/* Date */}
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  {isRtl ? "تاريخ الرد" : "Date Responded"}
                </span>
                <p className="text-xs font-mono text-neutral-500 mt-0.5">
                  {new Date(selectedRsvp.createdAt).toLocaleString(isRtl ? "ar-EG" : "en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex justify-between items-center gap-3 pt-6 border-t border-[#F4F1EA] mt-6">
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleToggleHideRsvp(selectedRsvp, e)}
                  disabled={actionLoadingRsvpId === selectedRsvp.id}
                  className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRsvp.isHidden
                      ? "bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-white hover:bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {selectedRsvp.isHidden
                    ? isRtl
                      ? "إظهار للعميل والضيوف"
                      : "Unhide from Guests"
                    : isRtl
                    ? "إخفاء عن الضيوف"
                    : "Hide from Guests"}
                </button>

                <button
                  onClick={(e) => handleDeleteRsvp(selectedRsvp, e)}
                  disabled={actionLoadingRsvpId === selectedRsvp.id}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isRtl ? "حذف الرد" : "Delete Response"}
                </button>
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedRsvp(null)} className="!rounded-xl text-xs">
                {isRtl ? "إغلاق" : "Close"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Lightbox Modal Matching User Design ────────────────── */}
      {selectedLightboxItem && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLightboxItem(null)}
          backdrop="dark"
          className="bg-[#12141A] p-0 rounded-[28px] max-w-4xl w-full flex flex-col items-center justify-center relative shadow-2xl overflow-hidden font-sans border border-white/10"
        >
          <div className="relative w-full min-h-[460px] max-h-[82vh] flex items-center justify-center bg-[#0C0E12] p-6 sm:p-8">
            {/* Top Floating Controls Bar */}
            <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-30 pointer-events-auto">
              {/* Top-Left Action Pills: Show/Hide, Delete, Download */}
              <div className="flex items-center gap-2.5">
                {/* Show / Hide Pill */}
                <button
                  onClick={async () => {
                    const item = selectedLightboxItem;
                    await handleToggleHideImage(item.url, item.isGuest, item.isHidden);
                    setSelectedLightboxItem((prev) =>
                      prev ? { ...prev, isHidden: !prev.isHidden } : null
                    );
                  }}
                  disabled={actionLoadingImg === selectedLightboxItem.url}
                  className="px-4 py-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {selectedLightboxItem.isHidden
                    ? isRtl
                      ? "Show"
                      : "Show"
                    : isRtl
                    ? "Hide"
                    : "Hide"}
                </button>

                {/* Delete Pill */}
                <button
                  onClick={async () => {
                    const item = selectedLightboxItem;
                    setSelectedLightboxItem(null);
                    await handleDeleteImage(item.url, item.isGuest);
                  }}
                  disabled={actionLoadingImg === selectedLightboxItem.url}
                  className="px-4 py-1.5 rounded-full bg-black/60 hover:bg-rose-900/80 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  Delete
                </button>

                {/* Download Pill */}
                <button
                  onClick={() => handleDownloadImage(selectedLightboxItem.url)}
                  className="px-4 py-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Download
                </button>
              </div>

              {/* Top-Right Close Button (X) */}
              <button
                onClick={() => setSelectedLightboxItem(null)}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-sm font-bold transition-all border border-white/20 shadow-lg cursor-pointer"
                aria-label={isRtl ? "إغلاق" : "Close"}
              >
                ✕
              </button>
            </div>

            {/* Main Image */}
            <img
              src={getS3Url(selectedLightboxItem.url)}
              alt=""
              className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl mt-6"
            />
          </div>
        </Modal>
      )}
    </Modal>
  );
}
