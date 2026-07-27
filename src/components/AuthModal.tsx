"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import { isGoogleOAuthEnabled, GOOGLE_CLIENT_ID, IS_DEV } from "@/lib/env";
import type { LoginResponse } from "@/types/invitation";
import type { AxiosError } from "axios";
import { useLanguage } from "@/components/LanguageContext";
import { PasswordInput, PhoneInput } from "@/components/ui";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "login" | "register";
}

// ── Google Sign-In Button ──────────────────────────────────────────────
function GoogleSignInButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border border-[#E6E2DA] bg-white hover:bg-neutral-50 text-neutral-700 font-semibold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer h-10 mt-2"
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.095-5.122 4.095-3.328 0-6.03-2.701-6.03-6.03s2.702-6.03 6.03-6.03c1.524 0 2.91.564 3.978 1.488l3.12-3.12C18.912 2.688 15.783 1.5 12.24 1.5 6.308 1.5 1.5 6.308 1.5 12.24s4.808 10.74 10.74 10.74c5.94 0 11.233-4.269 11.233-10.74 0-.726-.08-1.422-.227-2.083H12.24v.128Z"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}

// ── Divider ────────────────────────────────────────────────────────────
function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center my-1 w-full">
      <div className="flex-1 h-px bg-neutral-200" />
      <span className="px-3 text-[10px] text-neutral-400 font-sans uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 h-px bg-neutral-200" />
    </div>
  );
}

// ── 6-Digit OTP Box Component ──────────────────────────────────────────
function OtpBoxes({
  value,
  onChange,
  disabled,
  idPrefix = "otp-input",
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  idPrefix?: string;
}) {
  const digits = Array.from({ length: 6 }).map((_, i) => value[i] || "");

  const handleChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    const nextVal = newDigits.join("").slice(0, 6);
    onChange(nextVal);

    if (char && index < 5) {
      const nextInput = document.getElementById(`${idPrefix}-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`${idPrefix}-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const targetIndex = Math.min(pasted.length, 5);
      const targetInput = document.getElementById(`${idPrefix}-${targetIndex}`);
      targetInput?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 dir-ltr">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          id={`${idPrefix}-${idx}`}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digits[idx] || ""}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-10 h-12 text-center text-lg font-bold bg-white border border-[#E6E2DA] rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm disabled:opacity-50 text-neutral-800"
        />
      ))}
    </div>
  );
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode,
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [regStep, setRegStep] = useState<"details" | "otp">("details");
  const [forgotStep, setForgotStep] = useState<"email" | "otp">("email");
  const [authError, setAuthError] = useState("");
  const [otpInfoMsg, setOtpInfoMsg] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const { t, lang } = useLanguage();

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register inputs
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Forgot password inputs
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtpCode, setForgotOtpCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");

  // Password complexity checks for registration
  const hasMinLength = regPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(regPassword);
  const hasLower = /[a-z]/.test(regPassword);
  const hasNumberOrSpecial = /[0-9\W]/.test(regPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumberOrSpecial;
  const passwordsMatch = regPassword.length > 0 && regConfirmPassword.length > 0 && regPassword === regConfirmPassword;

  // Password complexity checks for Forgot Password
  const forgotHasMinLength = forgotNewPassword.length >= 8;
  const forgotHasUpper = /[A-Z]/.test(forgotNewPassword);
  const forgotHasLower = /[a-z]/.test(forgotNewPassword);
  const forgotHasNumberOrSpecial = /[0-9\W]/.test(forgotNewPassword);
  const isForgotPasswordValid = forgotHasMinLength && forgotHasUpper && forgotHasLower && forgotHasNumberOrSpecial;
  const forgotPasswordsMatch = forgotNewPassword.length > 0 && forgotConfirmPassword.length > 0 && forgotNewPassword === forgotConfirmPassword;

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setRegStep("details");
      setForgotStep("email");
      setAuthError("");
      setOtpInfoMsg("");
      setRegConfirmPassword("");
      setOtpCode("");
      setForgotOtpCode("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
      setResendTimer(0);
    }
  }, [isOpen, initialMode]);

  // ── Google GSI Script Loading ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !isGoogleOAuthEnabled) return;

    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.src = `https://accounts.google.com/gsi/client?hl=${lang}`;
    script.id = "google-gsi-script";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializeGoogleGSI();
    };
  }, [isOpen, authMode, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeGoogleGSI = () => {
    const win = window as Window & { google?: { accounts: { id: { initialize: (config: Record<string, unknown>) => void; renderButton: (el: HTMLElement, config: Record<string, unknown>) => void } } } };
    if (!win.google) return;

    try {
      win.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignInResponse,
      });

      const btnEl = document.getElementById("google-signin-btn");
      if (btnEl) {
        win.google.accounts.id.renderButton(btnEl, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
        });
      }
    } catch (e) {
      logger.error("Failed to initialize Google GSI", e);
    }
  };

  // ── Auth Handlers ────────────────────────────────────────────────────
  const handleAuthSuccess = (user: LoginResponse["user"]) => {
    localStorage.setItem("user", JSON.stringify(user));
    onClose();
    window.location.href =
      user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/client";
  };

  const handleGoogleSignInResponse = async (response: { credential?: string }) => {
    const token = response.credential;
    if (!token) return;

    setAuthSubmitting(true);
    setAuthError("");
    try {
      const res = await api.post("/auth/google", { token });
      const { user } = res.data;
      handleAuthSuccess(user);
    } catch (err) {
      logger.error("Google Sign-In failed", err);
      setAuthError(t("Google Sign-In failed. Please try again."));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleSimulation = async () => {
    // Only available in development mode
    if (!IS_DEV) return;

    const emailInput = prompt(
      t("Enter simulated Google Email:"),
      "googleuser@gmail.com",
    );
    if (!emailInput) return;
    const nameInput = prompt(t("Enter simulated Google Name:"), "Google User");
    if (!nameInput) return;

    const parts = nameInput.trim().split(" ");
    const firstName = parts[0] || "Google";
    const lastName = parts.slice(1).join(" ") || "User";

    setAuthSubmitting(true);
    setAuthError("");
    try {
      const mockToken = `mock_${emailInput.trim()}_${firstName}_${lastName}`;
      const res = await api.post("/auth/google", { token: mockToken });
      const { user } = res.data;
      handleAuthSuccess(user);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      logger.error("Google simulation failed", err);
      setAuthError(
        error.response?.data?.message ||
          t("Google Sign-In failed. Please try again."),
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

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
      handleAuthSuccess(res.data.user);
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      const msg = error.response?.data?.message;
      const errKey = Array.isArray(msg) ? msg[0] : msg;

      if (errKey === "errors.user_deactivated") {
        setAuthError(t("errors.user_deactivated"));
      } else if (error.response?.status === 401) {
        setAuthError(t("Invalid email or password. Please try again."));
      } else if (errKey) {
        setAuthError(t(errKey));
      } else {
        setAuthError(t("Something went wrong. Please try again later."));
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Step 1: Send Registration OTP to email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError("");

    if (
      !regFirstName.trim() ||
      !regLastName.trim() ||
      !regEmail.trim() ||
      !regPhone.trim() ||
      !regPassword ||
      !regConfirmPassword
    ) {
      setAuthError(t("All fields are required."));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      setAuthError(t("Please provide a valid email address"));
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!phoneRegex.test(regPhone.trim())) {
      setAuthError(
        t("Phone number must be a valid international format (e.g. +966501234567)")
      );
      return;
    }

    if (!isPasswordValid) {
      setAuthError(t("errors.password_weak"));
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setAuthError(t("Passwords do not match. Please try again."));
      return;
    }

    setAuthSubmitting(true);
    try {
      await api.post("/auth/send-otp", {
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        email: regEmail.trim(),
        phoneNumber: regPhone.trim(),
        password: regPassword,
      });
      setRegStep("otp");
      setResendTimer(60);
      setOtpInfoMsg(t("Code sent! Please check your email inbox."));
      setAuthError("");
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        const key = Array.isArray(msg) ? msg[0] : msg;
        setAuthError(t(key) || key);
      } else {
        setAuthError(t("Registration failed. Please try again."));
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Step 2: Complete Registration with OTP
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!otpCode || otpCode.trim().length !== 6) {
      setAuthError(t("Please enter a valid 6-digit verification code."));
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
        otp: otpCode.trim(),
      });
      handleAuthSuccess(res.data.user);
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        const key = Array.isArray(msg) ? msg[0] : msg;
        setAuthError(t(key) || key);
      } else {
        setAuthError(t("Registration failed. Please try again."));
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Forgot Password Step 1: Send Reset OTP
  const handleSendForgotPasswordOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError("");

    if (!forgotEmail.trim()) {
      setAuthError(t("Please fill in all fields."));
      return;
    }

    setAuthSubmitting(true);
    try {
      await api.post("/auth/forgot-password/send-otp", {
        email: forgotEmail.trim(),
      });
      setForgotStep("otp");
      setResendTimer(60);
      setOtpInfoMsg(t("Code sent! Please check your email inbox."));
      setAuthError("");
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        const key = Array.isArray(msg) ? msg[0] : msg;
        setAuthError(t(key) || key);
      } else {
        setAuthError(t("Something went wrong. Please try again later."));
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Forgot Password Step 2: Reset Password with OTP
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!forgotOtpCode || forgotOtpCode.trim().length !== 6) {
      setAuthError(t("Please enter a valid 6-digit verification code."));
      return;
    }

    if (!isForgotPasswordValid) {
      setAuthError(t("errors.password_weak"));
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setAuthError(t("Passwords do not match. Please try again."));
      return;
    }

    setAuthSubmitting(true);
    try {
      await api.post("/auth/forgot-password/reset", {
        email: forgotEmail.trim(),
        otp: forgotOtpCode.trim(),
        newPassword: forgotNewPassword,
      });

      // Reset successful -> switch to login tab with success note
      setAuthMode("login");
      setLoginEmail(forgotEmail.trim());
      setLoginPassword("");
      setOtpInfoMsg(t("Password reset successfully. Please log in with your new password."));
      setAuthError("");
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        const key = Array.isArray(msg) ? msg[0] : msg;
        setAuthError(t(key) || key);
      } else {
        setAuthError(t("Something went wrong. Please try again later."));
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  // ── Google Section (shared between login & register) ─────────────────
  const renderGoogleSection = () => (
    <>
      <OrDivider label={t("or")} />
      {isGoogleOAuthEnabled ? (
        <div className="w-full flex justify-center mt-2">
          <div id="google-signin-btn" />
        </div>
      ) : IS_DEV ? (
        <GoogleSignInButton
          onClick={handleGoogleSimulation}
          label={
            lang === "ar"
              ? "المواصلة باستخدام Google"
              : "Continue with Google"
          }
        />
      ) : null}
    </>
  );

  return (
    <div
      className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          setAuthError("");
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={authMode === "login" ? t("Login") : t("Register")}
    >
      {/* Outer Container enabling floating cards outside modal without clipping */}
      <div className="relative max-w-sm sm:max-w-md w-full my-auto shrink-0 py-2">
        {/* Floating Decorative Badges */}
        <div className="hidden sm:flex absolute -left-5 sm:-left-7 top-[28%] -rotate-12 w-13 h-13 sm:w-14 sm:h-14 bg-white border border-[#E9E4DC] rounded-2xl shadow-xl p-1.5 items-center justify-center z-20 pointer-events-none">
          <span className="text-2xl select-none" aria-hidden="true">🎂</span>
        </div>
        <div className="hidden sm:flex absolute -right-4 sm:-right-6 bottom-[12%] rotate-6 w-14 h-18 sm:w-16 sm:h-20 bg-white border border-[#E9E4DC] rounded-2xl shadow-xl p-1.5 flex-col justify-between z-20 pointer-events-none">
          <div className="w-full h-[65%] rounded-xl bg-[#FAF9F6] overflow-hidden flex items-center justify-center select-none text-xl" aria-hidden="true">
            🎈
          </div>
          <div className="flex items-center justify-center select-none text-sm leading-none -mt-1 font-serif text-black" aria-hidden="true">
            🧑‍🤝‍🧑
          </div>
        </div>

        {/* Inner Modal Card Container with Rounded Corners & Clipping */}
        <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[28px] sm:rounded-[32px] w-full shadow-2xl relative flex flex-col max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={() => {
              onClose();
              setAuthError("");
            }}
            className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-neutral-400 hover:text-black transition-colors cursor-pointer p-1.5 rounded-full hover:bg-neutral-200/50 z-30"
            aria-label="Close dialog"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Inner Scroll Body */}
          <div className="w-full h-full overflow-y-auto custom-scrollbar p-5 sm:p-7 flex flex-col items-center">

        {/* Capsule tabs (Login / Register) */}
        {authMode !== "forgot" && (
          <div
            className="bg-neutral-100 border border-neutral-200/60 rounded-xl p-1 flex w-full mb-6 mt-2"
            role="tablist"
          >
            <button
              role="tab"
              aria-selected={authMode === "login"}
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
                setRegStep("details");
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
              role="tab"
              aria-selected={authMode === "register"}
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
        )}

        {/* Info Banner */}
        {otpInfoMsg && (
          <div className="w-full mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] text-emerald-700 flex items-center justify-center gap-2">
            <span>✓</span>
            <span>{otpInfoMsg}</span>
          </div>
        )}

        {/* Error Banner */}
        {authError && (
          <div
            className="w-full mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 flex items-start gap-2"
            role="alert"
          >
            <svg
              className="w-4 h-4 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01"
              />
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
                  onClick={() => {
                    setAuthMode("forgot");
                    setForgotStep("email");
                    setForgotEmail(loginEmail);
                    setAuthError("");
                    setOtpInfoMsg("");
                  }}
                  className="text-[10px] text-neutral-500 hover:text-black transition-colors cursor-pointer"
                >
                  {t("Forgot Password?")}
                </button>
              </div>

              <PasswordInput
                value={loginPassword}
                onChange={setLoginPassword}
                placeholder={t("Password")}
                disabled={authSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] text-[#E5C38B] font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm mt-5 mb-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              {authSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  {t("Logging in...")}
                </>
              ) : (
                t("Login")
              )}
            </button>

            {renderGoogleSection()}
          </form>
        ) : authMode === "forgot" ? (
          forgotStep === "email" ? (
            /* Forgot Password Step 1: Enter Email */
            <form onSubmit={handleSendForgotPasswordOtp} className="w-full flex flex-col">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#F5EDE1] text-[#0B1528] flex items-center justify-center mx-auto mb-3 text-xl shadow-sm select-none">
                  🔐
                </div>
                <h2 className="text-2xl font-serif font-medium text-neutral-800 mb-1">
                  {t("Reset Password")}
                </h2>
                <p className="text-[11px] text-neutral-500 leading-relaxed px-2">
                  {t("Enter your registered email address to receive a verification code.")}
                </p>
              </div>

              <div className="flex flex-col gap-3 my-2">
                <input
                  type="email"
                  placeholder={t("Email Address")}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={authSubmitting}
                  className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting || !forgotEmail.trim()}
                className="w-full bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] disabled:opacity-50 text-[#E5C38B] font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm mt-5 mb-3 flex items-center justify-center gap-2 cursor-pointer"
              >
                {authSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    {t("Sending Code...")}
                  </>
                ) : (
                  t("Send Reset Code")
                )}
              </button>

              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setOtpInfoMsg("");
                  }}
                  className="text-neutral-500 hover:text-black text-[11px] transition-colors"
                >
                  ← {t("Back to Login")}
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password Step 2: OTP & New Password */
            <form onSubmit={handleResetPasswordSubmit} className="w-full flex flex-col">
              <div className="text-center mb-5">
                <h2 className="text-2xl font-serif font-medium text-neutral-800 mb-1">
                  {t("Reset Password")}
                </h2>
                <p className="text-[11px] text-neutral-500 leading-relaxed px-2">
                  {t("We sent a 6-digit verification code to")} <br />
                  <span className="font-semibold text-neutral-800">{forgotEmail}</span>
                </p>
              </div>

              <div className="space-y-4 my-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-2 text-center">
                    {t("OTP Verification")}
                  </label>
                  <OtpBoxes
                    value={forgotOtpCode}
                    onChange={setForgotOtpCode}
                    disabled={authSubmitting}
                    idPrefix="forgot-otp"
                  />
                </div>

                <PasswordInput
                  value={forgotNewPassword}
                  onChange={setForgotNewPassword}
                  placeholder={t("New Password")}
                  disabled={authSubmitting}
                />

                <PasswordInput
                  value={forgotConfirmPassword}
                  onChange={setForgotConfirmPassword}
                  placeholder={t("Confirm Password")}
                  disabled={authSubmitting}
                />

                {/* Password Requirement Checklist */}
                <div className="bg-white border border-[#EBE6DC] rounded-xl p-3 text-[11px] space-y-1.5 transition-all text-left rtl:text-right">
                  <p className="font-semibold text-neutral-700 text-[11px] mb-1">
                    {t("Password Requirements:")}
                  </p>
                  <ul className="space-y-1.5">
                    <li className={`flex items-center gap-2 transition-colors ${
                      forgotHasMinLength ? "text-emerald-700 font-medium" : forgotNewPassword ? "text-red-500 font-medium" : "text-neutral-500"
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        forgotHasMinLength ? "bg-emerald-100 text-emerald-700" : forgotNewPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                      }`}>
                        {forgotHasMinLength ? "✓" : "✕"}
                      </span>
                      <span>{t("At least 8 characters")}</span>
                    </li>

                    <li className={`flex items-center gap-2 transition-colors ${
                      forgotHasUpper ? "text-emerald-700 font-medium" : forgotNewPassword ? "text-red-500 font-medium" : "text-neutral-500"
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        forgotHasUpper ? "bg-emerald-100 text-emerald-700" : forgotNewPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                      }`}>
                        {forgotHasUpper ? "✓" : "✕"}
                      </span>
                      <span>{t("At least one uppercase letter (A-Z)")}</span>
                    </li>

                    <li className={`flex items-center gap-2 transition-colors ${
                      forgotHasLower ? "text-emerald-700 font-medium" : forgotNewPassword ? "text-red-500 font-medium" : "text-neutral-500"
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        forgotHasLower ? "bg-emerald-100 text-emerald-700" : forgotNewPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                      }`}>
                        {forgotHasLower ? "✓" : "✕"}
                      </span>
                      <span>{t("At least one lowercase letter (a-z)")}</span>
                    </li>

                    <li className={`flex items-center gap-2 transition-colors ${
                      forgotHasNumberOrSpecial ? "text-emerald-700 font-medium" : forgotNewPassword ? "text-red-500 font-medium" : "text-neutral-500"
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        forgotHasNumberOrSpecial ? "bg-emerald-100 text-emerald-700" : forgotNewPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                      }`}>
                        {forgotHasNumberOrSpecial ? "✓" : "✕"}
                      </span>
                      <span>{t("At least one number or symbol")}</span>
                    </li>

                    <li className={`flex items-center gap-2 transition-colors ${
                      forgotPasswordsMatch ? "text-emerald-700 font-medium" : forgotConfirmPassword ? "text-red-500 font-medium" : "text-neutral-500"
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        forgotPasswordsMatch ? "bg-emerald-100 text-emerald-700" : forgotConfirmPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                      }`}>
                        {forgotPasswordsMatch ? "✓" : "✕"}
                      </span>
                      <span>{forgotConfirmPassword && !forgotPasswordsMatch ? t("Passwords do not match") : t("Passwords match")}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting || forgotOtpCode.length !== 6 || !isForgotPasswordValid || !forgotPasswordsMatch}
                className="w-full bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] disabled:opacity-50 text-[#E5C38B] font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm mt-5 mb-3 flex items-center justify-center gap-2 cursor-pointer"
              >
                {authSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    {t("Saving Changes...")}
                  </>
                ) : (
                  t("Reset Password")
                )}
              </button>

              <div className="flex items-center justify-between mt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep("email");
                    setAuthError("");
                  }}
                  className="text-neutral-500 hover:text-black text-[11px] transition-colors"
                >
                  ← {t("Edit Info")}
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || authSubmitting}
                  onClick={handleSendForgotPasswordOtp}
                  className="text-[11px] font-semibold text-[#0B1528] disabled:text-neutral-400 hover:underline transition-all"
                >
                  {resendTimer > 0
                    ? `${t("Resend Code")} (${resendTimer}s)`
                    : t("Resend Code")}
                </button>
              </div>
            </form>
          )
        ) : regStep === "details" ? (
          <form
            onSubmit={handleSendOtp}
            className="w-full flex flex-col"
          >
            <div className="text-center mb-5">
              <h2 className="text-2xl font-serif font-medium text-neutral-800 mb-1">
                {t("Create Account")}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {t(
                  "Join us to save and coordinate your event invitations",
                )}
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
                placeholder={t("Email Address")}
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                disabled={authSubmitting}
                className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />

              <PhoneInput
                value={regPhone}
                onChange={setRegPhone}
                disabled={authSubmitting}
              />

              <PasswordInput
                value={regPassword}
                onChange={setRegPassword}
                placeholder={t("Password (Min. 8 characters)")}
                disabled={authSubmitting}
              />

              <PasswordInput
                value={regConfirmPassword}
                onChange={setRegConfirmPassword}
                placeholder={t("Confirm Password")}
                disabled={authSubmitting}
              />

              {/* Dynamic Password Requirement Checklist */}
              <div className="bg-[#FAF7F2] border border-[#EBE6DC] rounded-xl p-3 text-[11px] space-y-1.5 transition-all text-left rtl:text-right">
                <p className="font-semibold text-neutral-700 text-[11px] mb-1">
                  {t("Password Requirements:")}
                </p>
                <ul className="space-y-1.5">
                  <li className={`flex items-center gap-2 transition-colors ${
                    hasMinLength ? "text-emerald-700 font-medium" : regPassword ? "text-red-500 font-medium" : "text-neutral-500"
                  }`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      hasMinLength ? "bg-emerald-100 text-emerald-700" : regPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                    }`}>
                      {hasMinLength ? "✓" : "✕"}
                    </span>
                    <span>{t("At least 8 characters")}</span>
                  </li>

                  <li className={`flex items-center gap-2 transition-colors ${
                    hasUpper ? "text-emerald-700 font-medium" : regPassword ? "text-red-500 font-medium" : "text-neutral-500"
                  }`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      hasUpper ? "bg-emerald-100 text-emerald-700" : regPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                    }`}>
                      {hasUpper ? "✓" : "✕"}
                    </span>
                    <span>{t("At least one uppercase letter (A-Z)")}</span>
                  </li>

                  <li className={`flex items-center gap-2 transition-colors ${
                    hasLower ? "text-emerald-700 font-medium" : regPassword ? "text-red-500 font-medium" : "text-neutral-500"
                  }`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      hasLower ? "bg-emerald-100 text-emerald-700" : regPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                    }`}>
                      {hasLower ? "✓" : "✕"}
                    </span>
                    <span>{t("At least one lowercase letter (a-z)")}</span>
                  </li>

                  <li className={`flex items-center gap-2 transition-colors ${
                    hasNumberOrSpecial ? "text-emerald-700 font-medium" : regPassword ? "text-red-500 font-medium" : "text-neutral-500"
                  }`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      hasNumberOrSpecial ? "bg-emerald-100 text-emerald-700" : regPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                    }`}>
                      {hasNumberOrSpecial ? "✓" : "✕"}
                    </span>
                    <span>{t("At least one number or symbol")}</span>
                  </li>

                  <li className={`flex items-center gap-2 transition-colors ${
                    passwordsMatch ? "text-emerald-700 font-medium" : regConfirmPassword ? "text-red-500 font-medium" : "text-neutral-500"
                  }`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      passwordsMatch ? "bg-emerald-100 text-emerald-700" : regConfirmPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                    }`}>
                      {passwordsMatch ? "✓" : "✕"}
                    </span>
                    <span>{regConfirmPassword && !passwordsMatch ? t("Passwords do not match") : t("Passwords match")}</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] text-[#E5C38B] font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm mt-5 mb-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              {authSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  {t("Sending Code...")}
                </>
              ) : (
                t("Send Code")
              )}
            </button>

            {renderGoogleSection()}
          </form>
        ) : (
          /* Step 2: Registration OTP Code Verification Screen */
          <form onSubmit={handleRegisterSubmit} className="w-full flex flex-col">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#F5EDE1] text-[#0B1528] flex items-center justify-center mx-auto mb-3 text-xl shadow-sm select-none">
                ✉️
              </div>
              <h2 className="text-2xl font-serif font-medium text-neutral-800 mb-1">
                {t("Verify Email")}
              </h2>
              <p className="text-[11px] text-neutral-500 leading-relaxed px-2">
                {t("We sent a 6-digit verification code to")} <br />
                <span className="font-semibold text-neutral-800">{regEmail}</span>
              </p>
            </div>

            <div className="my-2">
              <OtpBoxes
                value={otpCode}
                onChange={setOtpCode}
                disabled={authSubmitting}
                idPrefix="reg-otp"
              />
            </div>

            <button
              type="submit"
              disabled={authSubmitting || otpCode.length !== 6}
              className="w-full bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] disabled:opacity-50 text-[#E5C38B] font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm mt-6 mb-3 flex items-center justify-center gap-2 cursor-pointer"
            >
              {authSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  {t("Registering...")}
                </>
              ) : (
                t("Verify & Complete Registration")
              )}
            </button>

            <div className="flex items-center justify-between mt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setRegStep("details");
                  setAuthError("");
                }}
                className="text-neutral-500 hover:text-black text-[11px] transition-colors flex items-center gap-1"
              >
                <span>←</span> {t("Edit Info")}
              </button>

              <button
                type="button"
                disabled={resendTimer > 0 || authSubmitting}
                onClick={handleSendOtp}
                className="text-[11px] font-semibold text-[#0B1528] disabled:text-neutral-400 hover:underline transition-all"
              >
                {resendTimer > 0
                  ? `${t("Resend Code")} (${resendTimer}s)`
                  : t("Resend Code")}
              </button>
            </div>
          </form>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
