"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/components/LanguageContext";
import { Spinner, ErrorState, PasswordInput } from "@/components/ui";
import type { UserProfile } from "@/types/auth";
import type { AxiosError } from "axios";

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

  // Status states
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (!user) {
        router.replace("/?auth=login");
        return;
      }
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await api.get<UserProfile>("/users/profile");
        setProfile(res.data);
        setFirstName(res.data.firstName);
        setLastName(res.data.lastName);
        setEmail(res.data.email);
        setPhoneNumber(res.data.phoneNumber || "");
        setError(null);
      } catch (err) {
        logger.error("Error fetching user profile", err);
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

      setProfile(updatedProfile);
      setFirstName(updatedProfile.firstName);
      setLastName(updatedProfile.lastName);
      setEmail(updatedProfile.email);
      setPhoneNumber(updatedProfile.phoneNumber || "");
      setPassword("");

      // Synchronize update back to localStorage
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
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      logger.error("Error updating user profile", err);
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-12">
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
          <div className="bg-white border border-[#E6E2DA] rounded-[24px] p-20 shadow-sm">
            <Spinner label={t("Fetching profile details...")} />
          </div>
        ) : error ? (
          <ErrorState
            title={t("Could Not Load Profile")}
            message={error}
            retryLabel={t("Reload Page")}
            onRetry={() => router.refresh()}
            className="rounded-[24px]"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Summary Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#E6E2DA] rounded-[24px] p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#FAF8F5] pointer-events-none" />
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
                  <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 flex items-start gap-2.5 animate-fadeIn" role="status" aria-live="polite">
                    <svg className="w-4.5 h-4.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="leading-tight font-medium">{successMessage}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn" role="alert">
                    <svg className="w-4.5 h-4.5 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="leading-tight font-medium">{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-5">
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

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1.5">{t("New Password (leave blank to keep current)")}</label>
                    <PasswordInput
                      value={password}
                      onChange={setPassword}
                      placeholder={t("Enter at least 8 characters")}
                      disabled={saving}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] text-[#E5C38B] font-semibold py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
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
