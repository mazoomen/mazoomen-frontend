"use client";

import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@/types/invitation";
import api from "@/lib/api";

interface UseAuthReturn {
  /** Whether the user is authenticated */
  isLoggedIn: boolean;
  /** The currently authenticated user, or null */
  user: AuthUser | null;
  /** Store auth credentials after login/register */
  login: (user: AuthUser) => void;
  /** Clear auth credentials and redirect to home */
  logout: () => void;
  /** Whether auth state has been initialized from localStorage */
  isReady: boolean;
}

/**
 * Centralized authentication state hook.
 * Replaces duplicated auth logic across PageLayout, page.tsx, and admin layout.
 */
export function useAuth(): UseAuthReturn {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsed: AuthUser = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUser(parsed);
      } catch {
        localStorage.removeItem("user");
      }
    }

    setIsReady(true);
  }, []);

  const login = useCallback((userData: AuthUser) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    api.post("/auth/logout", { refreshToken }).catch((err) => {
      console.error("Backend logout failed:", err);
    }).finally(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
      setUser(null);
      window.location.href = "/";
    });
  }, []);

  return { isLoggedIn, user, login, logout, isReady };
}
