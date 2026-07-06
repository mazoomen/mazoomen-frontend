"use client";

import Image from "next/image";
import { useLanguage } from "@/components/LanguageContext";
import { useCurrency } from "@/components/CurrencyContext";
import type { Template } from "@/types/template";
import { Spinner, Button } from "@/components/ui";

interface TemplateGridProps {
  templates: Template[];
  loading: boolean;
  selectedTab: "all" | "ready";
  setSelectedTab: (tab: "all" | "ready") => void;
  selectedCategory: string | null;
  isLoggedIn: boolean;
  onPurchaseClick: (template: Template) => void;
  onLoginTrigger: () => void;
}

export default function TemplateGrid({
  templates,
  loading,
  selectedTab,
  setSelectedTab,
  selectedCategory,
  isLoggedIn,
  onPurchaseClick,
  onLoginTrigger,
}: TemplateGridProps) {
  const { t, lang } = useLanguage();
  const { formatPrice } = useCurrency();

  return (
    <section id="templates" className="px-6 sm:px-10 py-6 max-w-[1700px] mx-auto w-full flex-1">
      <div className="w-full flex flex-col gap-6">
        {/* Tab Selector & Header */}
        <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab("all")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                selectedTab === "all"
                  ? "bg-[#0B1528] text-[#E5C38B] border border-[#1E2E4A]"
                  : "bg-[#FAF8F5] text-[#7F8487] border border-[#EBE7DF] hover:bg-neutral-50"
              }`}
            >
              {t("الكل")}
            </button>
            <button
              onClick={() => setSelectedTab("ready")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                selectedTab === "ready"
                  ? "bg-[#0B1528] text-[#E5C38B] border border-[#1E2E4A]"
                  : "bg-[#FAF8F5] text-[#7F8487] border border-[#EBE7DF] hover:bg-neutral-50"
              }`}
            >
              {t("جاهزة للتعديل")}
            </button>
          </div>
          {selectedCategory && (
            <span className="text-[11px] text-[#B89C72] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#EBE7DF] font-semibold">
              {t("Category")}: {t(selectedCategory)}
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner label={t("Loading templates...")} />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#EBE7DF] rounded-2xl shadow-xs">
            <p className="text-[#7F8487] font-medium text-xs">
              {t("لا توجد قوالب تطابق خيارات البحث.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <article
                key={template.id}
                className="bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                {/* Premium Badge */}
                {template.isPremium && (
                  <span className="absolute top-4 left-4 bg-neutral-800 text-white text-[9px] font-bold px-2 py-0.5 rounded z-10 tracking-wider shadow-sm uppercase">
                    Premium
                  </span>
                )}

                {/* Template Image Section */}
                <div className="w-full aspect-[4/3.2] bg-[#FAF8F5] p-3 flex items-center justify-center overflow-hidden shrink-0 border-b border-[#F0ECE3] relative">
                  <div className="w-full h-full rounded-lg overflow-hidden shadow-sm relative">
                    <Image
                      src={template.previewImage}
                      alt={t(template.title)}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-[1.04] transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Template Details */}
                <div
                  className={`p-4 flex-1 flex flex-col justify-between gap-3 font-sans ${
                    lang === "ar" ? "text-right" : "text-left"
                  }`}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-neutral-800 text-[13px] leading-tight group-hover:text-black transition-colors line-clamp-1">
                        {template.title}
                      </h3>
                      <span className="text-[11px] font-bold text-neutral-600 border border-neutral-200 px-1.5 py-0.5 rounded bg-[#FAF9F6] shrink-0 font-sans">
                        {formatPrice(template.price)}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {t(template.description)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          if (!isLoggedIn) {
                            onLoginTrigger();
                            return;
                          }
                          onPurchaseClick(template);
                        }}
                        className="flex-1 !rounded-xl !text-[11px]"
                      >
                        {t("Purchase")}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (template.demoLink) {
                            const siteUrl =
                              process.env.NEXT_PUBLIC_SITE_URL ||
                              (typeof window !== "undefined"
                                ? window.location.origin
                                : "http://localhost:3001");
                            const formattedSiteUrl = siteUrl.endsWith("/")
                              ? siteUrl
                              : `${siteUrl}/`;
                            const fullUrl = template.demoLink.startsWith("http")
                              ? template.demoLink
                              : `${formattedSiteUrl}${
                                  template.demoLink.startsWith("/")
                                    ? template.demoLink.slice(1)
                                    : template.demoLink
                                }`;
                            window.open(fullUrl, "_blank");
                          } else {
                            alert(
                              lang === "ar"
                                ? "لا تتوفر معاينة لهذا القالب حالياً."
                                : "No demo link available for this template."
                            );
                          }
                        }}
                        className="flex-1 !rounded-xl !text-[11px]"
                      >
                        {t("Preview")}
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
