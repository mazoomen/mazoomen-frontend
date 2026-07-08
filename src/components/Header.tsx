"use client";

import Link from "next/link";
import Image from "next/image";
import type { AuthUser } from "@/types/invitation";
import { useLanguage } from "@/components/LanguageContext";

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isLoggedIn: boolean;
  user: AuthUser | null;
  handleLogout: () => void;
  openAuthModal: (mode: "login" | "register") => void;
}

export default function Header({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isLoggedIn,
  user,
  handleLogout,
  openAuthModal,
}: HeaderProps) {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="h-20 bg-[#0B1528] border-b border-[#1E2E4A] px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
        <div className="w-8 h-8 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] shadow-sm shrink-0 overflow-hidden relative">
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
        <span className="text-lg font-serif font-semibold tracking-tight text-[#E5C38B]">Mazoom</span>
      </Link>

      {/* Right controls wrapper */}
      <div className="flex items-center gap-4">
        {/* Language Switcher (Desktop Only) */}
        <button
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="hidden sm:flex px-2.5 h-8 text-[10px] font-bold text-[#E5C38B] border border-[#1E2E4A] hover:bg-[#1A2D4C] rounded-lg transition-all cursor-pointer items-center justify-center font-sans"
        >
          {lang === "ar" ? "EN" : "العربية"}
        </button>

        {/* Auth details & Login button wrapper */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            // Logged in controls (Desktop Only)
            <div className="hidden sm:flex items-center gap-3">
              {user && (
                <span className="text-xs text-[#E5C38B] font-semibold bg-[#101F35] border border-[#1E2E4A] rounded-full px-3 py-1 font-sans">
                  {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 h-9 text-xs font-semibold text-neutral-300 border border-[#1E2E4A] hover:text-[#E5C38B] hover:bg-[#1A2D4C] rounded-lg transition-all cursor-pointer"
              >
                {t("Sign Out")}
              </button>
            </div>
          ) : (
            // Logged out Login Button (Visible on BOTH mobile and desktop!)
            <button
              onClick={() => openAuthModal("login")}
              className="px-4 h-9 text-xs font-semibold text-neutral-300 border border-[#1E2E4A] hover:text-[#E5C38B] hover:bg-[#1A2D4C] rounded-lg transition-all cursor-pointer"
            >
              {t("Login")}
            </button>
          )}
        </div>

        {/* Mobile Navigation Dropdown Toggle Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden w-8 h-8 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] hover:bg-[#1A2D4C] shadow-sm transition-all focus:outline-none cursor-pointer"
          title="Toggle Menu"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg
            className="w-4 h-4 text-neutral-300 transition-all duration-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
