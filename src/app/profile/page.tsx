"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/components/LanguageContext";
import { Spinner, ErrorState, PasswordInput, PhoneInput } from "@/components/ui";
import type { UserProfile } from "@/types/auth";
import type { AxiosError } from "axios";

// ── 6-Digit OTP Box Component ──────────────────────────────────────────
function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
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
      const nextInput = document.getElementById(`profile-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`profile-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const targetIndex = Math.min(pasted.length, 5);
      const targetInput = document.getElementById(`profile-otp-${targetIndex}`);
      targetInput?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 dir-ltr">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          id={`profile-otp-${idx}`}
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

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Status states
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Change Password Modal & OTP state
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [pwdOtpCode, setPwdOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdErrorMsg, setPwdErrorMsg] = useState("");
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Password complexity checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumberOrSpecial = /[0-9\W]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumberOrSpecial;
  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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
      setErrorMessage(t("All fields are required."));
      return;
    }

    setSaving(true);
    try {
      const updatePayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      const res = await api.put<UserProfile>("/users/profile", updatePayload);
      const updatedProfile = res.data;

      setProfile(updatedProfile);
      setFirstName(updatedProfile.firstName);
      setLastName(updatedProfile.lastName);
      setEmail(updatedProfile.email);
      setPhoneNumber(updatedProfile.phoneNumber || "");

      // Synchronize update back to localStorage
      const userMeta = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        role: updatedProfile.role,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phoneNumber: updatedProfile.phoneNumber,
        avatarUrl: updatedProfile.avatarUrl,
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

  // ── Avatar Upload and Delete Handlers ─────────────────────────────────────
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage(t("Please select a valid image file."));
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage(t("File size exceeds the allowed limit of 20MB."));
      return;
    }

    setUploadingAvatar(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post<UserProfile>("/users/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedProfile = res.data;
      setProfile(updatedProfile);

      const userMeta = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        role: updatedProfile.role,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phoneNumber: updatedProfile.phoneNumber,
        avatarUrl: updatedProfile.avatarUrl,
      };
      localStorage.setItem("user", JSON.stringify(userMeta));

      setSuccessMessage(t("Profile picture updated successfully."));
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      logger.error("Error uploading profile photo", err);
      const error = err as AxiosError<{ message?: string | string[] }>;
      const msg = error.response?.data?.message;
      setErrorMessage(t(Array.isArray(msg) ? msg[0] : msg || "Failed to upload profile picture."));
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.delete<UserProfile>("/users/profile/avatar");
      const updatedProfile = res.data;
      setProfile(updatedProfile);

      const userMeta = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        role: updatedProfile.role,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phoneNumber: updatedProfile.phoneNumber,
        avatarUrl: null,
      };
      localStorage.setItem("user", JSON.stringify(userMeta));

      setSuccessMessage(t("Profile picture removed."));
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      logger.error("Error deleting profile photo", err);
      setErrorMessage(t("Failed to remove profile picture."));
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Open Change Password Modal and Send OTP ─────────────────────────
  const handleOpenPasswordModal = async () => {
    setIsPwdModalOpen(true);
    setPwdOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setPwdErrorMsg("");
    setPwdSuccessMsg("");

    setPwdSubmitting(true);
    try {
      await api.post("/users/change-password/send-otp");
      setResendTimer(60);
      setPwdSuccessMsg(t("Code sent! Please check your email inbox."));
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      const msg = error.response?.data?.message;
      const key = Array.isArray(msg) ? msg[0] : msg;
      setPwdErrorMsg(t(key || "Failed to send verification code. Please try again."));
    } finally {
      setPwdSubmitting(false);
    }
  };

  const handleResendPasswordOtp = async () => {
    setPwdErrorMsg("");
    setPwdSuccessMsg("");
    setPwdSubmitting(true);
    try {
      await api.post("/users/change-password/send-otp");
      setResendTimer(60);
      setPwdSuccessMsg(t("Code sent! Please check your email inbox."));
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      const msg = error.response?.data?.message;
      const key = Array.isArray(msg) ? msg[0] : msg;
      setPwdErrorMsg(t(key || "Failed to send verification code. Please try again."));
    } finally {
      setPwdSubmitting(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErrorMsg("");

    if (!pwdOtpCode || pwdOtpCode.length !== 6) {
      setPwdErrorMsg(t("Please enter a valid 6-digit verification code."));
      return;
    }

    if (!isPasswordValid) {
      setPwdErrorMsg(t("errors.password_weak"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdErrorMsg(t("Passwords do not match. Please try again."));
      return;
    }

    setPwdSubmitting(true);
    try {
      await api.post("/users/change-password", {
        otp: pwdOtpCode.trim(),
        newPassword,
      });

      setSuccessMessage(t("Password updated successfully."));
      setIsPwdModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      const error = err as AxiosError<{ message?: string | string[] }>;
      const msg = error.response?.data?.message;
      const key = Array.isArray(msg) ? msg[0] : msg;
      setPwdErrorMsg(t(key || "Failed to update password. Please check your OTP."));
    } finally {
      setPwdSubmitting(false);
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
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white border border-[#E6E2DA] rounded-[24px] p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#FAF8F5] pointer-events-none" />
                {/* Avatar Upload Container */}
                <div className="relative mb-3 group z-10">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                  <div
                    onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full border-2 border-[#E6E2DA] bg-[#FAF9F6] shadow-md relative overflow-hidden flex items-center justify-center cursor-pointer group-hover:border-[#0B1528] transition-all"
                    title={t("Upload Photo")}
                  >
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}

                    {profile?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatarUrl}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#101F35] to-[#1E2E4A] text-[#E5C38B] font-serif font-bold text-2xl select-none">
                        {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}

                    {/* Camera Badge Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Quick Camera Edit Button (Bottom Right) */}
                  <button
                    type="button"
                    onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 rtl:right-auto rtl:left-0 bg-[#0B1528] text-[#E5C38B] border border-[#1E2E4A] p-2 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
                    title={t("Upload Photo")}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>

                {/* Action buttons (Change Photo / Delete Photo) */}
                <div className="flex items-center gap-2 mb-3 z-10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="text-[#0B1528] font-semibold hover:underline cursor-pointer"
                  >
                    {t("Upload Photo")}
                  </button>
                  {profile?.avatarUrl && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={uploadingAvatar}
                        className="text-red-500 font-semibold hover:underline cursor-pointer"
                      >
                        {t("Remove Photo")}
                      </button>
                    </>
                  )}
                </div>

                <h3 className="font-sans font-bold text-[#2D3142] text-[16px] leading-tight">
                  {profile?.firstName} {profile?.lastName}
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-[#B89C72] font-bold mt-1.5 px-3 py-1 bg-[#FAF8F5] border border-[#EBE7DF] rounded-full">
                  {t(`${profile?.role} Account`)}
                </span>

                <hr className="w-full my-5 border-[#FAF8F5]" />

                <div className="w-full text-left rtl:text-right space-y-3.5 text-xs text-[#7F8487]">
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

              {/* Security & Password Card */}
              <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[24px] p-6 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#2D3142]">
                  <span className="text-lg select-none">🔒</span>
                  <h4 className="font-sans font-bold text-xs">{t("Security & Password")}</h4>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  {t("Change your password securely by verifying your identity with an email OTP code.")}
                </p>
                <button
                  type="button"
                  onClick={handleOpenPasswordModal}
                  className="w-full mt-2 bg-white border border-[#E6E2DA] hover:bg-neutral-50 text-[#0B1528] font-semibold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🔐</span>
                  <span>{t("Change Password")}</span>
                </button>
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
                    <PhoneInput
                      value={phoneNumber}
                      onChange={setPhoneNumber}
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

        {/* Change Password OTP Modal */}
        {isPwdModalOpen && (
          <div
            className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsPwdModalOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-label={t("Change Password")}
          >
            <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[28px] max-w-sm sm:max-w-md w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
              {/* Close Button */}
              <button
                onClick={() => setIsPwdModalOpen(false)}
                className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-neutral-400 hover:text-black transition-colors cursor-pointer p-1.5 rounded-full hover:bg-neutral-200/50"
                aria-label="Close dialog"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#F5EDE1] text-[#0B1528] flex items-center justify-center mx-auto mb-3 text-xl shadow-sm select-none">
                  🔐
                </div>
                <h2 className="text-2xl font-serif font-medium text-neutral-800 mb-1">
                  {t("Change Password")}
                </h2>
                <p className="text-[11px] text-neutral-500 leading-relaxed px-2">
                  {t("We sent a 6-digit verification code to")} <br />
                  <span className="font-semibold text-neutral-800">{email}</span>
                </p>
              </div>

              {/* Status Alerts */}
              {pwdSuccessMsg && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] text-emerald-700 flex items-center justify-center gap-2">
                  <span>✓</span>
                  <span>{pwdSuccessMsg}</span>
                </div>
              )}

              {pwdErrorMsg && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-2.5 text-[11px] text-red-600 flex items-center gap-2">
                  <span>✕</span>
                  <span>{pwdErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-2 text-center">
                    {t("OTP Verification")}
                  </label>
                  <OtpBoxes
                    value={pwdOtpCode}
                    onChange={setPwdOtpCode}
                    disabled={pwdSubmitting}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <PasswordInput
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder={t("New Password")}
                    disabled={pwdSubmitting}
                  />

                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder={t("Confirm Password")}
                    disabled={pwdSubmitting}
                  />
                </div>

                {/* Password Requirement Checklist */}
                <div className="bg-white border border-[#EBE6DC] rounded-xl p-3 text-[11px] space-y-1.5 transition-all text-left rtl:text-right">
                  <p className="font-semibold text-neutral-700 text-[11px] mb-1">
                    {t("Password Requirements:")}
                  </p>
                  <ul className="space-y-1.5">
                    <li className={`flex items-center gap-2 transition-colors ${
                      hasMinLength ? "text-emerald-700 font-medium" : newPassword ? "text-red-500 font-medium" : "text-neutral-500"
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        hasMinLength ? "bg-emerald-100 text-emerald-700" : newPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                      }`}>
                        {hasMinLength ? "✓" : "✕"}
                      </span>
                      <span>{t("At least 8 characters")}</span>
                    </li>

                    <li className={`flex items-center gap-2 transition-colors ${
                      hasUpper ? "text-emerald-700 font-medium" : newPassword ? "text-red-500 font-medium" : "text-neutral-500"
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        hasUpper ? "bg-emerald-100 text-emerald-700" : newPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                      }`}>
                        {hasUpper ? "✓" : "✕"}
                      </span>
                      <span>{t("At least one uppercase letter (A-Z)")}</span>
                    </li>

                    <li className={`flex items-center gap-2 transition-colors ${
                      hasLower ? "text-emerald-700 font-medium" : newPassword ? "text-red-500 font-medium" : "text-neutral-500"
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        hasLower ? "bg-emerald-100 text-emerald-700" : newPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                      }`}>
                        {hasLower ? "✓" : "✕"}
                      </span>
                      <span>{t("At least one lowercase letter (a-z)")}</span>
                    </li>

                    <li className={`flex items-center gap-2 transition-colors ${
                      hasNumberOrSpecial ? "text-emerald-700 font-medium" : newPassword ? "text-red-500 font-medium" : "text-neutral-500"
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        hasNumberOrSpecial ? "bg-emerald-100 text-emerald-700" : newPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                      }`}>
                        {hasNumberOrSpecial ? "✓" : "✕"}
                      </span>
                      <span>{t("At least one number or symbol")}</span>
                    </li>

                    <li className={`flex items-center gap-2 transition-colors ${
                      passwordsMatch ? "text-emerald-700 font-medium" : confirmPassword ? "text-red-500 font-medium" : "text-neutral-500"
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        passwordsMatch ? "bg-emerald-100 text-emerald-700" : confirmPassword ? "bg-red-100 text-red-600" : "bg-neutral-200 text-neutral-500"
                      }`}>
                        {passwordsMatch ? "✓" : "✕"}
                      </span>
                      <span>{confirmPassword && !passwordsMatch ? t("Passwords do not match") : t("Passwords match")}</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={pwdSubmitting || pwdOtpCode.length !== 6 || !isPasswordValid || !passwordsMatch}
                  className="w-full bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] disabled:opacity-50 text-[#E5C38B] font-semibold py-3 rounded-xl text-xs transition-all shadow-sm mt-4 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {pwdSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      {t("Saving Changes...")}
                    </>
                  ) : (
                    t("Verify & Change Password")
                  )}
                </button>

                <div className="flex items-center justify-end mt-2">
                  <button
                    type="button"
                    disabled={resendTimer > 0 || pwdSubmitting}
                    onClick={handleResendPasswordOtp}
                    className="text-[11px] font-semibold text-[#0B1528] disabled:text-neutral-400 hover:underline transition-all"
                  >
                    {resendTimer > 0
                      ? `${t("Resend Code")} (${resendTimer}s)`
                      : t("Resend Code")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </PageLayout>
  );
}
