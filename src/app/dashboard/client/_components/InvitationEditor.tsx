"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import type { InvitationData, PurchaseInvitation, EventProgramItem, EventDetailItem } from "@/types/invitation";
import type { AxiosError } from "axios";

interface InvitationEditorProps {
  purchaseId: string;
  invitation: InvitationData | PurchaseInvitation | null; // Supports both data models
  templateTitle: string;
  onSaved: (updatedInv?: any) => void;
  editableFields?: any;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

// ── Helper: format HH:mm to Arabic time string like "8:30 م" ──────
function formatTimeToArabic(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const period = h >= 12 ? "م" : "ص";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
}

export default function InvitationEditor({
  purchaseId,
  invitation,
  templateTitle,
  onSaved,
  editableFields,
}: InvitationEditorProps) {
  const { lang, t } = useLanguage();
  const isRtl = lang === "ar";
  const isEditing = !!invitation;

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user && user.role === "ADMIN") {
            setIsAdmin(true);
          }
        } catch { }
      }
    }
  }, []);

  const isFieldEditable = (fieldKey: string) => {
    if (isAdmin) return true;

    // Core fields should ALWAYS be editable by the client
    if (
      fieldKey === "groomName" ||
      fieldKey === "brideName" ||
      fieldKey === "eventDate" ||
      fieldKey === "eventLocation"
    ) {
      return true;
    }

    if (!editableFields) return true;

    // Check if the template has any of the newer customizable fields configured
    const hasNewFields = Object.keys(editableFields).some((key) =>
      [
        "locationUrl",
        "welcomeText",
        "musicUrl",
        "images",
        "eventProgram",
        "eventDetails",
      ].includes(key)
    );

    // If it's a legacy or seeded template that doesn't have any of the newer fields defined,
    // default all new customizable fields to true so they are editable.
    if (!hasNewFields) {
      return true;
    }

    return !!editableFields[fieldKey];
  };

  // ── Parse initial Groom & Bride names from eventTitle ───────────────
  const parseCoupleNames = (title: string) => {
    if (!title) return { groom: "", bride: "" };
    if (title.includes(" & ")) {
      const parts = title.split(" & ");
      return { groom: parts[0]?.trim() || "", bride: parts[1]?.trim() || "" };
    }
    if (title.includes(" و ")) {
      const parts = title.split(" و ");
      const groomPart = parts[0]?.replace("حفل زفاف", "")?.trim() || "";
      return { groom: groomPart, bride: parts[1]?.trim() || "" };
    }
    return { groom: title, bride: "" };
  };

  const [languageMode, setLanguageMode] = useState<string>(invitation?.languageMode || "both");
  const [editingLang, setEditingLang] = useState<"ar" | "en">("ar");

  const getInitialNamesAr = () => {
    if (invitation?.eventTitleAr) {
      return parseCoupleNames(invitation.eventTitleAr);
    }
    if (invitation?.eventTitle && /[\u0600-\u06FF]/.test(invitation.eventTitle)) {
      return parseCoupleNames(invitation.eventTitle);
    }
    return { groom: "", bride: "" };
  };

  const getInitialNamesEn = () => {
    if (invitation?.eventTitleEn) {
      return parseCoupleNames(invitation.eventTitleEn);
    }
    if (invitation?.eventTitle && !/[\u0600-\u06FF]/.test(invitation.eventTitle)) {
      return parseCoupleNames(invitation.eventTitle);
    }
    return { groom: "", bride: "" };
  };

  const initNamesAr = getInitialNamesAr();
  const initNamesEn = getInitialNamesEn();

  // ── Form State ──────────────────────────────────────────────────────
  const [groomNameAr, setGroomNameAr] = useState(initNamesAr.groom);
  const [groomNameEn, setGroomNameEn] = useState(initNamesEn.groom);
  const [brideNameAr, setBrideNameAr] = useState(initNamesAr.bride);
  const [brideNameEn, setBrideNameEn] = useState(initNamesEn.bride);
  const [slug, setSlug] = useState(invitation?.slug || "");
  const [eventDate, setEventDate] = useState(() => {
    if (invitation?.eventDate) {
      return invitation.eventDate.slice(0, 16);
    }
    return "";
  });
  const [eventLocationAr, setEventLocationAr] = useState(invitation?.eventLocationAr || (invitation?.eventLocation && /[\u0600-\u06FF]/.test(invitation.eventLocation) ? invitation.eventLocation : ""));
  const [eventLocationEn, setEventLocationEn] = useState(invitation?.eventLocationEn || (invitation?.eventLocation && !/[\u0600-\u06FF]/.test(invitation.eventLocation) ? invitation.eventLocation : ""));
  const [locationUrl, setLocationUrl] = useState(invitation?.locationUrl || "");
  const [welcomeTextAr, setWelcomeTextAr] = useState(invitation?.welcomeTextAr || (invitation?.welcomeText && /[\u0600-\u06FF]/.test(invitation.welcomeText) ? invitation.welcomeText : ""));
  const [welcomeTextEn, setWelcomeTextEn] = useState(invitation?.welcomeTextEn || (invitation?.welcomeText && !/[\u0600-\u06FF]/.test(invitation.welcomeText) ? invitation.welcomeText : ""));
  const [images, setImages] = useState<string[]>(
    invitation?.images?.length ? invitation.images : []
  );
  const [musicUrl, setMusicUrl] = useState(invitation?.musicUrl || "");

  // ── New Fields for WhatsApp & Moments settings ──
  const [contactName, setContactName] = useState(invitation?.contactName || "");
  const [contactPhone, setContactPhone] = useState(invitation?.contactPhone || "");
  const [allowGuestUploads, setAllowGuestUploads] = useState<boolean>(
    invitation?.allowGuestUploads !== false
  );
  const [showMoments, setShowMoments] = useState<boolean>(
    invitation?.showMoments !== false
  );
  const [allowCompanions, setAllowCompanions] = useState<boolean>(
    invitation?.allowCompanions !== false
  );

  useEffect(() => {
    if (invitation) {
      setAllowGuestUploads(invitation.allowGuestUploads !== false);
      setShowMoments(invitation.showMoments !== false);
      setAllowCompanions(invitation.allowCompanions !== false);
      setContactName(invitation.contactName || "");
      setContactPhone(invitation.contactPhone || "");
    }
  }, [invitation]);

  // Upload loaders
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isAudioUploading, setIsAudioUploading] = useState(false);

  // ── Event Program (Timeline) State ──────────────────────────────────
  const [eventProgram, setEventProgram] = useState<{ time: string; titleAr: string; titleEn: string }[]>(() => {
    if (invitation?.eventProgram?.length) {
      return invitation.eventProgram.map((p: EventProgramItem) => ({
        time: p.time || "",
        titleAr: p.titleAr || p.title || "",
        titleEn: p.titleEn || p.title || "",
      }));
    }
    return [{ time: "", titleAr: "", titleEn: "" }];
  });

  // ── Event Details State ─────────────────────────────────────────────
  const [eventDetails, setEventDetails] = useState<{ textAr: string; textEn: string }[]>(() => {
    if (invitation?.eventDetails?.length) {
      return invitation.eventDetails.map((d: EventDetailItem) => ({
        textAr: d.textAr || d.text || "",
        textEn: d.textEn || d.text || "",
      }));
    }
    return [{ textAr: "", textEn: "" }];
  });

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const urlParam = invitation?.id ? `?invitationId=${invitation.id}` : "";
      const res = await api.post<{ url: string }>(`/upload${urlParam}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setImages(prev => [...prev.filter(url => url.trim() !== ""), res.data.url]);
    } catch (err) {
      console.error(err);
      alert(isRtl ? "فشل رفع الصورة." : "Image upload failed.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAudioUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const urlParam = invitation?.id ? `?invitationId=${invitation.id}` : "";
      const res = await api.post<{ url: string }>(`/upload${urlParam}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMusicUrl(res.data.url);
    } catch (err) {
      console.error(err);
      alert(isRtl ? "فشل رفع الملف الصوتي." : "Audio upload failed.");
    } finally {
      setIsAudioUploading(false);
    }
  };

  const removeImageField = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // ── Manage Dynamic Event Program ─────────────────────────────────────
  const addProgramItem = () => setEventProgram([...eventProgram, { time: "", titleAr: "", titleEn: "" }]);
  const removeProgramItem = (index: number) => {
    if (eventProgram.length <= 1) return;
    setEventProgram(eventProgram.filter((_, i) => i !== index));
  };
  const updateProgramItem = (index: number, field: "time" | "titleAr" | "titleEn", value: string) => {
    const updated = [...eventProgram];
    updated[index] = { ...updated[index], [field]: value };
    setEventProgram(updated);
  };

  // ── Manage Dynamic Event Details ──────────────────────────────────────
  const addDetailItem = () => setEventDetails([...eventDetails, { textAr: "", textEn: "" }]);
  const removeDetailItem = (index: number) => {
    if (eventDetails.length <= 1) return;
    setEventDetails(eventDetails.filter((_, i) => i !== index));
  };
  const updateDetailItem = (index: number, field: "textAr" | "textEn", value: string) => {
    const updated = [...eventDetails];
    updated[index] = { ...updated[index], [field]: value };
    setEventDetails(updated);
  };

  // ── Submit handlers ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const filteredImages = images.filter((url) => url.trim() !== "");

    const titleAr = `${groomNameAr.trim()} و ${brideNameAr.trim()}`;
    const titleEn = `${groomNameEn.trim()} & ${brideNameEn.trim()}`;
    const generatedTitle = languageMode === "en" ? titleEn : titleAr;

    // ── Build event program: if user left everything empty, auto-fill defaults ──
    let finalProgram = eventProgram.filter((p) => p.time.trim() !== "" || p.titleAr.trim() !== "" || p.titleEn.trim() !== "");

    if (finalProgram.length === 0 && eventDate) {
      const eventTime = eventDate.split("T")[1] || "20:00";
      const formattedTime = formatTimeToArabic(eventTime);
      finalProgram = [
        { time: formattedTime, titleAr: "بداية الحفل", titleEn: "Party start" },
      ];
    }

    // Convert time inputs (HH:mm) to Arabic formatted strings
    finalProgram = finalProgram.map((p) => ({
      time: p.time.includes(":") && !p.time.includes(" ") ? formatTimeToArabic(p.time) : p.time,
      titleAr: p.titleAr,
      titleEn: p.titleEn,
    }));

    const filteredDetails = eventDetails.filter((d) => d.textAr.trim() !== "" || d.textEn.trim() !== "");

    const payload = {
      slug: slug.trim(),
      languageMode,
      eventTitle: generatedTitle,
      eventTitleAr: titleAr,
      eventTitleEn: titleEn,
      eventDate: new Date(eventDate).toISOString(),
      eventLocation: languageMode === "en" ? eventLocationEn.trim() : eventLocationAr.trim(),
      eventLocationAr: eventLocationAr.trim(),
      eventLocationEn: eventLocationEn.trim(),
      locationUrl: locationUrl.trim() || undefined,
      welcomeText: languageMode === "en" ? welcomeTextEn.trim() : welcomeTextAr.trim(),
      welcomeTextAr: welcomeTextAr.trim(),
      welcomeTextEn: welcomeTextEn.trim(),
      images: filteredImages,
      musicUrl: musicUrl.trim() || undefined,
      eventProgram: finalProgram,
      eventDetails: filteredDetails,
      contactName: contactName.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      allowGuestUploads,
      showMoments,
      allowCompanions,
    };

    try {
      let savedData: any = null;
      if (isEditing) {
        const res = await api.put(`/invitations/${invitation.id}`, payload);
        savedData = res.data;
      } else {
        const res = await api.post("/invitations", {
          ...payload,
          purchaseId,
        });
        savedData = res.data;
      }

      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        onSaved(savedData);
      }, 1000);
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      setStatus("error");
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setErrorMsg(t("Save failed"));
      }
    }
  };

  // Input styles
  const inputClass =
    "w-full bg-white border border-[#E6E2DA] rounded-full px-5 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-neutral-800 placeholder-neutral-400";
  const labelClass =
    "mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-sans";
  const removeBtnClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 transition-colors text-neutral-400 cursor-pointer shadow-xs";
  const addBtnClass =
    "mt-2 text-[10px] font-bold text-[#B89C72] hover:text-[#A3875D] transition-colors tracking-wider";

  const handleLanguageModeChange = (val: string) => {
    setLanguageMode(val);
    if (val === "ar") setEditingLang("ar");
    else if (val === "en") setEditingLang("en");
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mazoomen-backend.onrender.com';

  return (
    <form onSubmit={handleSubmit} className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      {/* Title */}
      <div className="border-b border-[#F4F1EA] pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-serif font-medium text-neutral-800">
            {isEditing ? t("Edit Invitation Details") : t("Create New Invitation")}
          </h2>
          <p className="text-[11px] text-neutral-400 mt-1">{t("Template:")} {templateTitle}</p>
        </div>

        {/* Language switcher dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{t("Language")}</label>
          <select
            value={languageMode}
            onChange={(e) => handleLanguageModeChange(e.target.value)}
            disabled={status === "saving"}
            className="bg-white border border-[#E6E2DA] rounded-xl px-3 py-1.5 text-[11px] outline-none text-neutral-800 focus:border-black font-sans font-semibold cursor-pointer"
          >
            <option value="both">{t("Arabic & English")}</option>
            <option value="ar">{t("Arabic Only")}</option>
            <option value="en">{t("English Only")}</option>
          </select>
        </div>
      </div>

      {/* Language switcher toggle circles (when bilingual) */}
      {languageMode === "both" && (
        <div className={`flex ${isRtl ? "justify-start" : "justify-end"} mb-2`}>
          <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E6E2DA] rounded-full shadow-xs">
            <button
              type="button"
              onClick={() => setEditingLang("ar")}
              className={`w-9 h-9 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${editingLang === "ar"
                  ? "bg-[#0B1528] text-[#E5C38B]"
                  : "text-neutral-500 hover:text-black"
                }`}
            >
              AR
            </button>
            <button
              type="button"
              onClick={() => setEditingLang("en")}
              className={`w-9 h-9 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${editingLang === "en"
                  ? "bg-[#0B1528] text-[#E5C38B]"
                  : "text-neutral-500 hover:text-black"
                }`}
            >
              EN
            </button>
          </div>
        </div>
      )}

      {/* Groom & Bride Names Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {editingLang === "ar" ? `${t("Groom's Name")} (${t("Arabic")})` : `${t("Groom's Name")} (${t("English")})`}
          </label>
          <input
            type="text"
            value={editingLang === "ar" ? groomNameAr : groomNameEn}
            onChange={(e) => editingLang === "ar" ? setGroomNameAr(e.target.value) : setGroomNameEn(e.target.value)}
            placeholder={editingLang === "ar" ? "مثال: أحمد" : "e.g. Ahmed"}
            required
            disabled={status === "saving" || !isFieldEditable("groomName")}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            {editingLang === "ar" ? `${t("Bride's Name")} (${t("Arabic")})` : `${t("Bride's Name")} (${t("English")})`}
          </label>
          <input
            type="text"
            value={editingLang === "ar" ? brideNameAr : brideNameEn}
            onChange={(e) => editingLang === "ar" ? setBrideNameAr(e.target.value) : setBrideNameEn(e.target.value)}
            placeholder={editingLang === "ar" ? "مثال: سارة" : "e.g. Sarah"}
            required
            disabled={status === "saving" || !isFieldEditable("brideName")}
            className={inputClass}
          />
        </div>
      </div>

      {/* URL Link Slug */}
      <div>
        <label className={labelClass}>{t("Custom Invite Link")}</label>
        <div className="flex items-stretch shadow-sm rounded-full overflow-hidden border border-[#E6E2DA]" dir="ltr">
          <span className="flex items-center bg-[#FAF8F5] border-r border-[#E6E2DA] pl-5 pr-3 text-[11px] text-neutral-400 font-semibold select-none">
            /invite/
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) =>
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "")
              )
            }
            placeholder="ahmed-and-sarah"
            required
            disabled={status === "saving"}
            className="w-full bg-white px-5 py-2.5 text-xs outline-none focus:border-black transition-all text-neutral-800 placeholder-neutral-400"
          />
        </div>
        <p className="mt-1.5 text-[9px] text-neutral-400 leading-normal font-sans">
          {t("Slug hint")}
        </p>
      </div>

      {/* Event Date & Time */}
      <div>
        <label className={labelClass}>{t("Event Date & Time")}</label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
          disabled={status === "saving" || !isFieldEditable("eventDate")}
          className={inputClass}
          dir="ltr"
        />
      </div>

      {/* Event Location Venue */}
      <div>
        <label className={labelClass}>
          {editingLang === "ar" ? `${t("Event Location (Hall Name)")} (${t("Arabic")})` : `${t("Event Location (Hall Name)")} (${t("English")})`}
        </label>
        <input
          type="text"
          value={editingLang === "ar" ? eventLocationAr : eventLocationEn}
          onChange={(e) => editingLang === "ar" ? setEventLocationAr(e.target.value) : setEventLocationEn(e.target.value)}
          placeholder={editingLang === "ar" ? "مثال: قاعة السمو، الرياض" : "e.g. Royal Hall, Riyadh"}
          required
          disabled={status === "saving" || !isFieldEditable("eventLocation")}
          className={inputClass}
        />
      </div>

      {/* Google Maps Venue Link */}
      <div>
        <label className={labelClass}>{t("Google Maps URL")}</label>
        <input
          type="url"
          value={locationUrl}
          onChange={(e) => setLocationUrl(e.target.value)}
          placeholder="https://maps.google.com/?q=..."
          required
          disabled={status === "saving" || !isFieldEditable("locationUrl")}
          className={inputClass}
          dir="ltr"
        />
      </div>

      {/* Welcome / Invitation Message */}
      <div>
        <label className={labelClass}>
          {editingLang === "ar" ? `${t("Welcome Invitation Message")} (${t("Arabic")})` : `${t("Welcome Invitation Message")} (${t("English")})`}
        </label>
        <textarea
          value={editingLang === "ar" ? welcomeTextAr : welcomeTextEn}
          onChange={(e) => editingLang === "ar" ? setWelcomeTextAr(e.target.value) : setWelcomeTextEn(e.target.value)}
          placeholder={editingLang === "ar" ? "اكتب رسالة الترحيب والبطاقة باللغة العربية..." : "Write your welcome message in English..."}
          required
          rows={3}
          disabled={status === "saving" || !isFieldEditable("welcomeText")}
          className="w-full bg-white border border-[#E6E2DA] rounded-2xl px-5 py-3 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-neutral-800 placeholder-neutral-400 resize-none"
        />
      </div>

      {/* Background Sound Music URL & File Upload */}
      <div>
        <label className={labelClass}>{isRtl ? "موسيقى الخلفية (رابط يوتيوب أو ملف صوتي)" : "Background Music (YouTube Link or Audio File)"}</label>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={musicUrl}
            onChange={(e) => setMusicUrl(e.target.value)}
            placeholder={isRtl ? "رابط يوتيوب أو ملف صوتي" : "https://youtube.com/watch?v=... or audio URL"}
            disabled={status === "saving" || isAudioUploading || !isFieldEditable("musicUrl")}
            className={inputClass}
            dir="ltr"
          />
          <label className={`flex items-center gap-1.5 h-10 px-4 rounded-full border border-[#E6E2DA] bg-[#FAF8F5] text-xs shrink-0 select-none text-neutral-600 font-sans font-semibold transition-colors ${(status === "saving" || isAudioUploading || !isFieldEditable("musicUrl"))
              ? "opacity-50 pointer-events-none cursor-not-allowed"
              : "hover:bg-neutral-50 cursor-pointer"
            }`}>
            <span>{isAudioUploading ? (isRtl ? "جاري الرفع..." : "Uploading...") : (isRtl ? "رفع ملف" : "Upload File")}</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
              disabled={status === "saving" || isAudioUploading || !isFieldEditable("musicUrl")}
            />
          </label>
        </div>
      </div>

      {/* Dynamic Image Photo Gallery Uploader */}
      <div>
        <label className={labelClass}>{isRtl ? "صور معرض بطاقة الدعوة" : "Invitation Gallery Photos"}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
          {images.filter(url => url.trim() !== "").map((url, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-neutral-200 relative group bg-white flex items-center justify-center">
              <img src={url.startsWith('/public') ? baseUrl + url : url} alt="Gallery thumbnail" className="w-full h-full object-cover" />
              {isFieldEditable("images") && (
                <button
                  type="button"
                  onClick={() => removeImageField(i)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Upload Card button */}
          <label className={`aspect-square rounded-2xl border border-dashed border-neutral-300 flex flex-col items-center justify-center transition-colors bg-[#FAF8F5] text-neutral-400 select-none ${(status === "saving" || isImageUploading || !isFieldEditable("images"))
              ? "opacity-50 pointer-events-none cursor-not-allowed"
              : "hover:border-black cursor-pointer"
            }`}>
            <span className="text-xl font-light">{isImageUploading ? "..." : "+"}</span>
            <span className="text-[10px] mt-1 font-semibold font-sans">{isImageUploading ? (isRtl ? "رفع..." : "Uploading...") : (isRtl ? "رفع صورة" : "Upload Photo")}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={status === "saving" || isImageUploading || !isFieldEditable("images")}
            />
          </label>
        </div>
      </div>

      {/* WhatsApp Contact & Guest Upload Permissions Section */}
      <div className="border-t border-[#F4F1EA] pt-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 font-sans">
          {isRtl ? "إعدادات التواصل وصور الضيوف" : "WhatsApp Contact & Guest Permissions"}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              {isRtl ? "اسم مسؤول التواصل (مثل: أخو العريس)" : "Contact Person Name (e.g. Groom's Brother)"}
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder={isRtl ? "مثال: أخو العريس" : "e.g. Groom's Brother"}
              disabled={status === "saving"}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              {isRtl ? "رقم جوال واتساب (مع رمز الدولة)" : "WhatsApp Phone Number (with country code)"}
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. +966500000001"
              disabled={status === "saving"}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            id="allow-guest-uploads"
            type="checkbox"
            checked={allowGuestUploads}
            onChange={(e) => setAllowGuestUploads(e.target.checked)}
            disabled={status === "saving"}
            className="w-4.5 h-4.5 rounded border-neutral-300 text-black focus:ring-black accent-black cursor-pointer"
          />
          <label htmlFor="allow-guest-uploads" className="text-xs font-semibold text-neutral-700 cursor-pointer select-none font-sans">
            {isRtl ? "السماح للضيوف بالتقاط ورفع الصور في قسم اللحظات" : "Allow guests to capture and upload photos in the Moments section"}
          </label>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            id="show-moments"
            type="checkbox"
            checked={showMoments}
            onChange={(e) => setShowMoments(e.target.checked)}
            disabled={status === "saving"}
            className="w-4.5 h-4.5 rounded border-neutral-300 text-black focus:ring-black accent-black cursor-pointer"
          />
          <label htmlFor="show-moments" className="text-xs font-semibold text-neutral-700 cursor-pointer select-none font-sans">
            {isRtl ? "إظهار ألبوم صور الضيوف للزوار" : "Show guest photos album to guests"}
          </label>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            id="allow-companions"
            type="checkbox"
            checked={allowCompanions}
            onChange={(e) => setAllowCompanions(e.target.checked)}
            disabled={status === "saving"}
            className="w-4.5 h-4.5 rounded border-neutral-300 text-black focus:ring-black accent-black cursor-pointer"
          />
          <label htmlFor="allow-companions" className="text-xs font-semibold text-neutral-700 cursor-pointer select-none font-sans">
            {isRtl ? "إظهار دفتر التهاني والتبريكات للضيوف" : "Show Congratulations Album to guests"}
          </label>
        </div>
      </div>

      {/* Event Program (Timeline) */}
      <div className="border-t border-[#F4F1EA] pt-4">
        <label className={labelClass}>{t("Event Program (Optional)")}</label>
        <p className="mb-2 text-[9px] text-neutral-400 leading-normal font-sans">
          {t("Program hint")}
        </p>
        <div className={`space-y-2 max-h-48 overflow-y-auto ${isRtl ? "pl-1" : "pr-1"}`}>
          {eventProgram.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-[130px] shrink-0">
                <input
                  type="time"
                  value={item.time}
                  onChange={(e) => updateProgramItem(i, "time", e.target.value)}
                  disabled={status === "saving" || !isFieldEditable("eventProgram")}
                  className={`${inputClass} text-center`}
                  dir="ltr"
                />
              </div>
              <input
                type="text"
                value={editingLang === "ar" ? item.titleAr : item.titleEn}
                onChange={(e) => updateProgramItem(i, editingLang === "ar" ? "titleAr" : "titleEn", e.target.value)}
                placeholder={editingLang === "ar" ? "مثال: استقبال الضيوف" : "e.g. Reception"}
                disabled={status === "saving" || !isFieldEditable("eventProgram")}
                className={inputClass}
              />
              {isFieldEditable("eventProgram") && eventProgram.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProgramItem(i)}
                  className={removeBtnClass}
                  aria-label={t("Remove")}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {isFieldEditable("eventProgram") && (
          <button
            type="button"
            onClick={addProgramItem}
            disabled={status === "saving"}
            className={addBtnClass}
          >
            {t("+ Add another item")}
          </button>
        )}
      </div>

      {/* Event Details / Guidelines */}
      <div>
        <label className={labelClass}>{t("Event Details (Optional)")}</label>
        <p className="mb-2 text-[9px] text-neutral-400 leading-normal font-sans">
          {t("Details hint")}
        </p>
        <div className={`space-y-2 max-h-36 overflow-y-auto ${isRtl ? "pl-1" : "pr-1"}`}>
          {eventDetails.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={editingLang === "ar" ? item.textAr : item.textEn}
                onChange={(e) => updateDetailItem(i, editingLang === "ar" ? "textAr" : "textEn", e.target.value)}
                placeholder={editingLang === "ar" ? "مثال: الدخول عبر رمز QR" : "e.g. QR entry only"}
                disabled={status === "saving" || !isFieldEditable("eventDetails")}
                className={inputClass}
              />
              {isFieldEditable("eventDetails") && eventDetails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDetailItem(i)}
                  className={removeBtnClass}
                  aria-label={t("Remove")}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {isFieldEditable("eventDetails") && (
          <button
            type="button"
            onClick={addDetailItem}
            disabled={status === "saving"}
            className={addBtnClass}
          >
            {t("+ Add another detail")}
          </button>
        )}
      </div>

      {/* Save Status & Error Messages */}
      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {errorMsg}
        </div>
      )}

      {/* Submit Controls */}
      <div className={`flex gap-3 pt-3 border-t border-[#F4F1EA] mt-4 ${isRtl ? "justify-start" : "justify-end"}`}>
        {status === "success" ? (
          <div className="px-5 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl flex items-center gap-1.5 shadow-sm">
            <span>{t("Saved successfully!")}</span>
          </div>
        ) : (
          <button
            type="submit"
            disabled={status === "saving" || isImageUploading || isAudioUploading}
            className="px-8 py-3 text-xs font-bold text-[#E5C38B] bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#15243F] rounded-full transition-all shadow-sm flex items-center gap-2 cursor-pointer font-sans"
          >
            {status === "saving" ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                {t("Saving...")}
              </>
            ) : isEditing ? (
              t("Save Changes")
            ) : (
              t("Publish Invitation")
            )}
          </button>
        )}
      </div>
    </form>
  );
}
