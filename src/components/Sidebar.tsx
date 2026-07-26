"use client";

import Link from "next/link";
import Image from "next/image";
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

interface SidebarNavItemProps {
  onClick: () => void;
  isActive: boolean;
  isSidebarExpanded: boolean;
  label: string;
  icon: React.ReactNode;
  lang: string;
  isDanger?: boolean;
}

function SidebarNavItem({
  onClick,
  isActive,
  isSidebarExpanded,
  label,
  icon,
  lang,
  isDanger = false,
}: SidebarNavItemProps) {
  const activeClass = isActive
    ? "w-full h-11 px-4 rounded-xl gap-3 text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A]"
    : isSidebarExpanded
      ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
      : "w-full sm:w-10 h-11 sm:h-10 px-4 sm:px-0 sm:mx-auto sm:justify-center rounded-xl sm:rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C] gap-3 sm:gap-0";

  const dangerClass = isDanger
    ? "hover:text-red-500 hover:bg-red-500/10"
    : "";

  return (
    <button
      onClick={onClick}
      className={`flex items-center transition-all duration-300 group cursor-pointer ${activeClass} ${dangerClass}`}
    >
      <span className="shrink-0">{icon}</span>
      <span
        className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
          isSidebarExpanded
            ? "opacity-100 max-w-[150px]"
            : "opacity-100 sm:opacity-0 max-w-[150px] sm:max-w-0 sm:overflow-hidden"
        }`}
      >
        {label}
      </span>
      {!isSidebarExpanded && (
        <span
          className={`hidden sm:inline absolute ${
            lang === "ar" ? "right-16" : "left-16"
          } bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none`}
        >
          {label}
        </span>
      )}
    </button>
  );
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

  const isMazoomen = pathname === "/";
  const isProfile = pathname.startsWith("/profile");
  const isPurchases = pathname.startsWith("/dashboard/client");

  return (
    <aside
      className={`fixed inset-y-0 z-50 bg-[#0B1528] flex flex-col py-6 pb-12 sm:pb-6 gap-6 justify-between shrink-0 h-screen h-[100dvh] max-h-[100dvh] overflow-y-auto transition-all duration-300 sm:sticky sm:top-0
        ${lang === "ar" ? "right-0 border-l border-[#1E2E4A]" : "left-0 border-r border-[#1E2E4A]"}
        ${isSidebarExpanded ? "sm:w-56 sm:px-4" : "sm:w-[72px] sm:px-0"}
        w-64 px-4
        ${
          isMobileOpen
            ? "translate-x-0"
            : lang === "ar"
              ? "translate-x-full sm:translate-x-0"
              : "-translate-x-full sm:translate-x-0"
        }
      `}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-6 w-full items-center">
        {/* Header/Logo */}
        <div
          className={`flex items-center w-full transition-all duration-300 ${
            isSidebarExpanded ? "justify-between px-2" : "sm:justify-center px-2 sm:px-0"
          }`}
        >
          <button
            onClick={() => handleNav("/")}
            className={`flex items-center gap-3 group transition-all text-start cursor-pointer ${
              !isSidebarExpanded ? "sm:hidden" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] shadow-sm hover:border-[#E5C38B] transition-colors shrink-0 overflow-hidden relative">
              <Image
                src="/favicon.ico"
                alt="Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div
              className={`flex flex-col transition-all duration-300 ${
                isSidebarExpanded
                  ? "opacity-100 max-w-[150px]"
                  : "opacity-100 sm:opacity-0 max-w-[150px] sm:max-w-0 sm:overflow-hidden"
              }`}
            >
              <span className="text-base font-serif font-semibold tracking-tight text-[#E5C38B]">
                Mazoomen
              </span>
            </div>
          </button>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="hidden sm:flex w-8 h-8 rounded-full border border-[#1E2E4A] items-center justify-center bg-[#101F35] shadow-sm hover:bg-[#1A2D4C] transition-all cursor-pointer"
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <svg
              className={`w-4 h-4 text-[#E5C38B] transition-transform duration-300 ${
                isSidebarExpanded
                  ? lang === "ar"
                    ? "rotate-0"
                    : "rotate-180"
                  : lang === "ar"
                    ? "rotate-180"
                    : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="sm:hidden w-8 h-8 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] shadow-sm hover:bg-neutral-800 transition-all cursor-pointer"
            title="Close Drawer"
          >
            <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info Badge (Mobile Drawer) */}
        {isLoggedIn && user && (
          <div className="sm:hidden w-full p-3 rounded-xl bg-[#101F35] border border-[#1E2E4A] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1A2D4C] text-[#E5C38B] flex items-center justify-center font-bold text-xs border border-[#1E2E4A] shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.firstName ? user.firstName.charAt(0).toUpperCase() : "U"
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#E5C38B] truncate">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.email}
              </span>
              <span className="text-[10px] text-neutral-400 truncate">{user.email}</span>
            </div>
          </div>
        )}

        {/* Sidebar Nav Icons */}
        <nav className="flex flex-col gap-4 w-full">
          <SidebarNavItem
            onClick={() => handleNav("/")}
            isActive={isMazoomen}
            isSidebarExpanded={isSidebarExpanded}
            label={t("Mazoom")}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
            }
            lang={lang}
          />

          <SidebarNavItem
            onClick={() => handleNav("/profile", true)}
            isActive={isProfile}
            isSidebarExpanded={isSidebarExpanded}
            label={t("My Profile")}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            lang={lang}
          />

          <SidebarNavItem
            onClick={() => handleNav(user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/client", true)}
            isActive={isPurchases}
            isSidebarExpanded={isSidebarExpanded}
            label={t("My Purchases")}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            lang={lang}
          />
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-3 w-full mt-auto pt-4 border-t border-[#1E2E4A]">
        {/* Language Switcher (Mobile Only) */}
        <div className="sm:hidden px-1">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="w-full h-11 border border-[#1E2E4A] hover:bg-[#1A2D4C] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-[#E5C38B] font-sans"
          >
            🌐 {lang === "ar" ? "English" : "العربية"}
          </button>
        </div>

        {isLoggedIn && (
          <SidebarNavItem
            onClick={() => {
              setIsMobileOpen(false);
              handleLogout();
            }}
            isActive={false}
            isSidebarExpanded={isSidebarExpanded}
            label={t("Log Out")}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            }
            lang={lang}
            isDanger={true}
          />
        )}
      </div>
    </aside>
  );
}
