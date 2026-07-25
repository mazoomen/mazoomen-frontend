"use client";

import { useLanguage } from "@/components/LanguageContext";
import { Button } from "@/components/ui";

interface HeroBannerProps {
  onExploreClick: () => void;
  onRegisterClick: () => void;
}

export default function HeroBanner({
  onExploreClick,
  onRegisterClick,
}: HeroBannerProps) {
  const { t } = useLanguage();

  return (
    <section className="px-3 sm:px-10 pt-4 sm:pt-8 pb-3">
      <div
        className="max-w-[1700px] mx-auto rounded-[24px] sm:rounded-[32px] border border-[#1E2E4A] p-6 sm:p-16 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[340px] sm:min-h-[460px] bg-cover bg-center shadow-lg animate-fadeIn"
        style={{ backgroundImage: "url('/images/hero-couple.jpg')" }}
      >
        {/* Dark Navy overlay to make text pop */}
        <div className="absolute inset-0 bg-[#0B1528]/70 backdrop-blur-[0.5px] pointer-events-none" />

        {/* Center Brand content */}
        <div className="max-w-2xl flex flex-col items-center gap-4 sm:gap-5 z-20">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] text-[#E5C38B] font-bold uppercase font-sans">
              {t("DIGITAL WEDDING PLANNER")}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-medium tracking-wide text-[#E5C38B] drop-shadow-md select-none mt-1 sm:mt-2 leading-tight">
              {t("DIGITAL WEDDING PLANNER")}
            </h1>
            <p className="text-xs sm:text-xs text-neutral-300 font-sans tracking-wide max-w-xs sm:max-w-md mx-auto leading-relaxed mt-2 sm:mt-3 px-2">
              {t(
                "A romantic design performs and wedded wedding template with elegant anniversaries."
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-3 items-center justify-center mt-2 sm:mt-3 w-full sm:w-auto px-2">
            <Button
              variant="secondary"
              size="md"
              onClick={onExploreClick}
              className="!text-[#E5C38B] !border-[#E5C38B] hover:!bg-[#E5C38B]/10 !rounded-full !text-xs sm:!text-[11px] !px-5 !py-2 flex-1 sm:flex-initial max-w-[140px] sm:max-w-none"
            >
              {t("Explore Now")}
            </Button>
            <Button
              variant="gold"
              size="md"
              onClick={onRegisterClick}
              className="!rounded-full !text-xs sm:!text-[11px] !px-5 !py-2 flex-1 sm:flex-initial max-w-[140px] sm:max-w-none"
            >
              {t("Register Now")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
