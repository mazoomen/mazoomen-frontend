"use client";

import { useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import AuthModal from "@/components/AuthModal";
import ContactModal from "@/components/ContactModal";
import Footer from "@/components/Footer";
import FAQSection from "@/app/_components/FAQSection";
import { useLanguage } from "@/components/LanguageContext";

export default function FAQPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  // Popup Modal Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Contact Modal State
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <PageLayout>
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAF8F5]">
        {/* Breadcrumb Header Banner */}
        <div className="bg-[#0B1528] text-white border-b border-[#1E2E4A] py-10 sm:py-14 px-4 sm:px-10">
          <div
            className="max-w-[1200px] mx-auto flex flex-col gap-3"
            dir={isAr ? "rtl" : "ltr"}
          >
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Link href="/" className="hover:text-[#E5C38B] transition-colors">
                {isAr ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <span className="text-[#E5C38B] font-medium">
                {isAr ? "الأسئلة الشائعة" : "FAQs"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#E5C38B]">
              {isAr ? "الأسئلة الشائعة والمساعدة" : "Frequently Asked Questions"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              {isAr
                ? "اعثر على جميع الإجابات التي تحتاجها حول قوالب معزومين، خيارات التخصيص، وتتبع حضور الضيوف بسهولة."
                : "Find all the answers you need about Mazoomen templates, customization, and guest RSVP tracking."}
            </p>
          </div>
        </div>

        {/* Dedicated FAQ Section */}
        <FAQSection onOpenContact={() => setIsContactOpen(true)} />
      </main>

      <Footer
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </PageLayout>
  );
}
