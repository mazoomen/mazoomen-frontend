"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";

interface TemplateFormData {
  title: string;
  description: string;
  previewImage: string;
  demoLink: string;
  price: string;
  isPremium: boolean;
}

interface FieldConfig {
  key: string;
  enabled: boolean;
  labelEn: string;
  labelAr: string;
  defaultEn: string;
  defaultAr: string;
  type: string;
}

interface AddTemplateFormProps {
  initialTemplateData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const INITIAL_FORM: TemplateFormData = {
  title: "",
  description: "",
  previewImage: "",
  demoLink: "",
  price: "",
  isPremium: false,
};

export default function AddTemplateForm({
  initialTemplateData,
  onSuccess,
  onCancel,
}: AddTemplateFormProps) {
  const { lang } = useLanguage();
  const [form, setForm] = useState<TemplateFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isEditing = !!initialTemplateData;

  // ── Visual Fields Builder State ──────────────────────────────────────
  const [fields, setFields] = useState<FieldConfig[]>([
    {
      key: "groomName",
      enabled: true,
      labelEn: "Groom's Name",
      labelAr: "اسم العريس",
      defaultEn: "Groom",
      defaultAr: "العريس",
      type: "string",
    },
    {
      key: "brideName",
      enabled: true,
      labelEn: "Bride's Name",
      labelAr: "اسم العروس",
      defaultEn: "Bride",
      defaultAr: "العروس",
      type: "string",
    },
    {
      key: "eventDate",
      enabled: true,
      labelEn: "Event Date & Time",
      labelAr: "تاريخ ووقت الحفل",
      defaultEn: "",
      defaultAr: "",
      type: "date",
    },
    {
      key: "eventLocation",
      enabled: true,
      labelEn: "Event Venue (Hall Name)",
      labelAr: "مكان الحفل (القاعة)",
      defaultEn: "Riyadh Hall",
      defaultAr: "قاعة السمو، الرياض",
      type: "string",
    },
    {
      key: "locationUrl",
      enabled: true,
      labelEn: "Location Map URL",
      labelAr: "رابط موقع الحفل",
      defaultEn: "",
      defaultAr: "",
      type: "string",
    },
    {
      key: "welcomeText",
      enabled: true,
      labelEn: "Welcome Message",
      labelAr: "رسالة الترحيب والبطاقة",
      defaultEn: "Welcome to our wedding",
      defaultAr: "مرحباً بكم في حفل زفافنا",
      type: "string",
    },
    {
      key: "musicUrl",
      enabled: true,
      labelEn: "Background Music URL",
      labelAr: "رابط الصوت الخلفي",
      defaultEn: "",
      defaultAr: "",
      type: "string",
    },
    {
      key: "images",
      enabled: true,
      labelEn: "Album Image URLs",
      labelAr: "صور ألبوم العروسين",
      defaultEn: "",
      defaultAr: "",
      type: "array",
    },
  ]);

  // Load editing template data
  useEffect(() => {
    if (!initialTemplateData) {
      setForm(INITIAL_FORM);
      return;
    }

    setForm({
      title: initialTemplateData.title || "",
      description: initialTemplateData.description || "",
      previewImage: initialTemplateData.previewImage || "",
      demoLink: initialTemplateData.demoLink || "",
      price: String(initialTemplateData.price || ""),
      isPremium: !!initialTemplateData.isPremium,
    });

    const editableFields = initialTemplateData.editableFields || {};
    setFields((prev) =>
      prev.map((f) => {
        const customField = editableFields[f.key];
        if (customField) {
          return {
            ...f,
            enabled: true,
            labelEn: customField.label || f.labelEn,
            labelAr: customField.label || f.labelAr,
            defaultEn: customField.default || f.defaultEn,
            defaultAr: customField.default || f.defaultAr,
          };
        } else {
          return {
            ...f,
            enabled: false,
          };
        }
      })
    );
  }, [initialTemplateData]);

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

  const handleFieldToggle = (index: number) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const handleFieldLabelChange = (index: number, value: string) => {
    setFields((prev) =>
      prev.map((f, i) =>
        i === index
          ? lang === "ar"
            ? { ...f, labelAr: value }
            : { ...f, labelEn: value }
          : f
      )
    );
  };

  const handleFieldDefaultChange = (index: number, value: string) => {
    setFields((prev) =>
      prev.map((f, i) =>
        i === index
          ? lang === "ar"
            ? { ...f, defaultAr: value }
            : { ...f, defaultEn: value }
          : f
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      // Build the JSON schema automatically based on user choices
      const parsedFields: Record<
        string,
        { type: string; label: string; default: string }
      > = {};
      fields.forEach((f) => {
        if (f.enabled) {
          parsedFields[f.key] = {
            type: f.type,
            label: lang === "ar" ? f.labelAr.trim() : f.labelEn.trim(),
            default: lang === "ar" ? f.defaultAr.trim() : f.defaultEn.trim(),
          };
        }
      });

      if (Object.keys(parsedFields).length === 0) {
        throw new Error(
          lang === "ar"
            ? "يجب تفعيل حقل واحد على الأقل للمستخدم لتعديله."
            : "You must enable at least one customizable field."
        );
      }

      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        previewImage: form.previewImage.trim(),
        demoLink: form.demoLink.trim() || undefined,
        price: parseFloat(form.price),
        isPremium: form.isPremium,
        editableFields: parsedFields,
      };

      if (isEditing) {
        await api.put(`/templates/${initialTemplateData.id}`, body);
        setFeedback({
          type: "success",
          message:
            lang === "ar"
              ? `تم تحديث القالب "${form.title}" بنجاح!`
              : `Template "${form.title}" updated successfully!`,
        });
      } else {
        await api.post("/templates", body);
        setFeedback({
          type: "success",
          message:
            lang === "ar"
              ? `تم إنشاء القالب "${form.title}" بنجاح!`
              : `Template "${form.title}" created successfully!`,
        });
        setForm(INITIAL_FORM);
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save template.";
      setFeedback({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  const isValid =
    form.title.trim() !== "" &&
    form.description.trim() !== "" &&
    form.previewImage.trim() !== "" &&
    form.price.trim() !== "" &&
    !isNaN(parseFloat(form.price)) &&
    parseFloat(form.price) >= 0 &&
    fields.some((f) => f.enabled);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-neutral-800">
      {/* ── Feedback Banner ──────────────────────────────────── */}
      {feedback && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-sans ${
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
          className="mb-1.5 block text-xs font-semibold text-gray-700 font-sans"
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
          className="mb-1.5 block text-xs font-semibold text-gray-700 font-sans"
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
          className="w-full rounded-lg border border-[#EBE7DF] bg-[#FAF9F6] px-4 py-2.5 text-xs text-neutral-800 placeholder-gray-400 outline-none transition-colors focus:border-[#B89C72] disabled:opacity-50 resize-none font-sans"
        />
      </div>

      {/* ── Preview Image URL ────────────────────────────────── */}
      <div>
        <label
          htmlFor="template-preview"
          className="mb-1.5 block text-xs font-semibold text-gray-700 font-sans"
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
          className="mb-1.5 block text-xs font-semibold text-gray-700 font-sans"
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end font-sans">
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

      {/* ── Visual Fields Builder ── */}
      <div className="space-y-3 font-sans">
        <div>
          <label className="block text-xs font-semibold text-gray-700">
            {lang === "ar" ? "الحقول القابلة للتخصيص من العميل" : "Customizable Invitation Fields"} <span className="text-red-400">*</span>
          </label>
          <p className="text-[10px] text-gray-400 mt-1 leading-normal">
            {lang === "ar"
              ? "اختر الحقول التي ترغب في السماح للعميل بتعديلها لتخصيص دعوته، وحدد المسميات والقيم الافتراضية."
              : "Enable the dynamic inputs that clients can modify to personalize their invitations."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF8F5] border border-[#EBE7DF] rounded-xl p-4">
          {fields.map((f, i) => {
            const label = lang === "ar" ? f.labelAr : f.labelEn;
            const defaultValue = lang === "ar" ? f.defaultAr : f.defaultEn;

            return (
              <div
                key={f.key}
                className={`rounded-xl border p-3.5 transition-all duration-300 ${
                  f.enabled
                    ? "bg-white border-[#B89C72]/30 shadow-xs"
                    : "bg-[#FAF9F6] border-[#EBE7DF]/70 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={f.enabled}
                    onChange={() => handleFieldToggle(i)}
                    disabled={submitting}
                    className="h-4 w-4 rounded border-[#EBE7DF] text-[#B89C72] focus:ring-[#B89C72] focus:ring-offset-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-neutral-800">
                      {f.key === "groomName"
                        ? lang === "ar"
                          ? "اسم العريس (Husband)"
                          : "Husband's Name (Groom)"
                        : f.key === "brideName"
                        ? lang === "ar"
                          ? "اسم العروس (Wife)"
                          : "Wife's Name (Bride)"
                        : label}
                    </span>
                    <p className="text-[9px] text-neutral-400 uppercase tracking-widest mt-0.5">
                      {f.key} • {f.type}
                    </p>
                  </div>
                </div>

                {f.enabled && (
                  <div className="mt-3.5 pt-3 border-t border-[#FAF1EA] grid grid-cols-2 gap-2.5 animate-fadeIn">
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        {lang === "ar" ? "التسمية (Label)" : "Label"}
                      </label>
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => handleFieldLabelChange(i, e.target.value)}
                        placeholder="Label"
                        disabled={submitting}
                        className="w-full rounded-md border border-[#EBE7DF] bg-[#FAF9F6] px-2.5 py-1.5 text-[10px] text-neutral-850 outline-none focus:border-[#B89C72]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        {lang === "ar" ? "الافتراضي (Default)" : "Default Value"}
                      </label>
                      <input
                        type="text"
                        value={defaultValue}
                        onChange={(e) => handleFieldDefaultChange(i, e.target.value)}
                        placeholder="Default"
                        disabled={submitting}
                        className="w-full rounded-md border border-[#EBE7DF] bg-[#FAF9F6] px-2.5 py-1.5 text-[10px] text-neutral-850 outline-none focus:border-[#B89C72]"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Submit Controls ──────────────────────────────────── */}
      <div className="flex gap-3 justify-end pt-3 border-t border-[#FAF1EA] mt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-[#EBE7DF] bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-all cursor-pointer font-sans"
          >
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !isValid}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#0B1528] py-2.5 px-6 text-xs font-bold text-[#E5C38B] hover:bg-[#1E2E4A] transition-all disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer font-sans"
        >
          {submitting ? (
            <>
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#E5C38B]/30 border-t-[#E5C38B]" />
              {lang === "ar" ? "جاري الحفظ..." : "Saving…"}
            </>
          ) : (
            <>
              {isEditing ? (
                lang === "ar" ? "حفظ التعديلات" : "Save Changes"
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
            </>
          )}
        </button>
      </div>
    </form>
  );
}
