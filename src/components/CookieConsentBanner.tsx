"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageContext";

export default function CookieConsentBanner() {
  const { lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  if (!mounted || !visible) return null;

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-changed"));
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-changed"));
  };

  const isAr = lang === "ar";

  const t = {
    title: isAr ? "إشعار ملفات تعريف الارتباط" : "Cookie Preferences",
    desc: isAr
      ? "تستخدم منصة معزوم ملفات تعريف الارتباط لتحسين تجربتك وتوفير ميزات مخصصة وضمان عمل الموقع بشكل صحيح."
      : "Mazoom uses cookies to improve your experience, provide personalized features, and ensure the website functions properly.",
    acceptBtn: isAr ? "قبول الكل" : "Accept All",
    declineBtn: isAr ? "رفض" : "Decline",
  };

  return (
    <div
      className="fixed bottom-6 left-6 right-6 md:right-auto md:max-w-md z-50 animate-fadeIn"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="bg-[#0B1528] text-white border border-[#E5C38B]/20 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden font-sans">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#E5C38B] opacity-10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start gap-3">
          {/* Cookie Icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E5C38B]/10 text-[#E5C38B]">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 100-2 1 1 0 000 2zM15 11a1 1 0 100-2 1 1 0 000 2zM12 14a1 1 0 100-2 1 1 0 000 2zM9 16a1 1 0 100-2 1 1 0 000 2zM15 16a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-serif font-bold text-[#E5C38B]">
              {t.title}
            </h4>
            <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">
              {t.desc}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 bg-[#E5C38B] text-[#0B1528] font-bold text-[10px] py-2 px-3 rounded-lg shadow-sm hover:bg-[#d6b377] transition-all cursor-pointer text-center"
          >
            {t.acceptBtn}
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 border border-neutral-600 hover:border-neutral-400 text-neutral-300 font-bold text-[10px] py-2 px-3 rounded-lg transition-all cursor-pointer text-center"
          >
            {t.declineBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
