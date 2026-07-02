"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const handleMobileNav = (path: string, requiresAuth = false) => {
    setIsMobileMenuOpen(false);
    if (requiresAuth && !isLoggedIn) {
      openAuthModal("login");
    } else {
      router.push(path);
    }
  };

  return (
    <header className="h-20 bg-[#0B1528] border-b border-[#1E2E4A] px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] shadow-sm shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-lg font-serif font-semibold tracking-tight text-[#E5C38B]">Mazoom</span>
        </Link>

        {/* Mobile Navigation Dropdown Toggle Chevron */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden w-8 h-8 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] hover:bg-[#1A2D4C] shadow-sm transition-all focus:outline-none ml-1 cursor-pointer"
          title="Toggle Menu"
        >
          <svg
            className={`w-4 h-4 text-neutral-300 transition-transform duration-300 ${isMobileMenuOpen ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-6 right-6 bg-[#0F1C36] border border-[#1E2E4A] rounded-2xl shadow-xl p-4 flex flex-col gap-2 z-50 sm:hidden animate-fadeIn text-neutral-200">
          <button
            onClick={() => handleMobileNav("/")}
            className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-neutral-300 hover:text-white hover:bg-[#1A2D4C] text-left cursor-pointer"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
              />
            </svg>
            <span className="text-xs font-semibold">{t("Mazoom")}</span>
          </button>

          <button
            onClick={() => handleMobileNav("/profile", true)}
            className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-neutral-300 hover:text-white hover:bg-[#1A2D4C] text-left cursor-pointer"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs font-semibold">{t("My Profile")}</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-neutral-300 hover:text-white hover:bg-[#1A2D4C] text-left cursor-pointer"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            <span className="text-xs font-semibold">{t("Tickets")}</span>
          </button>

          <button
            onClick={() =>
              handleMobileNav(
                user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/client",
                true,
              )
            }
            className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A] text-left cursor-pointer"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-xs font-semibold">{t("My Purchases")}</span>
          </button>

          <hr className="border-[#1E2E4A] my-1" />

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-neutral-300 hover:text-white hover:bg-[#1A2D4C] text-left cursor-pointer"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-semibold">{t("Settings")}</span>
          </button>

          <hr className="border-[#1E2E4A] my-1" />

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setLang(lang === "ar" ? "en" : "ar");
            }}
            className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-[#E5C38B] hover:text-white hover:bg-[#1A2D4C] text-left cursor-pointer"
          >
            🌐 <span className="text-xs font-semibold">{lang === "ar" ? "English" : "العربية"}</span>
          </button>

          {isLoggedIn && (
            <>
              <hr className="border-[#1E2E4A] my-1" />
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-red-500 hover:bg-red-500/10 text-left cursor-pointer font-semibold"
              >
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-xs">{t("Log Out")}</span>
              </button>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="px-2.5 h-8 text-[10px] font-bold text-[#E5C38B] border border-[#1E2E4A] hover:bg-[#1A2D4C] rounded-lg transition-all cursor-pointer flex items-center justify-center font-sans"
        >
          {lang === "ar" ? "EN" : "العربية"}
        </button>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
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
            </>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="px-4 h-9 text-xs font-semibold text-neutral-300 border border-[#1E2E4A] hover:text-[#E5C38B] hover:bg-[#1A2D4C] rounded-lg transition-all cursor-pointer"
            >
              {t("Login")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
