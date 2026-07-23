"use client";

import { useLanguage } from "@/components/LanguageContext";

export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="features" className="px-4 sm:px-10 py-10 sm:py-16 bg-white border-t border-b border-[#E6E2DA]">
      <div className="max-w-[1700px] mx-auto flex flex-col gap-6 sm:gap-10">
        <div className="text-center flex flex-col gap-1.5">
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-neutral-800">
            {t("How It Works")}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-8 items-stretch">
          {/* Couple Illustration */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 flex justify-center items-center bg-[#FAF8F5] border border-[#E9E4DC] rounded-3xl p-4 sm:p-6 shadow-sm h-36 sm:h-48 w-full max-w-[240px] mx-auto shrink-0">
            <svg
              className="w-24 h-24 sm:w-32 sm:h-32 text-[#B89C72]"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="60" cy="60" r="45" fill="#F4EDE1" />
              <path
                d="M60 48C60 48 57 41 50 41C44 41 40 45 40 51C40 59 60 70 60 70C60 70 80 59 80 51C80 45 76 41 70 41C63 41 60 48 60 48Z"
                fill="#E8DCC4"
              />
              <path
                d="M48 90C48 78 54 74 60 74C66 74 72 78 72 90"
                stroke="#5C4D37"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="60" cy="65" r="5" fill="#5C4D37" />
              <path
                d="M25 80C30 75 35 78 37 85"
                stroke="#B89C72"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="37" cy="85" r="2" fill="#B89C72" />
              <path
                d="M95 80C90 75 85 78 83 85"
                stroke="#B89C72"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="83" cy="85" r="2" fill="#B89C72" />
            </svg>
          </div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center gap-2 sm:gap-3 p-3 sm:p-0 rounded-2xl sm:rounded-none bg-neutral-50/50 sm:bg-transparent border border-neutral-100 sm:border-0 justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm shrink-0">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-xs sm:text-sm text-neutral-800">
              {t("Select a Design")}
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-400 max-w-[200px] leading-relaxed">
              {t(
                "Curate your design layout by browsing and selecting from our premium template gallery."
              )}
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center gap-2 sm:gap-3 p-3 sm:p-0 rounded-2xl sm:rounded-none bg-neutral-50/50 sm:bg-transparent border border-neutral-100 sm:border-0 justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm shrink-0">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5M3.75 6h16.5a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-9a1.5 1.5 0 011.5-1.5z"
                />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-xs sm:text-sm text-neutral-800">
              {t("Pay & Unlock")}
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-400 max-w-[200px] leading-relaxed">
              {t(
                "Pay securely online using KNET, Mada, Credit Card, or Apple Pay to immediately activate your template."
              )}
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center gap-2 sm:gap-3 p-3 sm:p-0 rounded-2xl sm:rounded-none bg-neutral-50/50 sm:bg-transparent border border-neutral-100 sm:border-0 justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm shrink-0">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-xs sm:text-sm text-neutral-800">
              {t("Customize Details")}
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-400 max-w-[200px] leading-relaxed">
              {t(
                "Personalize event date, location coordinates, program timeline, background music, and guidelines on your dashboard."
              )}
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center gap-2 sm:gap-3 p-3 sm:p-0 rounded-2xl sm:rounded-none bg-neutral-50/50 sm:bg-transparent border border-neutral-100 sm:border-0 justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm shrink-0">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-xs sm:text-sm text-neutral-800">
              {t("Share & Track RSVPs")}
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-400 max-w-[200px] leading-relaxed">
              {t(
                "Share your interactive invitation link to gather real-time RSVPs, beautiful wishes, and photos from your guests."
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
