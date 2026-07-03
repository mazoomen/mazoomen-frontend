"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/types/invitation";
import { useLanguage } from "@/components/LanguageContext";

interface SidebarProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  isLoggedIn: boolean;
  user: AuthUser | null;
  handleLogout: () => void;
  openAuthModal: (mode: "login" | "register") => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  isSidebarExpanded,
  setIsSidebarExpanded,
  isLoggedIn,
  user,
  handleLogout,
  openAuthModal,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const handleNav = (path: string, requiresAuth = false) => {
    setIsMobileOpen(false);
    if (requiresAuth && !isLoggedIn) {
      openAuthModal("login");
    } else {
      router.push(path);
    }
  };

  const isMazoom = pathname === "/";
  const isProfile = pathname.startsWith("/profile");
  const isPurchases = pathname.startsWith("/dashboard/client") && !pathname.includes("/orders");
  const isOrders = pathname.startsWith("/dashboard/client/orders");

  return (
    <aside
      className={`fixed inset-y-0 z-50 bg-[#0B1528] flex flex-col py-6 gap-8 justify-between shrink-0 h-screen transition-all duration-300 sm:sticky sm:top-0
        ${lang === "ar" ? "right-0 border-l border-[#1E2E4A]" : "left-0 border-r border-[#1E2E4A]"}
        ${isSidebarExpanded ? "sm:w-56 sm:px-4" : "sm:w-[72px] sm:px-0"}
        w-64 px-4
        ${isMobileOpen
          ? "translate-x-0"
          : lang === "ar"
            ? "translate-x-full sm:translate-x-0"
            : "-translate-x-full sm:translate-x-0"
        }`}
    >
      <div className="flex flex-col gap-8 w-full items-stretch">
        {/* Logo / Brand Icon & Toggle Button */}
        <div
          className={`flex items-center gap-3 w-full ${isSidebarExpanded ? "px-2 justify-between" : "flex-col gap-4 items-center"
            }`}
        >
          <div className="flex items-center gap-2">
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className="w-10 h-10 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] shadow-sm hover:border-[#E5C38B] transition-colors shrink-0 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.ico" alt="Logo" className="w-6 h-6 object-contain" />
            </Link>

            {/* Brand Logo Text */}
            <span
              className={`text-[#E5C38B] font-serif font-bold text-sm tracking-wide transition-all duration-300 ${isSidebarExpanded ? "opacity-100 max-w-[100px]" : "opacity-0 max-w-0 overflow-hidden hidden"
                }`}
            >
              Mazoom
            </span>
          </div>

          {/* Toggle Button (Desktop Only) */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="hidden sm:flex w-8 h-8 rounded-full border border-[#1E2E4A] items-center justify-center bg-[#101F35] shadow-sm hover:bg-[#1A2D4C] transition-all cursor-pointer"
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <svg
              className="w-3.5 h-3.5 text-neutral-300 hover:text-[#E5C38B]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {isSidebarExpanded ? (
                lang === "ar" ? (
                  // Expanded Arabic: points right >> to collapse
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  // Expanded English: points left << to collapse
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )
              ) : (
                lang === "ar" ? (
                  // Collapsed Arabic: points left << to expand
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  // Collapsed English: points right >> to expand
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )
              )}
            </svg>
          </button>

          {/* Close Button (Mobile Drawer Only) */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="sm:hidden w-8 h-8 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] shadow-sm hover:bg-neutral-800 transition-all cursor-pointer"
            title="Close Drawer"
          >
            <svg
              className="w-3.5 h-3.5 text-neutral-300 hover:text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Nav Icons */}
        <nav className="flex flex-col gap-4 w-full">
          <button
            onClick={() => handleNav("/")}
            className={`flex items-center transition-all duration-300 group cursor-pointer ${isMazoom
                ? "w-full h-11 px-4 rounded-xl gap-3 text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A]"
                : isSidebarExpanded
                  ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
                  : "w-full sm:w-10 h-11 sm:h-10 px-4 sm:px-0 sm:mx-auto sm:justify-center rounded-xl sm:rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C] gap-3 sm:gap-0"
              }`}
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
            <span
              className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-100 sm:opacity-0 max-w-[150px] sm:max-w-0 sm:overflow-hidden"
                }`}
            >
              {t("Mazoom")}
            </span>
            {!isSidebarExpanded && (
              <span className={`hidden sm:inline absolute ${lang === "ar" ? "right-16" : "left-16"} bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none`}>
                {t("Mazoom")}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav("/profile", true)}
            className={`flex items-center transition-all duration-300 group cursor-pointer ${isProfile
                ? "w-full h-11 px-4 rounded-xl gap-3 text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A]"
                : isSidebarExpanded
                  ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
                  : "w-full sm:w-10 h-11 sm:h-10 px-4 sm:px-0 sm:mx-auto sm:justify-center rounded-xl sm:rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C] gap-3 sm:gap-0"
              }`}
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
            <span
              className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-100 sm:opacity-0 max-w-[150px] sm:max-w-0 sm:overflow-hidden"
                }`}
            >
              {t("My Profile")}
            </span>
            {!isSidebarExpanded && (
              <span className={`hidden sm:inline absolute ${lang === "ar" ? "right-16" : "left-16"} bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none`}>
                {t("My Profile")}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setIsMobileOpen(false);
              if (isLoggedIn) {
                router.push("/dashboard/client/orders");
              } else {
                openAuthModal("login");
              }
            }}
            className={`flex items-center transition-all duration-300 group cursor-pointer ${isOrders
                ? "w-full h-11 px-4 rounded-xl gap-3 text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A]"
                : isSidebarExpanded
                  ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
                  : "w-full sm:w-10 h-11 sm:h-10 px-4 sm:px-0 sm:mx-auto sm:justify-center rounded-xl sm:rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C] gap-3 sm:gap-0"
              }`}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <span
              className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-100 sm:opacity-0 max-w-[150px] sm:max-w-0 sm:overflow-hidden"
                }`}
            >
              {t("My Orders")}
            </span>
            {!isSidebarExpanded && (
              <span className={`hidden sm:inline absolute ${lang === "ar" ? "right-16" : "left-16"} bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none`}>
                {t("My Orders")}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setIsMobileOpen(false);
              if (isLoggedIn) {
                router.push(user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/client");
              } else {
                openAuthModal("login");
              }
            }}
            className={`flex items-center transition-all duration-300 group cursor-pointer ${isPurchases
                ? "w-full h-11 px-4 rounded-xl gap-3 text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A]"
                : isSidebarExpanded
                  ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
                  : "w-full sm:w-10 h-11 sm:h-10 px-4 sm:px-0 sm:mx-auto sm:justify-center rounded-xl sm:rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C] gap-3 sm:gap-0"
              }`}
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
            <span
              className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-100 sm:opacity-0 max-w-[150px] sm:max-w-0 sm:overflow-hidden"
                }`}
            >
              {t("My Purchases")}
            </span>
            {!isSidebarExpanded && (
              <span className={`hidden sm:inline absolute ${lang === "ar" ? "right-16" : "left-16"} bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none`}>
                {t("My Purchases")}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4 w-full">
        {/* Language Switcher (Mobile Only) */}
        <div className="sm:hidden px-4">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="w-full h-11 border border-[#1E2E4A] hover:bg-[#1A2D4C] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-[#E5C38B] font-sans"
          >
            🌐 {lang === "ar" ? "English" : "العربية"}
          </button>
        </div>



        {isLoggedIn && (
          <button
            onClick={() => {
              setIsMobileOpen(false);
              handleLogout();
            }}
            className={`flex items-center transition-all duration-300 group cursor-pointer ${isSidebarExpanded
                ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-red-500 hover:bg-red-500/10"
                : "w-full sm:w-10 h-11 sm:h-10 px-4 sm:px-0 sm:mx-auto sm:justify-center rounded-xl sm:rounded-full text-neutral-300 hover:text-red-500 hover:bg-red-500/10 gap-3 sm:gap-0"
              }`}
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
            <span
              className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-100 sm:opacity-0 max-w-[150px] sm:max-w-0 sm:overflow-hidden"
                }`}
            >
              {t("Log Out")}
            </span>
            {!isSidebarExpanded && (
              <span className={`hidden sm:inline absolute ${lang === "ar" ? "right-16" : "left-16"} bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none`}>
                {t("Log Out")}
              </span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
