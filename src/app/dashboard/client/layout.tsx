"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AuthUser } from "@/types/invitation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  // Sidebar navigation states
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.replace("/");
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.replace("/");
  };

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] text-[#2D3142] font-sans antialiased">
      {/* ── LEFT SIDEBAR (Matches Home Page) ─────────────────────────── */}
      <aside className={`bg-[#0B1528] border-r border-[#1E2E4A] flex flex-col py-6 gap-8 justify-between shrink-0 sticky top-0 h-screen hidden sm:flex transition-all duration-300 ${isSidebarExpanded ? "w-56 px-4" : "w-[72px] px-0"}`}>
        <div className="flex flex-col gap-8 w-full items-stretch">
          {/* Logo / Brand Icon & Toggle Button */}
          <div className={`flex items-center gap-3 w-full ${isSidebarExpanded ? "px-2 justify-between" : "flex-col gap-4 items-center"}`}>
            <Link href="/" className="w-10 h-10 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] shadow-sm hover:border-[#E5C38B] transition-colors shrink-0 overflow-hidden">
              <img src="/favicon.ico" alt="Logo" className="w-6 h-6 object-contain" />
            </Link>
            
            {/* Toggle Button */}
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="w-8 h-8 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] shadow-sm hover:bg-[#1A2D4C] transition-all cursor-pointer"
              title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <svg className="w-3.5 h-3.5 text-neutral-300 hover:text-[#E5C38B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
              onClick={() => router.push("/")}
              className={`flex items-center transition-all duration-300 group cursor-pointer ${
                isSidebarExpanded 
                  ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]" 
                  : "w-10 h-10 mx-auto justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <span className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"}`}>
                Marketplace
              </span>
              {!isSidebarExpanded && (
                <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">Marketplace</span>
              )}
            </button>

            <button
              onClick={() => router.push("/profile")}
              className={`flex items-center transition-all duration-300 group cursor-pointer ${
                isSidebarExpanded 
                  ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]" 
                  : "w-10 h-10 mx-auto justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"}`}>
                My Profile
              </span>
              {!isSidebarExpanded && (
                <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">My Profile</span>
              )}
            </button>

            <button className={`flex items-center transition-all duration-300 group cursor-pointer ${
              isSidebarExpanded 
                ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]" 
                : "w-10 h-10 mx-auto justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
            }`}>
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"}`}>
                Tickets
              </span>
              {!isSidebarExpanded && (
                <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">Tickets</span>
              )}
            </button>

            <button
              onClick={() => {}}
              className={`flex items-center transition-all duration-300 group cursor-pointer ${
                isSidebarExpanded 
                  ? "w-full h-11 px-4 rounded-xl gap-3 text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A]" 
                  : "w-10 h-10 mx-auto justify-center rounded-full text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A]"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"}`}>
                My Purchases
              </span>
              {!isSidebarExpanded && (
                <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">My Purchases</span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 w-full">
          <button className={`flex items-center transition-all duration-300 group cursor-pointer ${
            isSidebarExpanded 
              ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-white hover:bg-[#1A2D4C]" 
              : "w-10 h-10 mx-auto justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#1A2D4C]"
          }`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"}`}>
              Settings
            </span>
            {!isSidebarExpanded && (
              <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">Settings</span>
            )}
          </button>

          {/* Bottom Log Out Icon */}
          <button
            onClick={handleLogout}
            className={`flex items-center transition-all duration-300 group cursor-pointer ${
              isSidebarExpanded 
                ? "w-full h-11 px-4 rounded-xl gap-3 text-neutral-300 hover:text-red-500 hover:bg-red-500/10" 
                : "w-10 h-10 mx-auto justify-center rounded-full text-neutral-300 hover:text-red-500 hover:bg-red-500/10"
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 overflow-hidden"}`}>
              Log Out
            </span>
            {!isSidebarExpanded && (
              <span className="absolute left-16 bg-[#0B1528] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md border border-[#1E2E4A] z-50 pointer-events-none">Log Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── TOP HEADER ──────────────────────────────────────────────── */}
        <header className="h-20 bg-[#0B1528] border-b border-[#1E2E4A] px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <Link href="/" className="w-8 h-8 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] shadow-sm shrink-0 overflow-hidden">
                <img src="/favicon.ico" alt="Logo" className="w-5 h-5 object-contain" />
              </Link>
              <span className="text-lg font-serif font-semibold tracking-tight text-[#E5C38B] font-sans">Mazoom</span>
            </div>
            
            {/* Mobile Navigation Dropdown Toggle Chevron */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden w-8 h-8 rounded-full border border-[#1E2E4A] flex items-center justify-center bg-[#101F35] hover:bg-[#1A2D4C] shadow-sm transition-all focus:outline-none ml-1 cursor-pointer"
              title="Toggle Menu"
            >
              <svg 
                className={`w-4 h-4 text-neutral-300 transition-transform duration-300 ${isMobileMenuOpen ? "rotate-180" : ""}`}
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
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/");
                }}
                className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-neutral-300 hover:text-white hover:bg-[#1A2D4C] text-left cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
                <span className="text-xs font-semibold">Marketplace</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/profile");
                }}
                className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-neutral-300 hover:text-white hover:bg-[#1A2D4C] text-left cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-semibold">My Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-neutral-300 hover:text-white hover:bg-[#1A2D4C] text-left cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span className="text-xs font-semibold">Tickets</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-[#E5C38B] bg-[#101F35] border border-[#1E2E4A] text-left cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-xs font-semibold">My Purchases</span>
              </button>

              <hr className="border-[#1E2E4A] my-1" />

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-neutral-300 hover:text-white hover:bg-[#1A2D4C] text-left cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-semibold">Settings</span>
              </button>

              <hr className="border-[#1E2E4A] my-1" />

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-red-500 hover:bg-red-500/10 text-left cursor-pointer font-semibold"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-xs">Log Out</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-xs text-[#E5C38B] font-semibold bg-[#101F35] border border-[#1E2E4A] rounded-full px-3 py-1 font-sans">
                  {user.firstName} {user.lastName}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 h-9 text-xs font-semibold text-neutral-300 border border-[#1E2E4A] hover:text-[#E5C38B] hover:bg-[#1A2D4C] rounded-lg transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* ── Page Content ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
