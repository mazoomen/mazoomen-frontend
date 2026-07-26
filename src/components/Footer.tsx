"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import ContactModal from "@/components/ContactModal";

interface FooterProps {
  onOpenAuth?: (mode: "login" | "register") => void;
  onOpenContact?: () => void;
}

export default function Footer({ onOpenAuth, onOpenContact }: FooterProps) {
  const { t, lang } = useLanguage();
  const { isLoggedIn } = useAuth();
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onOpenAuth?.("login");
      return;
    }

    if (onOpenContact) {
      onOpenContact();
    } else {
      setIsContactOpen(true);
    }
  };

  return (
    <>
      <footer className="bg-[#FAF8F5] border-t border-[#E6E2DA] px-6 sm:px-10 py-16 mt-auto">
        <div className="max-w-[1700px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-xs mb-12" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-neutral-800 text-[13px] tracking-wide uppercase">
              {lang === "ar" ? "استكشف" : "Explore"}
            </h4>
            <nav className="flex flex-col gap-2.5 text-neutral-500 font-medium">
              <a href="/" className="hover:text-black transition-colors">{lang === "ar" ? "الرئيسية" : "Home"}</a>
              <a href="#templates" className="hover:text-black transition-colors">{lang === "ar" ? "القوالب" : "Templates"}</a>
              <a href="#features" className="hover:text-black transition-colors">{lang === "ar" ? "المميزات" : "Features"}</a>
              <a href="#pricing" className="hover:text-black transition-colors">{lang === "ar" ? "آراء العملاء" : "Testimonials"}</a>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-neutral-800 text-[13px] tracking-wide uppercase">
              {lang === "ar" ? "الحساب" : "Account"}
            </h4>
            <nav className="flex flex-col gap-2.5 text-neutral-500 font-medium">
              {isLoggedIn ? (
                <>
                  <a href="/dashboard/client" className="hover:text-black transition-colors">{lang === "ar" ? "لوحة التحكم" : "Dashboard"}</a>
                  <a href="/profile" className="hover:text-black transition-colors">{lang === "ar" ? "الملف الشخصي" : "Profile"}</a>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onOpenAuth?.("login")}
                    className="text-left hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0 text-xs text-neutral-500 font-medium w-full"
                  >
                    {t("Login")}
                  </button>
                  <button
                    onClick={() => onOpenAuth?.("register")}
                    className="text-left hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0 text-xs text-neutral-500 font-medium w-full"
                  >
                    {t("Register")}
                  </button>
                </>
              )}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-neutral-800 text-[13px] tracking-wide uppercase">
              {lang === "ar" ? "الدعم" : "Support"}
            </h4>
            <nav className="flex flex-col gap-2.5 text-neutral-500 font-medium">
              <button
                onClick={handleContactClick}
                className="text-left rtl:text-right hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0 text-xs text-neutral-500 font-medium w-full"
              >
                {lang === "ar" ? "تواصل معنا" : "Contact Us"}
              </button>
              <a href="#" className="hover:text-black transition-colors">{lang === "ar" ? "التعليمات" : "FAQs"}</a>
            </nav>
          </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-neutral-800 text-[13px] tracking-wide uppercase">
            {lang === "ar" ? "تابعنا" : "Follow Us"}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <a href="#" className="w-7 h-7 rounded-full bg-neutral-200 hover:bg-black hover:text-white transition-all flex items-center justify-center text-neutral-600 shadow-sm" aria-label="Instagram">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="#" className="w-7 h-7 rounded-full bg-neutral-200 hover:bg-black hover:text-white transition-all flex items-center justify-center text-neutral-600 shadow-sm" aria-label="Facebook">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a href="#" className="w-7 h-7 rounded-full bg-neutral-200 hover:bg-black hover:text-white transition-all flex items-center justify-center text-neutral-600 shadow-sm" aria-label="Twitter">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto pt-8 border-t border-[#E6E2DA] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-neutral-400 font-medium" dir={lang === "ar" ? "rtl" : "ltr"}>
        <p>&copy; {new Date().getFullYear()} Mazoomen. {lang === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-black transition-colors">{lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</a>
          <a href="#" className="hover:text-black transition-colors">{lang === "ar" ? "شروط الخدمة" : "Terms of Service"}</a>
        </div>
      </div>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </footer>
    </>
  );
}
