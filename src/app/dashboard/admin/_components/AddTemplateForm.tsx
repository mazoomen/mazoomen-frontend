"use client";

import { useState } from "react";
import api from "@/lib/api";

interface TemplateFormData {
  title: string;
  thumbnailUrl: string;
  demoLink: string;
  price: string;
  isPremium: boolean;
}

const INITIAL_FORM: TemplateFormData = {
  title: "",
  thumbnailUrl: "",
  demoLink: "",
  price: "",
  isPremium: false,
};

export default function AddTemplateForm() {
  const [form, setForm] = useState<TemplateFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      await api.post("/templates", {
        title: form.title.trim(),
        thumbnailUrl: form.thumbnailUrl.trim(),
        demoLink: form.demoLink.trim(),
        price: parseFloat(form.price),
        isPremium: form.isPremium,
      });

      setFeedback({
        type: "success",
        message: `Template "${form.title}" created successfully!`,
      });
      setForm(INITIAL_FORM);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create template.";
      setFeedback({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  const isValid =
    form.title.trim() !== "" &&
    form.thumbnailUrl.trim() !== "" &&
    form.demoLink.trim() !== "" &&
    form.price.trim() !== "" &&
    !isNaN(parseFloat(form.price)) &&
    parseFloat(form.price) >= 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Feedback Banner ──────────────────────────────────── */}
      {feedback && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : "border-red-500/20 bg-red-500/5 text-red-400"
          }`}
        >
          {feedback.type === "success" ? "✓" : "✕"} {feedback.message}
        </div>
      )}

      {/* ── Title ────────────────────────────────────────────── */}
      <div>
        <label
          htmlFor="template-title"
          className="mb-1.5 block text-sm font-medium text-gray-300"
        >
          Title <span className="text-red-400">*</span>
        </label>
        <input
          id="template-title"
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Royal Gold Wedding"
          disabled={submitting}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 disabled:opacity-50"
        />
      </div>

      {/* ── Thumbnail URL ────────────────────────────────────── */}
      <div>
        <label
          htmlFor="template-thumbnail"
          className="mb-1.5 block text-sm font-medium text-gray-300"
        >
          Thumbnail URL <span className="text-red-400">*</span>
        </label>
        <input
          id="template-thumbnail"
          type="url"
          name="thumbnailUrl"
          value={form.thumbnailUrl}
          onChange={handleChange}
          placeholder="https://cdn.mazoom.app/templates/preview.jpg"
          disabled={submitting}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 disabled:opacity-50"
        />
      </div>

      {/* ── Demo Link ────────────────────────────────────────── */}
      <div>
        <label
          htmlFor="template-demo"
          className="mb-1.5 block text-sm font-medium text-gray-300"
        >
          Demo Link <span className="text-red-400">*</span>
        </label>
        <input
          id="template-demo"
          type="url"
          name="demoLink"
          value={form.demoLink}
          onChange={handleChange}
          placeholder="https://demo.mazoom.app/template-name"
          disabled={submitting}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 disabled:opacity-50"
        />
      </div>

      {/* ── Price + Premium Row ───────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="template-price"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Price (SAR) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="template-price"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="149.99"
              min="0"
              step="0.01"
              disabled={submitting}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 pr-14 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 disabled:opacity-50"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              SAR
            </span>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 transition-colors hover:border-gray-600">
          <input
            type="checkbox"
            name="isPremium"
            checked={form.isPremium}
            onChange={handleChange}
            disabled={submitting}
            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
          />
          <div>
            <span className="text-sm font-medium text-gray-200">Premium</span>
            <p className="text-xs text-gray-500">Mark as premium template</p>
          </div>
        </label>
      </div>

      {/* ── Submit Button ────────────────────────────────────── */}
      <button
        type="submit"
        disabled={submitting || !isValid}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {submitting ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Creating…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Add Template
          </>
        )}
      </button>
    </form>
  );
}
