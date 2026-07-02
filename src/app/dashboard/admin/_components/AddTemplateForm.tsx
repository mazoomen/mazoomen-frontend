"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";

interface TemplateFormData {
  title: string;
  description: string;
  previewImage: string;
  demoLink: string;
  price: string;
  isPremium: boolean;
  editableFields: string;
}

const DEFAULT_EDITABLE_FIELDS = JSON.stringify(
  {
    eventTitle: { type: "string", label: "Event Title", default: "العريس & العروس" },
    eventDate: { type: "date", label: "Event Date" },
    eventLocation: { type: "string", label: "Event Location", default: "قاعة السمو، الرياض" },
  },
  null,
  2
);

const INITIAL_FORM: TemplateFormData = {
  title: "",
  description: "",
  previewImage: "",
  demoLink: "",
  price: "",
  isPremium: false,
  editableFields: DEFAULT_EDITABLE_FIELDS,
};

export default function AddTemplateForm() {
  const { lang } = useLanguage();
  const [form, setForm] = useState<TemplateFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

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
      let parsedFields = {};
      try {
        parsedFields = JSON.parse(form.editableFields);
      } catch {
        throw new Error(
          lang === "ar"
            ? "يجب أن تكون الحقول القابلة للتعديل كائن JSON صالحاً."
            : "Editable Fields must be a valid JSON object."
        );
      }

      await api.post("/templates", {
        title: form.title.trim(),
        description: form.description.trim(),
        previewImage: form.previewImage.trim(),
        demoLink: form.demoLink.trim() || undefined,
        price: parseFloat(form.price),
        isPremium: form.isPremium,
        editableFields: parsedFields,
      });

      setFeedback({
        type: "success",
        message:
          lang === "ar"
            ? `تم إنشاء القالب "${form.title}" بنجاح!`
            : `Template "${form.title}" created successfully!`,
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

  let isJsonValid = false;
  try {
    const parsed = JSON.parse(form.editableFields);
    isJsonValid = parsed && typeof parsed === "object" && !Array.isArray(parsed);
  } catch {}

  const isValid =
    form.title.trim() !== "" &&
    form.description.trim() !== "" &&
    form.previewImage.trim() !== "" &&
    form.price.trim() !== "" &&
    !isNaN(parseFloat(form.price)) &&
    parseFloat(form.price) >= 0 &&
    isJsonValid;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-neutral-800">
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
          className="mb-1.5 block text-xs font-semibold text-gray-700"
        >
          {lang === "ar" ? "اسم القالب" : "Template Title"} <span className="text-red-400">*</span>
        </label>
        <input
          id="template-title"
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Royal Gold Wedding"
          disabled={submitting}
          className="w-full rounded-lg border border-[#EBE7DF] bg-[#FAF9F6] px-4 py-2.5 text-xs text-neutral-800 placeholder-gray-400 outline-none transition-colors focus:border-[#B89C72] disabled:opacity-50"
        />
      </div>

      {/* ── Description ──────────────────────────────────────── */}
      <div>
        <label
          htmlFor="template-description"
          className="mb-1.5 block text-xs font-semibold text-gray-700"
        >
          {lang === "ar" ? "وصف القالب" : "Description"} <span className="text-red-400">*</span>
        </label>
        <textarea
          id="template-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder={lang === "ar" ? "أدخل تفاصيل وصف القالب..." : "Detailed description of the invitation template..."}
          disabled={submitting}
          rows={3}
          className="w-full rounded-lg border border-[#EBE7DF] bg-[#FAF9F6] px-4 py-2.5 text-xs text-neutral-800 placeholder-gray-400 outline-none transition-colors focus:border-[#B89C72] disabled:opacity-50 resize-none"
        />
      </div>

      {/* ── Preview Image URL ────────────────────────────────── */}
      <div>
        <label
          htmlFor="template-preview"
          className="mb-1.5 block text-xs font-semibold text-gray-700"
        >
          {lang === "ar" ? "رابط صورة المعاينة" : "Preview Image URL"} <span className="text-red-400">*</span>
        </label>
        <input
          id="template-preview"
          type="url"
          name="previewImage"
          value={form.previewImage}
          onChange={handleChange}
          placeholder="https://cdn.mazoom.app/templates/preview.jpg"
          disabled={submitting}
          className="w-full rounded-lg border border-[#EBE7DF] bg-[#FAF9F6] px-4 py-2.5 text-xs text-neutral-800 placeholder-gray-400 outline-none transition-colors focus:border-[#B89C72] disabled:opacity-50"
        />
      </div>

      {/* ── Demo Link ────────────────────────────────────────── */}
      <div>
        <label
          htmlFor="template-demo"
          className="mb-1.5 block text-xs font-semibold text-gray-700"
        >
          {lang === "ar" ? "رابط العرض التجريبي (Demo)" : "Demo Link"}
        </label>
        <input
          id="template-demo"
          type="url"
          name="demoLink"
          value={form.demoLink}
          onChange={handleChange}
          placeholder="https://demo.mazoom.app/template-name"
          disabled={submitting}
          className="w-full rounded-lg border border-[#EBE7DF] bg-[#FAF9F6] px-4 py-2.5 text-xs text-neutral-800 placeholder-gray-400 outline-none transition-colors focus:border-[#B89C72] disabled:opacity-50"
        />
      </div>

      {/* ── Price + Premium Row ───────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="template-price"
            className="mb-1.5 block text-xs font-semibold text-gray-700"
          >
            {lang === "ar" ? "السعر (SAR)" : "Price (SAR)"} <span className="text-red-400">*</span>
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
              className={`w-full rounded-lg border border-[#EBE7DF] bg-[#FAF9F6] py-2.5 ${lang === "ar" ? "pl-14 pr-4" : "pl-4 pr-14"} text-xs text-neutral-800 placeholder-gray-400 outline-none transition-colors focus:border-[#B89C72] disabled:opacity-50`}
            />
            <span className={`pointer-events-none absolute ${lang === "ar" ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400`}>
              {lang === "ar" ? "ريال" : "SAR"}
            </span>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#EBE7DF] bg-[#FAF8F5] px-4 py-2.5 transition-all hover:bg-[#FAF9F6]">
          <input
            type="checkbox"
            name="isPremium"
            checked={form.isPremium}
            onChange={handleChange}
            disabled={submitting}
            className="h-4 w-4 rounded border-[#EBE7DF] text-[#B89C72] focus:ring-[#B89C72] focus:ring-offset-0"
          />
          <div>
            <span className="text-xs font-bold text-neutral-700">{lang === "ar" ? "مميز (Premium)" : "Premium"}</span>
            <p className="text-[10px] text-gray-400">{lang === "ar" ? "تحديد كقالب مدفوع ومميز" : "Mark as premium template"}</p>
          </div>
        </label>
      </div>

      {/* ── Editable Fields (JSON) ───────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5 font-sans">
          <label
            htmlFor="template-fields"
            className="block text-xs font-semibold text-gray-700"
          >
            {lang === "ar" ? "حقول التخصيص (JSON Schema)" : "Editable Fields (JSON Schema)"} <span className="text-red-400">*</span>
          </label>
          <span
            className={`text-[10px] font-bold transition-colors ${
              isJsonValid ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isJsonValid
              ? lang === "ar"
                ? "✓ JSON صالح"
                : "✓ Valid JSON"
              : lang === "ar"
              ? "✕ JSON غير صالح"
              : "✕ Invalid JSON"}
          </span>
        </div>
        <textarea
          id="template-fields"
          name="editableFields"
          value={form.editableFields}
          onChange={handleChange}
          disabled={submitting}
          rows={5}
          className="w-full rounded-lg border border-[#EBE7DF] bg-neutral-900 px-4 py-2.5 font-mono text-xs text-emerald-400 placeholder-gray-600 outline-none transition-colors focus:border-[#B89C72] disabled:opacity-50"
        />
        <p className="mt-1 text-[10px] text-gray-400 leading-normal">
          {lang === "ar"
            ? "حدد الحقول التي يمكن للمستخدم تعديلها مثل (اسم العريس، اسم العروس، تاريخ المناسبة، الموقع...)"
            : "Define the customizable fields key-map structure that clients will fill out when customizing this invitation."}
        </p>
      </div>

      {/* ── Submit Button ────────────────────────────────────── */}
      <button
        type="submit"
        disabled={submitting || !isValid}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B1528] py-3 text-xs font-bold text-[#E5C38B] hover:bg-[#1E2E4A] transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8 cursor-pointer"
      >
        {submitting ? (
          <>
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#E5C38B]/30 border-t-[#E5C38B]" />
            {lang === "ar" ? "جاري الحفظ..." : "Creating…"}
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            {lang === "ar" ? "إضافة القالب" : "Add Template"}
          </>
        )}
      </button>
    </form>
  );
}
