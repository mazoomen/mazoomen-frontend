"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageContext";
import { useCurrency } from "./CurrencyContext";
import { Button } from "./ui";

export default function LocationPromptBanner() {
  const { lang } = useLanguage();
  const { currency, permissionStatus, requestLocationPermission, setDefaultCurrency, changeCurrencyManually, availableRates } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [showManualPicker, setShowManualPicker] = useState(false);
  const [cookieConsentCompleted, setCookieConsentCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkConsent = () => {
      const consent = localStorage.getItem("cookie_consent");
      setCookieConsentCompleted(!!consent);
    };

    checkConsent();

    window.addEventListener("cookie-consent-changed", checkConsent);
    return () => {
      window.removeEventListener("cookie-consent-changed", checkConsent);
    };
  }, []);

  if (!mounted) return null;
  if (!cookieConsentCompleted) return null;
  if (permissionStatus !== "prompt") return null;

  const handleAllow = async () => {
    await requestLocationPermission();
  };

  const handleDeny = () => {
    setDefaultCurrency();
  };

  const isAr = lang === "ar";

  const t = {
    title: isAr ? "تخصيص العملة المحلية" : "Currency Localization",
    desc: isAr
      ? "تستخدم منصة معزوم موقعك الجغرافي لعرض تفاصيل الأسعار بعملة بلدك المحلية."
      : "Mazoom uses your location to display prices in your local currency.",
    allowBtn: isAr ? "السماح بالوصول للموقع" : "Allow Location Access",
    useJod: isAr ? "متابعة بالدينار الأردني" : "Use Jordanian Dinar",
    orChoose: isAr ? "أو اختر العملة يدوياً" : "Or select manually",
  };

  return (
    <div
      className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-50 animate-fadeIn"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="bg-[#0B1528] text-white border border-[#E5C38B]/20 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden font-sans">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#E5C38B] opacity-10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start gap-3">
          {/* Map/Location Icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E5C38B]/10 text-[#E5C38B]">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
            </svg>
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-serif font-bold text-[#E5C38B]">
              {t.title}
            </h4>
            <p className="text-[10px] text-neutral-300 leading-relaxed">
              {t.desc}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {/* Main Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAllow}
              className="flex-1 bg-[#E5C38B] text-[#0B1528] font-bold text-[10px] py-2 px-3 rounded-lg shadow-sm hover:bg-[#d6b377] transition-all cursor-pointer text-center"
            >
              {t.allowBtn}
            </button>
            <button
              onClick={handleDeny}
              className="flex-1 border border-neutral-600 hover:border-neutral-400 text-neutral-300 font-bold text-[10px] py-2 px-3 rounded-lg transition-all cursor-pointer text-center"
            >
              {t.useJod}
            </button>
          </div>

          {/* Manual Currency Trigger */}
          <div className="text-center pt-1">
            <button
              onClick={() => setShowManualPicker(!showManualPicker)}
              className="text-[9px] text-[#E5C38B] hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              {t.orChoose}
            </button>
          </div>

          {/* Manual Selector Dropdown */}
          {showManualPicker && (
            <div className="mt-2 pt-2 border-t border-neutral-800 flex gap-2 items-center justify-between animate-fadeIn">
              <span className="text-[9px] text-neutral-400 font-bold">
                {isAr ? "العملة:" : "Currency:"}
              </span>
              <select
                onChange={(e) => changeCurrencyManually(e.target.value)}
                className="text-[10px] font-bold bg-[#14233C] border border-neutral-700 rounded-md px-2 py-1 outline-none text-[#E5C38B] cursor-pointer"
                value={currency}
              >
                {Object.keys(availableRates).map((cCode) => (
                  <option key={cCode} value={cCode}>
                    {cCode}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
