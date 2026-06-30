"use client";

import { useState } from "react";
import api from "@/lib/api";

interface InvitationEditorProps {
  purchaseId: string;
  invitation: any | null; // InvitationData shape from purchase
  templateTitle: string;
  onSaved: () => void;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

export default function InvitationEditor({
  purchaseId,
  invitation,
  templateTitle,
  onSaved,
}: InvitationEditorProps) {
  const isEditing = !!invitation;

  // ── Parse initial Groom & Bride names from eventTitle ───────────────
  const getInitialNames = () => {
    if (!invitation?.eventTitle) return { groom: "", bride: "" };
    const title = invitation.eventTitle;

    // Try splitting by " & "
    if (title.includes(" & ")) {
      const parts = title.split(" & ");
      return { groom: parts[0]?.trim() || "", bride: parts[1]?.trim() || "" };
    }
    // Try splitting by " و " (Arabic)
    if (title.includes(" و ")) {
      const parts = title.split(" و ");
      // Strip typical prefix "حفل زفاف" if exists
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
      // Convert ISO to datetime-local format (YYYY-MM-DDTHH:mm)
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

  // ── Submit handlers ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const filteredImages = images.filter((url) => url.trim() !== "");
    const generatedTitle = `${groomName.trim()} & ${brideName.trim()}`;

    try {
      if (isEditing) {
        // PUT /invitations/:id
        await api.put(`/invitations/${invitation.id}`, {
          slug: slug.trim(),
          eventTitle: generatedTitle,
          eventDate: new Date(eventDate).toISOString(),
          eventLocation: eventLocation.trim(),
          locationUrl: locationUrl.trim() || undefined,
          welcomeText: welcomeText.trim() || undefined,
          images: filteredImages,
          musicUrl: musicUrl.trim() || undefined,
        });
      } else {
        // POST /invitations
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
        setErrorMsg("Failed to save invitation. Please check your fields and try again.");
      }
    }
  };

  // Input styles
  const inputClass =
    "w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-neutral-800 placeholder-neutral-400";
  const labelClass =
    "mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-sans";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="border-b border-[#F4F1EA] pb-3">
        <h2 className="text-xl font-serif font-medium text-neutral-800">
          {isEditing ? "Edit Invitation Details" : "Create New Invitation"}
        </h2>
        <p className="text-[11px] text-neutral-400 mt-1">Template: {templateTitle}</p>
      </div>

      {/* Groom & Bride Names Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Husband's Name (Groom)</label>
          <input
            type="text"
            value={groomName}
            onChange={(e) => setGroomName(e.target.value)}
            placeholder="e.g. Ahmed"
            required
            disabled={status === "saving"}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Wife's Name (Bride)</label>
          <input
            type="text"
            value={brideName}
            onChange={(e) => setBrideName(e.target.value)}
            placeholder="e.g. Sarah"
            required
            disabled={status === "saving"}
            className={inputClass}
          />
        </div>
      </div>

      {/* URL Link Slug */}
      <div>
        <label className={labelClass}>Custom Invite Link Slug</label>
        <div className="flex items-stretch shadow-sm rounded-xl overflow-hidden border border-[#E6E2DA]">
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
          This forms your public shareable link. Lowercase letters, numbers, and hyphens only.
        </p>
      </div>

      {/* Event Date & Time */}
      <div>
        <label className={labelClass}>Event Date & Time</label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
          disabled={status === "saving"}
          className={inputClass}
        />
      </div>

      {/* Event Location Venue */}
      <div>
        <label className={labelClass}>Event Location (Hall Name)</label>
        <input
          type="text"
          value={eventLocation}
          onChange={(e) => setEventLocation(e.target.value)}
          placeholder="e.g. Royal Hall, Riyadh"
          required
          disabled={status === "saving"}
          className={inputClass}
        />
      </div>

      {/* Google Maps Venue Link */}
      <div>
        <label className={labelClass}>Google Maps URL (Location Link)</label>
        <input
          type="url"
          value={locationUrl}
          onChange={(e) => setLocationUrl(e.target.value)}
          placeholder="https://maps.google.com/?q=..."
          required
          disabled={status === "saving"}
          className={inputClass}
        />
      </div>

      {/* Welcome / Invitation Message */}
      <div>
        <label className={labelClass}>Welcome Invitation Message</label>
        <textarea
          value={welcomeText}
          onChange={(e) => setWelcomeText(e.target.value)}
          placeholder="Write your welcome message to family and friends..."
          required
          rows={3}
          disabled={status === "saving"}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Background Sound Music URL */}
      <div>
        <label className={labelClass}>Background Music URL (Optional)</label>
        <input
          type="url"
          value={musicUrl}
          onChange={(e) => setMusicUrl(e.target.value)}
          placeholder="https://cdn.example.com/audio/wedding-nasheed.mp3"
          disabled={status === "saving"}
          className={inputClass}
        />
      </div>

      {/* Gallery Images */}
      <div>
        <label className={labelClass}>Gallery Photo URLs (Optional)</label>
        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
          {images.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateImage(i, e.target.value)}
                placeholder={`Photo URL #${i + 1}`}
                disabled={status === "saving"}
                className={inputClass}
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(i)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-colors text-neutral-400"
                  aria-label="Remove image"
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
          className="mt-2 text-[10px] font-bold text-[#B89C72] hover:text-[#A3875D] transition-colors uppercase tracking-wider"
        >
          + Add another photo
        </button>
      </div>

      {/* Save Status & Error Messages */}
      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {errorMsg}
        </div>
      )}

      {/* Submit Controls */}
      <div className="flex gap-3 justify-end pt-3 border-t border-[#F4F1EA] mt-4">
        {status === "success" ? (
          <div className="px-5 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl flex items-center gap-1.5 shadow-sm">
            <span>✓ Saved successfully!</span>
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
                Saving...
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Publish Invitation"
            )}
          </button>
        )}
      </div>
    </form>
  );
}
