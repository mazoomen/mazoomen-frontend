"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getS3Url } from '@/lib/s3';
import { useLanguage } from "@/components/LanguageContext";
import { useCurrency } from "@/components/CurrencyContext";
import type { Template } from "@/types/template";
import { Spinner, Button } from "@/components/ui";

interface TemplateGridProps {
  templates: Template[];
  loading: boolean;
  selectedCategory: string | null;
  isLoggedIn: boolean;
  onPurchaseClick: (template: Template) => void;
  onLoginTrigger: () => void;
}

export default function TemplateGrid({
  templates,
  loading,
  selectedCategory,
  isLoggedIn,
  onPurchaseClick,
  onLoginTrigger,
}: TemplateGridProps) {
  const { t, lang } = useLanguage();
  const { formatPrice } = useCurrency();
  const isRtl = lang === "ar";

  // Sorting state
  const [sortOption, setSortOption] = useState<"newest" | "price-asc" | "price-desc" | "name-asc">("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset to page 1 when templates or sort option or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [templates.length, sortOption, selectedCategory]);

  // Sort templates
  const sortedTemplates = [...templates].sort((a, b) => {
    if (sortOption === "price-asc") {
      return Number(a.price) - Number(b.price);
    }
    if (sortOption === "price-desc") {
      return Number(b.price) - Number(a.price);
    }
    if (sortOption === "name-asc") {
      return (a.title || "").localeCompare(b.title || "");
    }
    return 0; // default / newest
  });

  // Calculate pagination slices
  const totalItems = sortedTemplates.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(totalItems, currentPage * itemsPerPage);
  const paginatedTemplates = sortedTemplates.slice(startIndex, endIndex);

  return (
    <section id="templates" className="px-4 sm:px-10 py-6 max-w-[1700px] mx-auto w-full flex-1 font-sans">
      <div className="w-full flex flex-col gap-6">
        {/* Header Bar: Category Label & Sorting Dropdown */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EBE7DF] pb-4"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Summary / Category Info */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-neutral-600">
            {selectedCategory && (
              <span className="text-[11px] text-[#B89C72] bg-[#FAF8F5] px-3 py-1 rounded-lg border border-[#EBE7DF] font-bold">
                {t("Category")}: {t(selectedCategory)}
              </span>
            )}
            {!loading && totalItems > 0 && (
              <span className="text-neutral-500 text-xs font-medium">
                {isRtl
                  ? `عرض ${startIndex + 1}–${endIndex} من أصل ${totalItems} قالب`
                  : `Showing ${startIndex + 1}–${endIndex} of ${totalItems} templates`}
              </span>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <label htmlFor="sortSelect" className="text-xs font-bold text-neutral-600 shrink-0">
              {isRtl ? "ترتيب حسب:" : "Sort by:"}
            </label>
            <select
              id="sortSelect"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-[#EBE7DF] rounded-xl text-xs font-semibold text-[#0B1528] focus:outline-none focus:border-[#B89C72] cursor-pointer"
            >
              <option value="newest">{isRtl ? "الأحدث" : "Newest"}</option>
              <option value="price-asc">{isRtl ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</option>
              <option value="price-desc">{isRtl ? "السعر: من الأعلى للأقل" : "Price: High to Low"}</option>
              <option value="name-asc">{isRtl ? "الاسم: أ-ي" : "Name: A-Z"}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner label={t("Loading templates...")} />
          </div>
        ) : paginatedTemplates.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#EBE7DF] rounded-2xl shadow-xs">
            <p className="text-[#7F8487] font-medium text-xs">
              {isRtl ? "لا توجد قوالب تطابق خيارات البحث." : "No templates match your search."}
            </p>
          </div>
        ) : (
          /* Grid: 2 Columns on Phone (grid-cols-2), 2 on SM, 3 on MD, 4 on LG */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {paginatedTemplates.map((template) => (
              <article
                key={template.id}
                className="bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                {/* Premium Badge */}
                {template.isPremium && (
                  <span className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 bg-neutral-800 text-white text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded z-10 tracking-wider shadow-sm uppercase">
                    Premium
                  </span>
                )}

                {/* Template Image Section */}
                <div className="w-full aspect-[4/3] bg-[#FAF8F5] p-2 sm:p-3 flex items-center justify-center overflow-hidden shrink-0 border-b border-[#F0ECE3] relative">
                  <div className="w-full h-full rounded-lg overflow-hidden shadow-sm relative">
                    <Image
                      src={getS3Url(template.previewImage)}
                      alt={t(template.title)}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-[1.04] transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Template Details */}
                <div
                  className={`p-2.5 sm:p-4 flex-1 flex flex-col justify-between gap-2.5 font-sans ${
                    isRtl ? "text-right" : "text-left"
                  }`}
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="font-bold text-neutral-800 text-xs sm:text-[13px] leading-snug group-hover:text-black transition-colors line-clamp-1">
                        {template.title}
                      </h3>
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-neutral-700 border border-neutral-200 px-1.5 py-0.5 rounded bg-[#FAF9F6] shrink-0 font-sans">
                        {formatPrice(template.price)}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {t(template.description)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex flex-col xs:flex-row gap-1.5 sm:gap-2">
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
                        className="flex-1 !rounded-xl !text-[10px] sm:!text-[11px] !py-1.5"
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
                              isRtl
                                ? "لا تتوفر معاينة لهذا القالب حالياً."
                                : "No demo link available for this template."
                            );
                          }
                        }}
                        className="flex-1 !rounded-xl !text-[10px] sm:!text-[11px] !py-1.5"
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

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div
            className="flex items-center justify-center gap-2 pt-6 pb-2 border-t border-[#EBE7DF] mt-4"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Previous Page Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                currentPage === 1
                  ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                  : "bg-[#FAF8F5] text-[#0B1528] border-[#EBE7DF] hover:bg-[#0B1528] hover:text-[#E5C38B]"
              }`}
            >
              <span>{isRtl ? "→" : "←"}</span>
              <span>{isRtl ? "السابق" : "Previous"}</span>
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === page
                      ? "bg-[#0B1528] text-[#E5C38B] border border-[#1E2E4A] shadow-xs"
                      : "bg-[#FAF8F5] text-neutral-600 border border-[#EBE7DF] hover:bg-neutral-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Page Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                currentPage === totalPages
                  ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                  : "bg-[#FAF8F5] text-[#0B1528] border-[#EBE7DF] hover:bg-[#0B1528] hover:text-[#E5C38B]"
              }`}
            >
              <span>{isRtl ? "التالي" : "Next"}</span>
              <span>{isRtl ? "←" : "→"}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

