"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AuthModal from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    // Check query params for opening auth popup
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");
    if (authParam === "login" || authParam === "register") {
      setAuthMode(authParam);
      setIsAuthOpen(true);
    }
  }, []);

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] text-[#2D3142] font-sans antialiased">
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 sm:hidden backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        isLoggedIn={isLoggedIn}
        user={user}
        handleLogout={logout}
        openAuthModal={openAuthModal}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isLoggedIn={isLoggedIn}
          user={user}
          handleLogout={logout}
          openAuthModal={openAuthModal}
        />
        {children}
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
