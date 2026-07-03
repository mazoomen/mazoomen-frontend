"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";

interface InvitationEditorProps {
  purchaseId: string;
  invitation: any | null; // InvitationData shape from purchase
  templateTitle: string;
  onSaved: () => void;
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
}: InvitationEditorProps) {
  const { lang, t } = useLanguage();
  const isRtl = lang === "ar";
  const isEditing = !!invitation;

  // ── Parse initial Groom & Bride names from eventTitle ───────────────
  const getInitialNames = () => {
    if (!invitation?.eventTitle) return { groom: "", bride: "" };
    const title = invitation.eventTitle;

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

  const initialNames = getInitialNames();

  // ── Form State ──────────────────────────────────────────────────────
  const [groomName, setGroomName] = useState(initialNames.groom);
  const [brideName, setBrideName] = useState(initialNames.bride);
  const [slug, setSlug] = useState(invitation?.slug || "");
  const [eventDate, setEventDate] = useState(() => {
    if (invitation?.eventDate) {
      return invitation.eventDate.slice(0, 16);
    }
    return "";
  });
  const [eventLocation, setEventLocation] = useState(invitation?.eventLocation || "");
  const [locationUrl, setLocationUrl] = useState(invitation?.locationUrl || "");
  const [welcomeText, setWelcomeText] = useState(invitation?.welcomeText || "");
  const [images, setImages] = useState<string[]>(
    invitation?.images?.length ? invitation.images : [""]
  );
  const [musicUrl, setMusicUrl] = useState(invitation?.musicUrl || "");

  // ── Event Program (Timeline) State ──────────────────────────────────
  const [eventProgram, setEventProgram] = useState<{ time: string; title: string }[]>(
    invitation?.eventProgram?.length ? invitation.eventProgram : [{ time: "", title: "" }]
  );

  // ── Event Details State ─────────────────────────────────────────────
  const [eventDetails, setEventDetails] = useState<{ text: string }[]>(
    invitation?.eventDetails?.length ? invitation.eventDetails : [{ text: "" }]
  );

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Manage Dynamic Image URLs ────────────────────────────────────────
  const addImageField = () => setImages([...images, ""]);
  const removeImageField = (index: number) => {
    if (images.length <= 1) return;
    setImages(images.filter((_, i) => i !== index));
  };
  const updateImage = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  // ── Manage Dynamic Event Program ─────────────────────────────────────
  const addProgramItem = () => setEventProgram([...eventProgram, { time: "", title: "" }]);
  const removeProgramItem = (index: number) => {
    if (eventProgram.length <= 1) return;
    setEventProgram(eventProgram.filter((_, i) => i !== index));
  };
  const updateProgramItem = (index: number, field: "time" | "title", value: string) => {
    const updated = [...eventProgram];
    updated[index] = { ...updated[index], [field]: value };
    setEventProgram(updated);
  };

  // ── Manage Dynamic Event Details ──────────────────────────────────────
  const addDetailItem = () => setEventDetails([...eventDetails, { text: "" }]);
  const removeDetailItem = (index: number) => {
    if (eventDetails.length <= 1) return;
    setEventDetails(eventDetails.filter((_, i) => i !== index));
  };
  const updateDetailItem = (index: number, value: string) => {
    const updated = [...eventDetails];
    updated[index] = { text: value };
    setEventDetails(updated);
  };

  // ── Submit handlers ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const filteredImages = images.filter((url) => url.trim() !== "");
    const generatedTitle = `${groomName.trim()} & ${brideName.trim()}`;

    // ── Build event program: if user left everything empty, auto-fill defaults ──
    let finalProgram = eventProgram.filter((p) => p.time.trim() !== "" || p.title.trim() !== "");

    if (finalProgram.length === 0 && eventDate) {
      const eventTime = eventDate.split("T")[1] || "20:00";
      const formattedTime = formatTimeToArabic(eventTime);
      finalProgram = [
        { time: formattedTime, title: t("Party start") },
      ];
    }

    // Convert time inputs (HH:mm) to Arabic formatted strings
    finalProgram = finalProgram.map((p) => ({
      time: p.time.includes(":") && !p.time.includes(" ") ? formatTimeToArabic(p.time) : p.time,
      title: p.title,
    }));

    const filteredDetails = eventDetails.filter((d) => d.text.trim() !== "");

    try {
      if (isEditing) {
        await api.put(`/invitations/${invitation.id}`, {
          slug: slug.trim(),
          eventTitle: generatedTitle,
          eventDate: new Date(eventDate).toISOString(),
          eventLocation: eventLocation.trim(),
          locationUrl: locationUrl.trim() || undefined,
          welcomeText: welcomeText.trim() || undefined,
          images: filteredImages,
          musicUrl: musicUrl.trim() || undefined,
          eventProgram: finalProgram,
          eventDetails: filteredDetails,
        });
      } else {
        await api.post("/invitations", {
          purchaseId,
          slug: slug.trim(),
          eventTitle: generatedTitle,
          eventDate: new Date(eventDate).toISOString(),
          eventLocation: eventLocation.trim(),
          locationUrl: locationUrl.trim() || undefined,
          welcomeText: welcomeText.trim() || undefined,
          images: filteredImages,
          musicUrl: musicUrl.trim() || undefined,
          eventProgram: finalProgram,
          eventDetails: filteredDetails,
        });
      }

      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        onSaved();
      }, 1000);
    } catch (err: any) {
      setStatus("error");
      if (err.response?.data?.message) {
        const msg = err.response.data.message;
        setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setErrorMsg(t("Save failed"));
      }
    }
  };

  // Input styles
  const inputClass =
    "w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-neutral-800 placeholder-neutral-400";
  const labelClass =
    "mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-sans";
  const removeBtnClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-colors text-neutral-400";
  const addBtnClass =
    "mt-2 text-[10px] font-bold text-[#B89C72] hover:text-[#A3875D] transition-colors tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      {/* Title */}
      <div className="border-b border-[#F4F1EA] pb-3">
        <h2 className="text-xl font-serif font-medium text-neutral-800">
          {isEditing ? t("Edit Invitation Details") : t("Create New Invitation")}
        </h2>
        <p className="text-[11px] text-neutral-400 mt-1">{t("Template:")} {templateTitle}</p>
      </div>

      {/* Groom & Bride Names Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t("Groom's Name")}</label>
          <input
            type="text"
            value={groomName}
            onChange={(e) => setGroomName(e.target.value)}
            placeholder={t("e.g. Ahmed")}
            required
            disabled={status === "saving"}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t("Bride's Name")}</label>
          <input
            type="text"
            value={brideName}
            onChange={(e) => setBrideName(e.target.value)}
            placeholder={t("e.g. Sarah")}
            required
            disabled={status === "saving"}
            className={inputClass}
          />
        </div>
      </div>

      {/* URL Link Slug */}
      <div>
        <label className={labelClass}>{t("Custom Invite Link")}</label>
        <div className="flex items-stretch shadow-sm rounded-xl overflow-hidden border border-[#E6E2DA]" dir="ltr">
          <span className="flex items-center bg-[#FAF8F5] border-r border-[#E6E2DA] px-3 text-[11px] text-neutral-400 font-semibold select-none">
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
            className="w-full bg-white px-4 py-2.5 text-xs outline-none focus:border-black transition-all text-neutral-800 placeholder-neutral-400"
          />
        </div>
        <p className="mt-1.5 text-[9px] text-neutral-400 leading-normal">
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
          disabled={status === "saving"}
          className={inputClass}
          dir="ltr"
        />
      </div>

      {/* Event Location Venue */}
      <div>
        <label className={labelClass}>{t("Event Location (Hall Name)")}</label>
        <input
          type="text"
          value={eventLocation}
          onChange={(e) => setEventLocation(e.target.value)}
          placeholder={t("e.g. Royal Hall, Riyadh")}
          required
          disabled={status === "saving"}
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
          disabled={status === "saving"}
          className={inputClass}
          dir="ltr"
        />
      </div>

      {/* Welcome / Invitation Message */}
      <div>
        <label className={labelClass}>{t("Welcome Invitation Message")}</label>
        <textarea
          value={welcomeText}
          onChange={(e) => setWelcomeText(e.target.value)}
          placeholder={t("Write your welcome message...")}
          required
          rows={3}
          disabled={status === "saving"}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Background Sound Music URL */}
      <div>
        <label className={labelClass}>{t("Background Music URL (Optional)")}</label>
        <input
          type="url"
          value={musicUrl}
          onChange={(e) => setMusicUrl(e.target.value)}
          placeholder="https://cdn.example.com/audio/nasheed.mp3"
          disabled={status === "saving"}
          className={inputClass}
          dir="ltr"
        />
      </div>

      {/* Gallery Images */}
      <div>
        <label className={labelClass}>{t("Gallery Photo URLs (Optional)")}</label>
        <div className={`space-y-2 max-h-36 overflow-y-auto ${isRtl ? "pl-1" : "pr-1"}`}>
          {images.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateImage(i, e.target.value)}
                placeholder={`${t("Photo URL #")}${i + 1}`}
                disabled={status === "saving"}
                className={inputClass}
                dir="ltr"
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(i)}
                  className={removeBtnClass}
                  aria-label={t("Remove")}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addImageField}
          disabled={status === "saving"}
          className={addBtnClass}
        >
          {t("+ Add another photo")}
        </button>
      </div>

      {/* Event Program (Timeline) */}
      <div>
        <label className={labelClass}>{t("Event Program (Optional)")}</label>
        <p className="mb-2 text-[9px] text-neutral-400 leading-normal">
          {t("Program hint")}
        </p>
        <div className={`space-y-2 max-h-48 overflow-y-auto ${isRtl ? "pl-1" : "pr-1"}`}>
          {eventProgram.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-[110px] shrink-0">
                <input
                  type="time"
                  value={item.time}
                  onChange={(e) => updateProgramItem(i, "time", e.target.value)}
                  disabled={status === "saving"}
                  className={`${inputClass} text-center`}
                  dir="ltr"
                />
              </div>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateProgramItem(i, "title", e.target.value)}
                placeholder={t("e.g. Reception")}
                disabled={status === "saving"}
                className={inputClass}
              />
              {eventProgram.length > 1 && (
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
        <button
          type="button"
          onClick={addProgramItem}
          disabled={status === "saving"}
          className={addBtnClass}
        >
          {t("+ Add another item")}
        </button>
      </div>

      {/* Event Details / Guidelines */}
      <div>
        <label className={labelClass}>{t("Event Details (Optional)")}</label>
        <p className="mb-2 text-[9px] text-neutral-400 leading-normal">
          {t("Details hint")}
        </p>
        <div className={`space-y-2 max-h-36 overflow-y-auto ${isRtl ? "pl-1" : "pr-1"}`}>
          {eventDetails.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateDetailItem(i, e.target.value)}
                placeholder={t("e.g. QR entry only")}
                disabled={status === "saving"}
                className={inputClass}
              />
              {eventDetails.length > 1 && (
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
        <button
          type="button"
          onClick={addDetailItem}
          disabled={status === "saving"}
          className={addBtnClass}
        >
          {t("+ Add another detail")}
        </button>
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
            disabled={status === "saving"}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
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
