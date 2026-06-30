"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/types/invitation";

interface SidebarProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  isLoggedIn: boolean;
  user: AuthUser | null;
  handleLogout: () => void;
  openAuthModal: (mode: "login" | "register") => void;
}

export default function Sidebar({
  isSidebarExpanded,
  setIsSidebarExpanded,
  isLoggedIn,
  user,
  handleLogout,
  openAuthModal,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (path: string, requiresAuth = false) => {
    if (requiresAuth && !isLoggedIn) {
      openAuthModal("login");
    } else {
      router.push(path);
    }
  };

  const isMarketplace = pathname === "/";
  const isProfile = pathname.startsWith("/profile");
  const isPurchases = pathname.startsWith("/dashboard/client");

  return (
    <aside
      className={`bg-[#0B1528] border-r border-[#1E2E4A] flex flex-col py-6 gap-8 justify-between shrink-0 sticky top-0 h-screen hidden sm:flex transition-all duration-300 ${
        isSidebarExpanded ? "w-56 px-4" : "w-[72px] px-0"
      }`}
    >
      <div className="flex flex-col gap-8 w-full items-stretch">
        {/* Logo / Brand Icon & Toggle Button */}
        <div
          className={`flex items-center gap-3 w-full ${
            isSidebarExpanded ? "px-2 justify-between" : "flex-col gap-4 items-center"
          }`}
        >
          <Link
            href="/"
            className="w-10 h-10 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] shadow-sm hover:border-[#E5C38B] transition-colors shrink-0 overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="Logo" className="w-6 h-6 object-contain" />
          </Link>

          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="w-8 h-8 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] shadow-sm hover:bg-[#1A2D4C] transition-all cursor-pointer"
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Sidebar Nav Icons */}
        <nav className="flex flex-col gap-4 w-full">
          <button
            onClick={() => handleNav("/")}
            className={`flex items-center transition-all duration-300 group cursor-pointer ${
              isMarketplace
                ? "w-full h-11 px-4 rounded-xl gap-3 text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A]"
                : isSidebarExpanded
                  ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
                  : "w-10 h-10 mx-auto justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
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
              className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
                isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"
              }`}
            >
              Marketplace
            </span>
            {!isSidebarExpanded && (
              <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">
                Marketplace
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav("/profile", true)}
            className={`flex items-center transition-all duration-300 group cursor-pointer ${
              isProfile
                ? "w-full h-11 px-4 rounded-xl gap-3 text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A]"
                : isSidebarExpanded
                  ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
                  : "w-10 h-10 mx-auto justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
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
              className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
                isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"
              }`}
            >
              My Profile
            </span>
            {!isSidebarExpanded && (
              <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">
                My Profile
              </span>
            )}
          </button>

          <button
            className={`flex items-center transition-all duration-300 group cursor-pointer ${
              isSidebarExpanded
                ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
                : "w-10 h-10 mx-auto justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
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
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            <span
              className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
                isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"
              }`}
            >
              Tickets
            </span>
            {!isSidebarExpanded && (
              <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">
                Tickets
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (isLoggedIn) {
                router.push(user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/client");
              } else {
                openAuthModal("login");
              }
            }}
            className={`flex items-center transition-all duration-300 group cursor-pointer ${
              isPurchases
                ? "w-full h-11 px-4 rounded-xl gap-3 text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A]"
                : isSidebarExpanded
                  ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
                  : "w-10 h-10 mx-auto justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
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
              className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
                isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"
              }`}
            >
              My Purchases
            </span>
            {!isSidebarExpanded && (
              <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">
                My Purchases
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4 w-full">
        <button
          className={`flex items-center transition-all duration-300 group cursor-pointer ${
            isSidebarExpanded
              ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
              : "w-10 h-10 mx-auto justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span
            className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
              isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"
            }`}
          >
            Settings
          </span>
          {!isSidebarExpanded && (
            <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">
              Settings
            </span>
          )}
        </button>

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className={`flex items-center transition-all duration-300 group cursor-pointer ${
              isSidebarExpanded
                ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-red-500 hover:bg-red-500/10"
                : "w-10 h-10 mx-auto justify-center rounded-full text-neutral-300 hover:text-red-500 hover:bg-red-500/10"
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
              className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
                isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"
              }`}
            >
              Log Out
            </span>
            {!isSidebarExpanded && (
              <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">
                Log Out
              </span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
