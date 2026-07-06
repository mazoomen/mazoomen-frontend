"use client";

import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@/types/invitation";

interface UseAuthReturn {
  /** Whether the user is authenticated */
  isLoggedIn: boolean;
  /** The currently authenticated user, or null */
  user: AuthUser | null;
  /** Store auth credentials after login/register */
  login: (accessToken: string, user: AuthUser) => void;
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

    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
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

  const login = useCallback((accessToken: string, userData: AuthUser) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = "/";
  }, []);

  return { isLoggedIn, user, login, logout, isReady };
}
