"use client";

import { useState } from "react";
import api from "@/lib/api";
import type { InvitationData } from "@/types/invitation";

interface InvitationEditorProps {
  invitation: InvitationData | null;
  onSaved: (invitation: InvitationData) => void;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

export default function InvitationEditor({
  invitation,
  onSaved,
}: InvitationEditorProps) {
  const isEditing = !!invitation;

  // ── Form state ───────────────────────────────────────────────────────
  const [templateId, setTemplateId] = useState(
    invitation?.templateId || "",
  );
  const [slug, setSlug] = useState(invitation?.slug || "");
  const [eventDate, setEventDate] = useState(() => {
    if (invitation?.eventDate) {
      // Convert ISO to datetime-local format (YYYY-MM-DDTHH:mm)
      return invitation.eventDate.slice(0, 16);
    }
    return "";
  });
  const [locationUrl, setLocationUrl] = useState(
    invitation?.locationUrl || "",
  );
  const [welcomeText, setWelcomeText] = useState(
    invitation?.welcomeText || "",
  );
  const [images, setImages] = useState<string[]>(
    invitation?.images?.length ? invitation.images : [""],
  );
  const [musicUrl, setMusicUrl] = useState(invitation?.musicUrl || "");

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Image URL management ─────────────────────────────────────────────
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

  // ── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const filteredImages = images.filter((url) => url.trim() !== "");

    try {
      let response;

      if (isEditing) {
        // PUT /invitations/:id
        response = await api.put(`/invitations/${invitation.id}`, {
          slug,
          eventDate: new Date(eventDate).toISOString(),
          locationUrl,
          welcomeText,
          images: filteredImages,
          musicUrl: musicUrl || undefined,
        });
      } else {
        // POST /invitations
        response = await api.post("/invitations", {
          templateId,
          slug,
          eventDate: new Date(eventDate).toISOString(),
          locationUrl,
          welcomeText,
          images: filteredImages,
          musicUrl: musicUrl || undefined,
        });
      }

      setStatus("success");
      onSaved(response.data);

      // Reset success status after 3s
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      setStatus("error");
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setErrorMsg(
          axiosErr.response?.data?.message || "Failed to save invitation.",
        );
      } else {
        setErrorMsg("Failed to save invitation. Please try again.");
      }
    }
  };

  // ── Shared input classes ─────────────────────────────────────────────
  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30";
  const labelClass =
    "mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          {isEditing ? "Edit Invitation" : "Create New Invitation"}
        </h2>
        {status === "success" && (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            ✓ Saved
          </span>
        )}
      </div>

      {/* Template ID — only for creation */}
      {!isEditing && (
        <div>
          <label htmlFor="editor-template" className={labelClass}>
            Template ID
          </label>
          <input
            id="editor-template"
            type="text"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            placeholder="Paste the template UUID"
            required
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            You must have an approved order for this template.
          </p>
        </div>
      )}

      {/* Slug */}
      <div>
        <label htmlFor="editor-slug" className={labelClass}>
          Invitation URL Slug
        </label>
        <div className="flex items-stretch">
          <span className="flex items-center rounded-l-lg border border-r-0 border-gray-700 bg-gray-800 px-3 text-xs text-gray-500">
            /invite/
          </span>
          <input
            id="editor-slug"
            type="text"
            value={slug}
            onChange={(e) =>
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "")
              )
            }
            placeholder="ahmed-wedding"
            required
            className={`${inputClass} rounded-l-none`}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Lowercase letters, numbers, and hyphens only.
        </p>
      </div>

      {/* Event Date */}
      <div>
        <label htmlFor="editor-date" className={labelClass}>
          Event Date & Time
        </label>
        <input
          id="editor-date"
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {/* Location URL */}
      <div>
        <label htmlFor="editor-location" className={labelClass}>
          Google Maps / Venue URL
        </label>
        <input
          id="editor-location"
          type="url"
          value={locationUrl}
          onChange={(e) => setLocationUrl(e.target.value)}
          placeholder="https://maps.google.com/?q=..."
          required
          className={inputClass}
        />
      </div>

      {/* Welcome Text */}
      <div>
        <label htmlFor="editor-welcome" className={labelClass}>
          Welcome / Invitation Text
        </label>
        <textarea
          id="editor-welcome"
          value={welcomeText}
          onChange={(e) => setWelcomeText(e.target.value)}
          placeholder="Write your beautiful invitation message here…"
          required
          rows={4}
          className={`${inputClass} resize-y`}
        />
      </div>

      {/* Images */}
      <div>
        <label className={labelClass}>Gallery Image URLs</label>
        <div className="space-y-2">
          {images.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateImage(i, e.target.value)}
                placeholder={`Image URL #${i + 1}`}
                className={`${inputClass} flex-1`}
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(i)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-700 text-gray-500 transition-colors hover:border-red-500 hover:text-red-400"
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
          className="mt-2 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          + Add another image
        </button>
      </div>

      {/* Music URL */}
      <div>
        <label htmlFor="editor-music" className={labelClass}>
          Background Music URL{" "}
          <span className="font-normal normal-case text-gray-600">
            (optional)
          </span>
        </label>
        <input
          id="editor-music"
          type="url"
          value={musicUrl}
          onChange={(e) => setMusicUrl(e.target.value)}
          placeholder="https://cdn.example.com/music.mp3"
          className={inputClass}
        />
      </div>

      {/* Error */}
      {status === "error" && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {status === "saving" ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            Saving…
          </span>
        ) : isEditing ? (
          "Update Invitation"
        ) : (
          "Create Invitation"
        )}
      </button>
    </form>
  );
}
