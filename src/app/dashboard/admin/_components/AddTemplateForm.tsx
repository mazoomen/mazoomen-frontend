"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";

interface TemplateFormData {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
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
  defaultEn: any;
  defaultAr: any;
  type: string;
}

interface AddTemplateFormProps {
  initialTemplateData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const INITIAL_FORM: TemplateFormData = {
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");
  const formattedSiteUrl = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;
  const [editingLang, setEditingLang] = useState<"ar" | "en">("ar");
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
      defaultEn: [""],
      defaultAr: [""],
      type: "array",
    },
    {
      key: "eventProgram",
      enabled: true,
      labelEn: "Event Program / Timeline",
      labelAr: "برنامج الحفل",
      defaultEn: [{ time: "", title: "" }],
      defaultAr: [{ time: "", title: "" }],
      type: "array",
    },
    {
      key: "eventDetails",
      enabled: true,
      labelEn: "Event Details / Guidelines",
      labelAr: "تفاصيل الحفل / التعليمات",
      defaultEn: [{ text: "" }],
      defaultAr: [{ text: "" }],
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
      titleAr: initialTemplateData.titleAr || initialTemplateData.title || "",
      titleEn: initialTemplateData.titleEn || initialTemplateData.title || "",
      descriptionAr: initialTemplateData.descriptionAr || initialTemplateData.description || "",
      descriptionEn: initialTemplateData.descriptionEn || initialTemplateData.description || "",
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
          let defEn = customField.defaultEn !== undefined ? customField.defaultEn : customField.default;
          let defAr = customField.defaultAr !== undefined ? customField.defaultAr : customField.default;

          // Normalize array fields to ensure they are arrays and have at least 1 element
          if (f.key === "images") {
            const arrEn = Array.isArray(defEn) ? defEn : [];
            const arrAr = Array.isArray(defAr) ? defAr : [];
            defEn = arrEn.length ? arrEn : [""];
            defAr = arrAr.length ? arrAr : [""];
          } else if (f.key === "eventProgram") {
            const arrEn = Array.isArray(defEn) ? defEn : [];
            const arrAr = Array.isArray(defAr) ? defAr : [];
            defEn = arrEn.length ? arrEn : [{ time: "", title: "" }];
            defAr = arrAr.length ? arrAr : [{ time: "", title: "" }];
          } else if (f.key === "eventDetails") {
            const arrEn = Array.isArray(defEn) ? defEn : [];
            const arrAr = Array.isArray(defAr) ? defAr : [];
            defEn = arrEn.length ? arrEn : [{ text: "" }];
            defAr = arrAr.length ? arrAr : [{ text: "" }];
          }

          return {
            ...f,
            enabled: true,
            labelEn: customField.labelEn !== undefined ? customField.labelEn : (customField.label || f.labelEn),
            labelAr: customField.labelAr !== undefined ? customField.labelAr : (customField.label || f.labelAr),
            defaultEn: defEn,
            defaultAr: defAr,
          };
        } else {
          // Normalize default values when enabling from scratch
          let defEn = f.defaultEn;
          let defAr = f.defaultAr;
          if (f.key === "images") {
            defEn = [""];
            defAr = [""];
          } else if (f.key === "eventProgram") {
            defEn = [{ time: "", title: "" }];
            defAr = [{ time: "", title: "" }];
          } else if (f.key === "eventDetails") {
            defEn = [{ text: "" }];
            defAr = [{ text: "" }];
          }

          return {
            ...f,
            enabled: false,
            defaultEn: defEn,
            defaultAr: defAr,
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
          ? editingLang === "ar"
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
          ? editingLang === "ar"
            ? { ...f, defaultAr: value }
            : { ...f, defaultEn: value }
          : f
      )
    );
  };

  const handleFieldArrayChange = (fieldIndex: number, arrayIndex: number, keyOfObject: string | null, value: string) => {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== fieldIndex) return f;
        const currentVal = editingLang === "ar" ? [...(Array.isArray(f.defaultAr) ? f.defaultAr : [])] : [...(Array.isArray(f.defaultEn) ? f.defaultEn : [])];
        if (keyOfObject) {
          currentVal[arrayIndex] = { ...currentVal[arrayIndex], [keyOfObject]: value };
        } else {
          currentVal[arrayIndex] = value;
        }
        return editingLang === "ar"
          ? { ...f, defaultAr: currentVal }
          : { ...f, defaultEn: currentVal };
      })
    );
  };

  const handleAddFieldArrayItem = (fieldIndex: number, itemTemplate: any) => {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== fieldIndex) return f;
        const currentVal = editingLang === "ar" ? [...(Array.isArray(f.defaultAr) ? f.defaultAr : [])] : [...(Array.isArray(f.defaultEn) ? f.defaultEn : [])];
        currentVal.push(itemTemplate);
        return editingLang === "ar"
          ? { ...f, defaultAr: currentVal }
          : { ...f, defaultEn: currentVal };
      })
    );
  };

  const handleRemoveFieldArrayItem = (fieldIndex: number, arrayIndex: number) => {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== fieldIndex) return f;
        const currentVal = editingLang === "ar" ? [...(Array.isArray(f.defaultAr) ? f.defaultAr : [])] : [...(Array.isArray(f.defaultEn) ? f.defaultEn : [])];
        if (currentVal.length <= 1) return f;
        const filtered = currentVal.filter((_, idx) => idx !== arrayIndex);
        return editingLang === "ar"
          ? { ...f, defaultAr: filtered }
          : { ...f, defaultEn: filtered };
      })
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
        {
          type: string;
          label: string;
          default: any;
          labelAr: string;
          labelEn: string;
          defaultAr: any;
          defaultEn: any;
        }
      > = {};
      fields.forEach((f) => {
        if (f.enabled) {
          let defAr = f.defaultAr;
          let defEn = f.defaultEn;

          // Clean up empty array items before saving
          if (f.key === "images") {
            if (Array.isArray(defAr)) defAr = defAr.filter((val: string) => val.trim() !== "");
            if (Array.isArray(defEn)) defEn = defEn.filter((val: string) => val.trim() !== "");
          } else if (f.key === "eventProgram") {
            if (Array.isArray(defAr)) defAr = defAr.filter((item: any) => item.time.trim() !== "" || item.title.trim() !== "");
            if (Array.isArray(defEn)) defEn = defEn.filter((item: any) => item.time.trim() !== "" || item.title.trim() !== "");
          } else if (f.key === "eventDetails") {
            if (Array.isArray(defAr)) defAr = defAr.filter((item: any) => item.text.trim() !== "");
            if (Array.isArray(defEn)) defEn = defEn.filter((item: any) => item.text.trim() !== "");
          } else {
            if (typeof defAr === "string") defAr = defAr.trim();
            if (typeof defEn === "string") defEn = defEn.trim();
          }

          parsedFields[f.key] = {
            type: f.type,
            label: f.labelAr.trim(),
            default: defAr,
            labelAr: f.labelAr.trim(),
            labelEn: f.labelEn.trim(),
            defaultAr: defAr,
            defaultEn: defEn,
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
        title: form.titleAr.trim(), // fallback
        titleAr: form.titleAr.trim(),
        titleEn: form.titleEn.trim(),
        description: form.descriptionAr.trim(), // fallback
        descriptionAr: form.descriptionAr.trim(),
        descriptionEn: form.descriptionEn.trim(),
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
              ? `تم تحديث القالب "${form.titleAr}" بنجاح!`
              : `Template "${form.titleEn}" updated successfully!`,
        });
      } else {
        await api.post("/templates", body);
        setFeedback({
          type: "success",
          message:
            lang === "ar"
              ? `تم إنشاء القالب "${form.titleAr}" بنجاح!`
              : `Template "${form.titleEn}" created successfully!`,
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
    form.titleAr.trim() !== "" &&
    form.titleEn.trim() !== "" &&
    form.descriptionAr.trim() !== "" &&
    form.descriptionEn.trim() !== "" &&
    form.previewImage.trim() !== "" &&
    form.price.trim() !== "" &&
    !isNaN(parseFloat(form.price)) &&
    parseFloat(form.price) >= 0 &&
    fields.some((f) => f.enabled);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-neutral-800">
      {/* ── Language Switcher Button up ───────────────────────── */}
      <div className="flex justify-end mb-4 font-sans">
        <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E6E2DA] rounded-full shadow-xs">
          <button
            type="button"
            onClick={() => setEditingLang("ar")}
            className={`w-9 h-9 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
              editingLang === "ar"
                ? "bg-[#0B1528] text-[#E5C38B]"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            AR
          </button>
          <button
            type="button"
            onClick={() => setEditingLang("en")}
            className={`w-9 h-9 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
              editingLang === "en"
                ? "bg-[#0B1528] text-[#E5C38B]"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            EN
          </button>
        </div>
      </div>

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
          {editingLang === "ar" ? "اسم القالب (العربية)" : "Template Title (English)"} <span className="text-red-400">*</span>
        </label>
        <input
          id="template-title"
          type="text"
          name={editingLang === "ar" ? "titleAr" : "titleEn"}
          value={editingLang === "ar" ? form.titleAr : form.titleEn}
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
          {editingLang === "ar" ? "وصف القالب (العربية)" : "Description (English)"} <span className="text-red-400">*</span>
        </label>
        <textarea
          id="template-description"
          name={editingLang === "ar" ? "descriptionAr" : "descriptionEn"}
          value={editingLang === "ar" ? form.descriptionAr : form.descriptionEn}
          onChange={handleChange}
          placeholder={editingLang === "ar" ? "أدخل تفاصيل وصف القالب باللغة العربية..." : "Detailed description of the invitation template in English..."}
          disabled={submitting}
          rows={3}
          className="w-full rounded-lg border border-[#EBE7DF] bg-[#FAF9F6] px-4 py-2.5 text-xs text-neutral-800 placeholder-gray-400 outline-none transition-colors focus:border-[#B89C72] disabled:opacity-50 resize-none font-sans"
        />
      </div>

      {/* ── Preview Image Name or URL ───────────────────────── */}
      <div>
        <label
          htmlFor="template-preview"
          className="mb-1.5 block text-xs font-semibold text-gray-700 font-sans"
        >
          {lang === "ar" ? "اسم أو رابط صورة المعاينة" : "Preview Image name or url"} <span className="text-red-400">*</span>
        </label>
        <input
          id="template-preview"
          type="text"
          name="previewImage"
          value={form.previewImage}
          onChange={handleChange}
          placeholder={lang === "ar" ? "مثال: preview.jpg أو /images/preview.jpg" : "e.g. preview.jpg or /images/preview.jpg"}
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
        <div className="flex items-stretch shadow-sm rounded-full overflow-hidden border border-[#EBE7DF]" dir="ltr">
          <span className="flex items-center bg-[#FAF8F5] border-r border-[#EBE7DF] pl-5 pr-3 text-[11px] text-neutral-400 font-semibold select-none">
            {formattedSiteUrl}
          </span>
          <input
            id="template-demo"
            type="text"
            name="demoLink"
            value={form.demoLink}
            onChange={handleChange}
            placeholder="invite/watercolor-garden-wedding"
            disabled={submitting}
            className="w-full bg-white px-5 py-2.5 text-xs outline-none focus:border-[#B89C72] transition-all text-neutral-800 placeholder-gray-400"
          />
        </div>
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
            const label = editingLang === "ar" ? f.labelAr : f.labelEn;
            const defaultValue = editingLang === "ar" ? f.defaultAr : f.defaultEn;
            const isArrayField = f.key === "images" || f.key === "eventProgram" || f.key === "eventDetails";

            return (
              <div
                key={f.key}
                className={`rounded-xl border p-3.5 transition-all duration-300 ${
                  isArrayField ? "col-span-full" : ""
                } ${
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
                        ? editingLang === "ar"
                          ? "اسم العريس (Husband)"
                          : "Husband's Name (Groom)"
                        : f.key === "brideName"
                        ? editingLang === "ar"
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
                  <div className="mt-3.5 pt-3 border-t border-[#FAF1EA] space-y-3.5 animate-fadeIn">
                    {!isArrayField ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                            {editingLang === "ar" ? "التسمية باللغة العربية (Label)" : "Label (English)"}
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
                            {editingLang === "ar" ? "الافتراضي باللغة العربية (Default)" : "Default Value (English)"}
                          </label>
                          <input
                            type="text"
                            value={typeof defaultValue === "string" ? defaultValue : ""}
                            onChange={(e) => handleFieldDefaultChange(i, e.target.value)}
                            placeholder="Default"
                            disabled={submitting}
                            className="w-full rounded-md border border-[#EBE7DF] bg-[#FAF9F6] px-2.5 py-1.5 text-[10px] text-neutral-850 outline-none focus:border-[#B89C72]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="max-w-md">
                          <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                            {editingLang === "ar" ? "التسمية باللغة العربية (Label)" : "Label (English)"}
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

                        {/* Array item builder */}
                        <div className="border border-[#F4F1EA] bg-[#FAF8F5] rounded-xl p-3 space-y-2">
                          <span className="block text-[9px] font-bold text-neutral-450 uppercase tracking-wider mb-1.5">
                            {editingLang === "ar" ? "العناصر الافتراضية (العربية)" : "Default Items List (English)"}
                          </span>
                          
                          {f.key === "images" && Array.isArray(defaultValue) && (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              {defaultValue.map((url: string, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => handleFieldArrayChange(i, idx, null, e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    disabled={submitting}
                                    className="w-full rounded-full border border-[#EBE7DF] bg-white px-4 py-2 text-xs text-neutral-850 outline-none focus:border-[#B89C72]"
                                  />
                                  {defaultValue.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFieldArrayItem(i, idx)}
                                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 transition-colors text-neutral-400 cursor-pointer shadow-xs text-xs"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleAddFieldArrayItem(i, "")}
                                className="text-[9px] font-bold text-[#B89C72] hover:text-[#A3875D] transition-colors"
                              >
                                {lang === "ar" ? "+ إضافة صورة" : "+ Add image URL"}
                              </button>
                            </div>
                          )}

                          {f.key === "eventProgram" && Array.isArray(defaultValue) && (
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {defaultValue.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input
                                    type="time"
                                    value={item.time || ""}
                                    onChange={(e) => handleFieldArrayChange(i, idx, "time", e.target.value)}
                                    disabled={submitting}
                                    className="w-[125px] shrink-0 rounded-full border border-[#EBE7DF] bg-white px-4 py-2 text-xs text-neutral-850 outline-none focus:border-[#B89C72] text-center"
                                  />
                                  <input
                                    type="text"
                                    value={item.title || ""}
                                    onChange={(e) => handleFieldArrayChange(i, idx, "title", e.target.value)}
                                    placeholder={editingLang === "ar" ? "مثال: استقبال الضيوف" : "e.g. Reception"}
                                    disabled={submitting}
                                    className="w-full rounded-full border border-[#EBE7DF] bg-white px-4 py-2 text-xs text-neutral-850 outline-none focus:border-[#B89C72]"
                                  />
                                  {defaultValue.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFieldArrayItem(i, idx)}
                                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 transition-colors text-neutral-400 cursor-pointer shadow-xs text-xs"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleAddFieldArrayItem(i, { time: "", title: "" })}
                                className="text-[9px] font-bold text-[#B89C72] hover:text-[#A3875D] transition-colors"
                              >
                                {lang === "ar" ? "+ إضافة فقرة للبرنامج" : "+ Add program item"}
                              </button>
                            </div>
                          )}

                          {f.key === "eventDetails" && Array.isArray(defaultValue) && (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              {defaultValue.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={item.text || ""}
                                    onChange={(e) => handleFieldArrayChange(i, idx, "text", e.target.value)}
                                    placeholder={editingLang === "ar" ? "مثال: يمنع اصطحاب الأطفال" : "e.g. No kids allowed"}
                                    disabled={submitting}
                                    className="w-full rounded-full border border-[#EBE7DF] bg-white px-4 py-2 text-xs text-neutral-850 outline-none focus:border-[#B89C72]"
                                  />
                                  {defaultValue.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFieldArrayItem(i, idx)}
                                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 transition-colors text-neutral-400 cursor-pointer shadow-xs text-xs"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleAddFieldArrayItem(i, { text: "" })}
                                className="text-[9px] font-bold text-[#B89C72] hover:text-[#A3875D] transition-colors"
                              >
                                {lang === "ar" ? "+ إضافة تفصيل/تعليمات" : "+ Add detail item"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
