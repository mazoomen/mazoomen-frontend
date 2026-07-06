"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import { useLanguage } from "@/components/LanguageContext";
import type { Template } from "@/types/template";
import { Modal, Button } from "@/components/ui";
import type { AxiosError } from "axios";

interface CheckoutModalProps {
  buyingTemplate: Template | null;
  onClose: () => void;
}

export default function CheckoutModal({
  buyingTemplate,
  onClose,
}: CheckoutModalProps) {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [contactPhone, setContactPhone] = useState("");
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [purchaseLanguageMode] = useState("both");

  useEffect(() => {
    if (buyingTemplate && typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setContactPhone(user.phoneNumber || "");
        } catch (e) {
          logger.error("Failed to parse user for checkout prep", e);
        }
      }
      setCheckoutSuccess(false);
      setCheckoutError("");
    }
  }, [buyingTemplate]);

  if (!buyingTemplate) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim()) {
      setCheckoutError(lang === "ar" ? "يرجى إدخال رقم الهاتف." : "Please enter your phone number.");
      return;
    }

    setCheckoutSubmitting(true);
    setCheckoutError("");

    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      let email = "user@example.com";
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          email = user.email || "user@example.com";
        } catch {}
      }

      await api.post("/purchase-requests", {
        templateId: buyingTemplate.id,
        contactEmail: email,
        contactPhone: contactPhone.trim(),
        languageMode: purchaseLanguageMode,
      });

      // Synchronize phone number to localStorage user object if it was updated
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (!user.phoneNumber || user.phoneNumber.trim() === "") {
            user.phoneNumber = contactPhone.trim();
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch {}
      }

      setCheckoutSuccess(true);
      setTimeout(() => {
        onClose();
        router.push("/dashboard/client/orders");
      }, 1500);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      logger.error("Failed to submit purchase request", err);
      setCheckoutError(
        error.response?.data?.message ||
          (lang === "ar"
            ? "فشل تقديم طلب الشراء. يرجى المحاولة مرة أخرى."
            : "Failed to submit purchase request. Please try again.")
      );
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!buyingTemplate}
      onClose={onClose}
      backdrop="dark"
      showCloseButton={!checkoutSuccess}
      className="bg-[#FAF9F6] border border-[#E6E2DA] rounded-[24px] max-w-md w-full p-8 shadow-2xl relative text-right font-sans"
      ariaLabel={lang === "ar" ? "شراء القالب" : "Purchase Template"}
    >
      {checkoutSuccess ? (
        <div className="text-center py-8 space-y-4" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="flex justify-center text-emerald-600 animate-bounce">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-neutral-800">
            {lang === "ar" ? "تم تقديم طلبك بنجاح!" : "Order Submitted Successfully!"}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
            {lang === "ar"
              ? "لقد تم تسجيل طلب الشراء للقالب بنجاح. سيقوم المسؤول بمراجعته وتفعيله لك قريباً."
              : "Your template purchase request has been submitted. The administrator will review and activate it shortly."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleCheckoutSubmit} className="space-y-6" dir="rtl">
          <div>
            <span className="text-[10px] tracking-widest text-[#B89C72] font-bold uppercase">
              {lang === "ar" ? "شراء قالب" : "BUY TEMPLATE"}
            </span>
            <h3 className="text-xl font-serif font-medium text-neutral-800 mt-1">
              {buyingTemplate.title}
            </h3>
            <p className="text-xs text-neutral-400 mt-2">
              {t(buyingTemplate.description)}
            </p>
          </div>

          <div className="h-px bg-[#EBE7DF]" />

          <div className="space-y-4">
            <div>
              <label htmlFor="checkoutPhone" className="block text-xs font-semibold text-neutral-700 mb-1">
                {lang === "ar" ? "رقم الجوال للتواصل" : "Contact Phone"}
              </label>
              <input
                id="checkoutPhone"
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+966500000000"
                className="w-full px-4 py-2.5 bg-white border border-[#E6E2DA] rounded-xl text-xs focus:outline-none focus:border-[#B89C72] text-left font-mono"
                dir="ltr"
              />
            </div>
          </div>

          {checkoutError && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg text-center font-medium" role="alert">
              {checkoutError}
            </p>
          )}

          <div className="flex justify-between items-center gap-4">
            <div className="text-right shrink-0">
              <span className="text-[10px] text-neutral-400 block">
                {lang === "ar" ? "الإجمالي" : "Total Price"}
              </span>
              <span className="text-base font-bold text-neutral-800">
                ${buyingTemplate.price}
              </span>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={checkoutSubmitting}
              className="flex-1 !rounded-xl"
            >
              {lang === "ar" ? "تأكيد طلب الشراء" : "Confirm Purchase"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
