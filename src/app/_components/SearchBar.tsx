"use client";

import { useLanguage } from "@/components/LanguageContext";
import { CATEGORIES } from "@/constants/categories";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  showEventTypesOverlay: boolean;
  setShowEventTypesOverlay: (show: boolean) => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  showEventTypesOverlay,
  setShowEventTypesOverlay,
}: SearchBarProps) {
  const { t, lang } = useLanguage();

  return (
    <section className="px-4 sm:px-10 py-3 sm:py-4 sticky top-16 sm:top-20 bg-[#FAF9F6] z-30">
      <div className="max-w-xl mx-auto relative">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder={t("Search templates...")}
            value={searchQuery}
            onFocus={() => setShowEventTypesOverlay(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-10 py-2.5 bg-white border border-[#E6E2DA] rounded-full text-xs shadow-sm focus:outline-none focus:border-[#B89C72] focus:ring-1 focus:ring-[#B89C72] transition-all ${
              lang === "ar" ? "text-right" : "text-left"
            }`}
            dir={lang === "ar" ? "rtl" : "ltr"}
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-[#7F8487]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Event Types Dropdown Button */}
          <button
            onClick={() => setShowEventTypesOverlay(!showEventTypesOverlay)}
            className="absolute left-3 w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E6E2DA] flex items-center justify-center text-xs text-[#7F8487] hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
            title="Event Types"
            aria-label="Toggle categories dropdown"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
        </div>

        {/* "Event Types" Dropdown Card Overlay */}
        {showEventTypesOverlay && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowEventTypesOverlay(false)}
            />
            <div
              className="absolute top-14 left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] max-w-[420px] bg-white border border-[#E6E2DA] rounded-2xl shadow-xl p-4 sm:p-5 z-50 animate-fadeIn text-right font-sans"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-neutral-800">
                  {t("Event Types")}
                </span>
                <button
                  onClick={() => setShowEventTypesOverlay(false)}
                  className="text-neutral-400 hover:text-black text-sm cursor-pointer"
                  aria-label="Close categories dropdown"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const isActive =
                    cat.name === "All"
                      ? selectedCategory === null
                      : selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => {
                        if (cat.name === "All") {
                          setSelectedCategory(null);
                        } else {
                          setSelectedCategory(
                            selectedCategory === cat.name ? null : cat.name
                          );
                        }
                        setShowEventTypesOverlay(false);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-3 border rounded-xl hover:bg-neutral-50 transition-all cursor-pointer ${
                        isActive
                          ? "border-[#B89C72] bg-[#FAF8F5] font-semibold text-black"
                          : "border-neutral-200 text-neutral-600 bg-white"
                      }`}
                    >
                      {cat.icon}
                      <span className="text-[10px] whitespace-normal text-center leading-tight max-w-[85px]">
                        {t(cat.name)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
