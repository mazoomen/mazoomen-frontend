"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { LoginResponse } from "@/types/invitation";
import type { AxiosError } from "axios";
import { useLanguage } from "@/components/LanguageContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, initialMode }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const { t } = useLanguage();

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register inputs
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setAuthMode(initialMode);
        setAuthError("");
      }, 0);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError(t("Please fill in all fields."));
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email: loginEmail.trim(),
        password: loginPassword,
      });

      const { accessToken, user } = res.data;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Close modal and redirect
      onClose();
      window.location.href = user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/client";
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      if (error.response?.status === 401) {
        setAuthError(t("Invalid email or password. Please try again."));
      } else if (error.response?.data?.message) {
        const msg = error.response.data.message;
        setAuthError(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setAuthError(t("Something went wrong. Please try again later."));
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (
      !regFirstName.trim() ||
      !regLastName.trim() ||
      !regEmail.trim() ||
      !regPhone.trim() ||
      !regPassword
    ) {
      setAuthError(t("All fields are required."));
      return;
    }

    if (regPassword.length < 8) {
      setAuthError(t("Password must be at least 8 characters."));
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await api.post("/auth/register", {
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phoneNumber: regPhone.trim(),
      });

      const { accessToken, user } = res.data;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      onClose();
      window.location.href = "/dashboard/client";
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        setAuthError(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setAuthError(t("Registration failed. Please try again."));
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[32px] max-w-sm w-full p-8 shadow-2xl relative flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={() => {
            onClose();
            setAuthError("");
          }}
          className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Decorative cake element */}
        <div className="hidden sm:flex absolute left-[-28px] top-[30%] -rotate-12 w-14 h-14 bg-white border border-[#E9E4DC] rounded-xl shadow-lg p-1.5 items-center justify-center z-10">
          <span className="text-2xl select-none">🎂</span>
        </div>

        {/* Decorative balloons element */}
        <div className="hidden sm:flex absolute right-[-24px] bottom-[15%] rotate-6 w-16 h-20 bg-white border border-[#E9E4DC] rounded-xl shadow-lg p-1.5 flex-col justify-between z-10">
          <div className="w-full h-[65%] rounded bg-[#FAF9F6] overflow-hidden flex items-center justify-center select-none text-xl">
            🎈
          </div>
          <div className="flex items-center justify-center select-none text-sm leading-none -mt-1 font-serif text-black">
            🧑‍🤝‍🧑
          </div>
        </div>

        {/* Capsule tabs */}
        <div className="bg-neutral-100 border border-neutral-200/60 rounded-xl p-1 flex w-full mb-6 mt-2">
          <button
            onClick={() => {
              setAuthMode("login");
              setAuthError("");
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
              authMode === "login"
                ? "bg-[#F5EDE1] text-black shadow-sm"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            {t("Login")}
          </button>
          <button
            onClick={() => {
              setAuthMode("register");
              setAuthError("");
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
              authMode === "register"
                ? "bg-[#F5EDE1] text-black shadow-sm"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            {t("Register")}
          </button>
        </div>

        {/* Error Banner */}
        {authError && (
          <div className="w-full mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 flex items-start gap-2">
            <svg
              className="w-4 h-4 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
            <span className="leading-tight">{authError}</span>
          </div>
        )}

        {/* Form rendering */}
        {authMode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="w-full flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-serif font-medium text-neutral-800 mb-1">
                {t("Welcome Back!")}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {t("Access your account and continue designing")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder={t("Email Address")}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={authSubmitting}
                className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />

              <div className="flex justify-end -mb-1 mt-1">
                <button
                  type="button"
                  onClick={() => alert('Forgot password service is temporarily unavailable. Please contact support.')}
                  className="text-[10px] text-neutral-500 hover:text-black transition-colors"
                >
                  {t("Forgot Password?")}
                </button>
              </div>

              <div className="relative w-full">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder={t("Password")}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={authSubmitting}
                  className="w-full bg-white border border-[#E6E2DA] rounded-xl pl-4 pr-10 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                >
                  {showLoginPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm mt-5 mb-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              {authSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  {t("Logging in...")}
                </>
              ) : (
                t("Login")
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="w-full flex flex-col">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-serif font-medium text-neutral-800 mb-1">
                {t("Create Account")}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {t("Join us to save and coordinate your event invitations")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={t("First Name")}
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  disabled={authSubmitting}
                  className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
                <input
                  type="text"
                  placeholder={t("Last Name")}
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  disabled={authSubmitting}
                  className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              <input
                type="email"
                placeholder="Email Address"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                disabled={authSubmitting}
                className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />

              <input
                type="tel"
                placeholder={t("Phone Number (e.g. +966501234567)")}
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                disabled={authSubmitting}
                className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />

              <div className="relative w-full">
                <input
                  type={showRegPassword ? "text" : "password"}
                  placeholder={t("Password (Min. 8 characters)")}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  disabled={authSubmitting}
                  className="w-full bg-white border border-[#E6E2DA] rounded-xl pl-4 pr-10 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                >
                  {showRegPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm mt-5 mb-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              {authSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  {t("Registering...")}
                </>
              ) : (
                t("Register")
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
