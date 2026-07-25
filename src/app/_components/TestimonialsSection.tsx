"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

export interface TestimonialItem {
  id: string;
  rating: number;
  comment: string;
  clientInitials: string;
  clientName: string;
  eventTitle: string;
}

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
}

const ITEMS_PER_PAGE = 6;

export default function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const { t, lang } = useLanguage();
  const [currentPage, setCurrentPage] = useState(0);

  if (!testimonials || testimonials.length === 0) return null;

  const totalPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE);
  const validPage = Math.min(currentPage, Math.max(0, totalPages - 1));

  const currentTestimonials = testimonials.slice(
    validPage * ITEMS_PER_PAGE,
    (validPage + 1) * ITEMS_PER_PAGE
  );

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  return (
    <section id="pricing" className="px-4 sm:px-10 py-10 sm:py-16 bg-white border-t border-[#E6E2DA]">
      <div className="max-w-[1700px] mx-auto flex flex-col gap-6 sm:gap-10 relative">
        <div className="text-center flex flex-col gap-1">
          <h2 className="text-xl sm:text-[26px] font-serif font-medium text-neutral-800">
            {t("Testimonials")}
          </h2>
        </div>

        <div className="relative w-full">
          {/* Testimonial grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 ${
              totalPages > 1 ? "px-0 sm:px-12" : ""
            }`}
          >
            {currentTestimonials.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E9E4DC] p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-4 sm:gap-6 hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-2">
                  {/* Rating stars display */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span
                        key={idx}
                        className={
                          idx < item.rating
                            ? "text-amber-400 text-xs animate-pulse"
                            : "text-neutral-200 text-xs"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p
                    className={`text-xs italic text-[#7F8487] leading-relaxed ${
                      lang === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {item.comment}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#EBE7DF] overflow-hidden flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-neutral-600">
                      {item.clientInitials}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2D3142]">
                      {item.clientName}
                    </h4>
                    <span className="text-[10px] text-[#7F8487] block -mt-0.5">
                      {item.eventTitle}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          {totalPages > 1 && (
            <>
              {/* Left navigation arrow */}
              <button
                onClick={handlePrev}
                className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-[#E9E4DC] shadow-sm items-center justify-center hover:bg-neutral-50 hover:shadow transition-all shrink-0 cursor-pointer z-10"
                aria-label="Previous testimonials"
              >
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Right navigation arrow */}
              <button
                onClick={handleNext}
                className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-[#E9E4DC] shadow-sm items-center justify-center hover:bg-neutral-50 hover:shadow transition-all shrink-0 cursor-pointer z-10"
                aria-label="Next testimonials"
              >
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Pagination dots */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                aria-label={`Go to page ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer border-0 ${
                  validPage === idx
                    ? "w-5 h-1.5 bg-[#2D3142]"
                    : "w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
