"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import type { LoginResponse } from "@/types/invitation";

// ── Validation helpers ──────────────────────────────────────────────────

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
}

function validateForm(form: FormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.firstName.trim()) {
    errors.firstName = "First name is required";
  } else if (form.firstName.trim().length > 50) {
    errors.firstName = "First name must be 50 characters or less";
  }

  if (!form.lastName.trim()) {
    errors.lastName = "Last name is required";
  } else if (form.lastName.trim().length > 50) {
    errors.lastName = "Last name must be 50 characters or less";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (!/^\+?[1-9]\d{7,14}$/.test(form.phoneNumber.trim())) {
    errors.phoneNumber = "Use international format (e.g. +966501234567)";
  }

  return errors;
}

// ── Types ───────────────────────────────────────────────────────────────

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

const INITIAL_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
};

// ── Component ───────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // ── Redirect if already logged in ────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        router.replace(
          user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/client",
        );
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }
  }, [router]);

  // ── Live validation on touched fields ────────────────────────────────
  useEffect(() => {
    if (touched.size === 0) return;
    const errors = validateForm(form);
    // Only show errors for fields the user has touched
    const filteredErrors: FieldErrors = {};
    for (const key of touched) {
      const k = key as keyof FieldErrors;
      if (errors[k]) filteredErrors[k] = errors[k];
    }
    setFieldErrors(filteredErrors);
  }, [form, touched]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setApiError("");
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => new Set(prev).add(e.target.name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    // Mark all fields as touched for full validation
    setTouched(new Set(Object.keys(form)));

    // Run validation
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      const res = await api.post<LoginResponse>("/auth/register", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        phoneNumber: form.phoneNumber.trim(),
      });

      const { accessToken, user } = res.data;

      // Auto-login: store auth data
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect to client dashboard (new users are always CLIENT role)
      router.push("/dashboard/client");
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string | string[]; statusCode?: number } };
      };

      if (axiosErr.response?.data?.message) {
        // NestJS can return message as string or string[]
        const msg = axiosErr.response.data.message;
        setApiError(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setApiError("Something went wrong. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6">
      {/* ── Decorative background glow ─────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* ── Logo ─────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h2 className="text-2xl font-bold text-white">
              💌 <span className="text-indigo-400">Mazoom</span>
            </h2>
          </Link>
          <p className="mt-2 text-sm text-gray-500">
            Create your digital wedding invitation
          </p>
        </div>

        {/* ── Card ──────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-md">
          <h1 className="mb-6 text-center text-xl font-semibold text-white">
            Create Your Account
          </h1>

          {/* ── API Error Banner ─────────────────────────────────── */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
            >
              <div className="flex items-start gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 shrink-0"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M12 8v4M12 16h.01"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {apiError}
              </div>
            </motion.div>
          )}

          {/* ── Form ────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="register-firstName"
                name="firstName"
                label="First Name"
                placeholder="Ahmed"
                value={form.firstName}
                error={fieldErrors.firstName}
                disabled={submitting}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="given-name"
              />
              <FormField
                id="register-lastName"
                name="lastName"
                label="Last Name"
                placeholder="Al-Rashid"
                value={form.lastName}
                error={fieldErrors.lastName}
                disabled={submitting}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="family-name"
              />
            </div>

            {/* Email */}
            <FormField
              id="register-email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={form.email}
              error={fieldErrors.email}
              disabled={submitting}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
            />

            {/* Phone Number */}
            <FormField
              id="register-phoneNumber"
              name="phoneNumber"
              type="tel"
              label="Phone Number (WhatsApp)"
              placeholder="+966501234567"
              value={form.phoneNumber}
              error={fieldErrors.phoneNumber}
              disabled={submitting}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="tel"
              hint="Used for order coordination via WhatsApp"
            />

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  disabled={submitting}
                  className={`w-full rounded-lg border bg-gray-800 px-4 py-3 pr-11 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 disabled:opacity-50 ${
                    fieldErrors.password
                      ? "border-red-500/50"
                      : "border-gray-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.password}
                </p>
              )}
              {/* Password strength hint */}
              {form.password && !fieldErrors.password && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength = getPasswordStrength(form.password);
                    return (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= strength
                            ? strength <= 1
                              ? "bg-red-400"
                              : strength <= 2
                                ? "bg-amber-400"
                                : strength <= 3
                                  ? "bg-emerald-400"
                                  : "bg-indigo-400"
                            : "bg-gray-700"
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* ── Login link ──────────────────────────────────────── */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}

// ── Reusable Form Field ─────────────────────────────────────────────────

function FormField({
  id,
  name,
  type = "text",
  label,
  placeholder,
  value,
  error,
  disabled,
  onChange,
  onBlur,
  autoComplete,
  hint,
}: {
  id: string;
  name: string;
  type?: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-gray-300"
      >
        {label} <span className="text-red-400">*</span>
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`w-full rounded-lg border bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 disabled:opacity-50 ${
          error ? "border-red-500/50" : "border-gray-700"
        }`}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-600">{hint}</p>
      ) : null}
    </div>
  );
}

// ── Password strength calculator ────────────────────────────────────────

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
