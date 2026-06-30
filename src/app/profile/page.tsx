"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/components/LanguageContext";
import type { AxiosError } from "axios";

interface UserProfile {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);



  useEffect(() => {
    // 1. Check Auth token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // Redirect to login if not authenticated
        router.replace("/?auth=login");
        return;
      }
    }

    // 2. Fetch User Profile from backend
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await api.get<UserProfile>("/users/profile");
        setProfile(res.data);
        setFirstName(res.data.firstName);
        setLastName(res.data.lastName);
        setEmail(res.data.email);
        setPhoneNumber(res.data.phoneNumber);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(t("Failed to load user profile. Make sure the backend server is running."));
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router, t]);



  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim()) {
      setErrorMessage(t("All fields except new password are required."));
      return;
    }

    if (password && password.length < 8) {
      setErrorMessage(t("Password must be at least 8 characters long."));
      return;
    }

    setSaving(true);
    try {
      const updatePayload: Record<string, string> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      if (password) {
        updatePayload.password = password;
      }

      const res = await api.put<UserProfile>("/users/profile", updatePayload);
      const updatedProfile = res.data;

      // Update states
      setProfile(updatedProfile);
      setFirstName(updatedProfile.firstName);
      setLastName(updatedProfile.lastName);
      setEmail(updatedProfile.email);
      setPhoneNumber(updatedProfile.phoneNumber);
      setPassword(""); // Clear password field

      // Synchronize update back to user in header & local storage
      const userMeta = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        role: updatedProfile.role,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phoneNumber: updatedProfile.phoneNumber,
      };
      localStorage.setItem("user", JSON.stringify(userMeta));

      setSuccessMessage(t("Your profile has been updated successfully."));
      
      // Auto-clear success message after 4s
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      console.error("Error updating user profile:", error);
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        setErrorMessage(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setErrorMessage(t("An unexpected error occurred while updating profile."));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout>
      {/* ── PROFILE SECTION WORKSPACE ───────────────────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-10 py-12">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#2D3142] tracking-tight">
            {t("My Profile Settings")}
          </h1>
          <p className="mt-2 text-xs text-[#7F8487] leading-relaxed max-w-xl">
            {t("View your account details and update your credentials or contact info. Changes will apply immediately to your active session.")}
          </p>
        </div>

        {loading ? (
          /* Loading State */
          <div className="bg-white border border-[#E6E2DA] rounded-[24px] p-20 flex flex-col items-center justify-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full border-4 border-[#FAF9F6] border-t-black animate-spin"></div>
            <p className="text-xs text-[#7F8487] font-medium">{t("Fetching profile details...")}</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-white border border-[#E6E2DA] rounded-[24px] p-12 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm text-[#2D3142] mb-1">{t("Could Not Load Profile")}</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed mb-4">{error}</p>
            <button
              onClick={() => router.refresh()}
              className="px-6 h-10 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {t("Reload Page")}
            </button>
          </div>
        ) : (

            /* Main Form Grid */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Summary Card */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-[#E6E2DA] rounded-[24px] p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                  {/* Decorative card background circle */}
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#FAF8F5] pointer-events-none"></div>
                  
                  {/* Profile Avatar Frame */}
                  <div className="w-20 h-20 rounded-full border border-[#E6E2DA] bg-[#FAF9F6] flex items-center justify-center text-3xl mb-4 shadow-inner relative z-10 select-none">
                    👤
                  </div>
                  
                  <h3 className="font-sans font-bold text-[#2D3142] text-[16px] leading-tight">
                    {profile?.firstName} {profile?.lastName}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-[#B89C72] font-bold mt-1.5 px-3 py-1 bg-[#FAF8F5] border border-[#EBE7DF] rounded-full">
                    {t(`${profile?.role} Account`)}
                  </span>

                  <hr className="w-full my-5 border-[#FAF8F5]" />

                  <div className="w-full text-left space-y-3.5 text-xs text-[#7F8487]">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-neutral-400 font-bold">{t("Email Address")}</span>
                      <span className="font-medium text-[#2D3142] break-all">{profile?.email}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-neutral-400 font-bold">{t("Phone Number")}</span>
                      <span className="font-medium text-[#2D3142]">{profile?.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-neutral-400 font-bold">{t("Member Since")}</span>
                      <span className="font-medium text-[#2D3142]">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Edit Profile Form */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-[#E6E2DA] rounded-[24px] p-8 shadow-sm">
                  <h2 className="text-[16px] font-sans font-bold text-[#2D3142] mb-6">
                    {t("Edit Profile Details")}
                  </h2>

                  {/* Status Alerts */}
                  {successMessage && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 flex items-start gap-2.5 animate-fadeIn">
                      <svg className="w-4.5 h-4.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="leading-tight font-medium">{successMessage}</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
                      <svg className="w-4.5 h-4.5 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="leading-tight font-medium">{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    {/* First & Last Name Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1.5">{t("First Name")}</label>
                        <input
                          type="text"
                          placeholder={t("First Name")}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={saving}
                          className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1.5">{t("Last Name")}</label>
                        <input
                          type="text"
                          placeholder={t("Last Name")}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={saving}
                          className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1.5">{t("Email Address")}</label>
                      <input
                        type="email"
                        placeholder={t("Email Address")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={saving}
                        className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      />
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1.5">{t("Phone Number")}</label>
                      <input
                        type="tel"
                        placeholder={t("Phone Number (e.g. +966501234567)")}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={saving}
                        className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      />
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1.5">{t("New Password (leave blank to keep current)")}</label>
                      <div className="relative w-full">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={t("Enter at least 8 characters")}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={saving}
                          className="w-full bg-white border border-[#E6E2DA] rounded-xl pl-4 pr-10 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                        >
                          {showPassword ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-[#2D3142] hover:bg-neutral-800 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {saving ? (
                          <>
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                            {t("Saving Changes...")}
                          </>
                        ) : (
                          t("Save Profile Settings")
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              
            </div>
          )}
        </main>
      </PageLayout>
  );
}
