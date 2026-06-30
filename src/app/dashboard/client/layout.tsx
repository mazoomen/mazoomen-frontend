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
      <aside className="w-[72px] bg-white border-r border-[#E6E2DA] flex flex-col items-center py-6 gap-8 justify-between shrink-0 sticky top-0 h-screen hidden sm:flex">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Logo / Brand Icon */}
          <Link href="/" className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm hover:bg-neutral-50 transition-colors">
            <span className="font-serif font-semibold text-lg text-black">I</span>
          </Link>

          {/* Sidebar Nav Icons */}
          <nav className="flex flex-col items-center gap-6 w-full">
            {/* Active dashboard icon */}
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-black bg-[#F5F2EB] transition-all group relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <span className="absolute left-14 bg-[#2D3142] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow z-50">Dashboard</span>
            </button>
          </nav>
        </div>

        {/* Bottom Log Out Icon */}
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#7F8487] hover:text-red-500 hover:bg-red-50 transition-all group relative cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="absolute left-14 bg-[#2D3142] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow z-50">Log Out</span>
        </button>
      </aside>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── TOP HEADER ──────────────────────────────────────────────── */}
        <header className="h-20 bg-white border-b border-[#E6E2DA] px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm shrink-0">
              <span className="font-serif font-semibold text-sm text-black">I</span>
            </Link>
            <span className="text-lg font-bold tracking-tight text-[#2D3142] font-sans">MarketPlace</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F4F1EA] text-[#B89C72] font-semibold border border-[#E6E2DA] ml-2 hidden md:inline">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-xs text-[#7F8487] font-semibold bg-[#FAF9F6] border border-[#E6E2DA] rounded-full px-3 py-1">
                  👤 CLIENT: {user.firstName} {user.lastName}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 h-9 text-xs font-semibold text-neutral-600 hover:text-black transition-all border border-neutral-200 hover:bg-neutral-50 rounded-lg"
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
