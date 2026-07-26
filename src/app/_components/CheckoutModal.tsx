"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import { useLanguage } from "@/components/LanguageContext";
import { useCurrency } from "@/components/CurrencyContext";
import type { Template } from "@/types/template";
import { Modal, Button } from "@/components/ui";
import { getTemplateTitle, getTemplateDescription } from "@/lib/template-utils";
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
  const { formatPrice, currency, rate } = useCurrency();

  const [contactPhone, setContactPhone] = useState("");
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isInstantApproved, setIsInstantApproved] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [purchaseLanguageMode] = useState("both");

  // Coupon states
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

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
      setIsInstantApproved(false);
      setCheckoutError("");
      setCouponCodeInput("");
      setAppliedCoupon(null);
      setCouponError("");
    }
  }, [buyingTemplate]);

  if (!buyingTemplate) return null;

  const originalPriceInJod = Number(buyingTemplate.price) || 0;
  const discountAmountJod = appliedCoupon
    ? (originalPriceInJod * appliedCoupon.discountPercent) / 100
    : 0;
  const finalPriceJod = Math.max(0, originalPriceInJod - discountAmountJod);
  const finalPriceInCurrency = finalPriceJod * (rate || 1.0);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const res = await api.post<{
        valid: boolean;
        code: string;
        discountPercent: number;
      }>("/coupons/validate", {
        code: couponCodeInput.trim(),
      });

      if (res.data && res.data.valid) {
        setAppliedCoupon({
          code: res.data.code,
          discountPercent: res.data.discountPercent,
        });
        setCouponError("");
      }
    } catch (err: any) {
      logger.error("Failed to validate coupon", err);
      setAppliedCoupon(null);
      const msg = err?.response?.data?.message || "";
      if (msg.includes("coupon_already_used_by_user") || msg.includes("already_used")) {
        setCouponError(
          lang === "ar"
            ? "لقد استخدمت هذا الكوبون من قبل. لا يمكنك استخدامه أكثر من مرة."
            : "You have already used this coupon code once."
        );
      } else if (msg.includes("coupon_limit_reached") || msg.includes("limit_reached")) {
        setCouponError(
          lang === "ar"
            ? "تم الوصول للحد الأقصى لاستخدام هذا الكوبون."
            : "This coupon has reached its maximum usage limit."
        );
      } else {
        setCouponError(
          lang === "ar"
            ? "الكوبون غير صالح أو منتهي الصلاحية"
            : "Invalid or expired coupon code"
        );
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponError("");
  };

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
      let email = "customer@example.com";
      let customerName = "Customer";

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          email = user.email || "customer@example.com";
          if (user.firstName || user.lastName) {
            customerName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
          }
        } catch {}
      }

      // Synchronize phone number to localStorage user object if updated
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (!user.phoneNumber || user.phoneNumber.trim() === "") {
            user.phoneNumber = contactPhone.trim();
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch {}
      }

      // 1. Free purchase (final price === 0 due to 100% coupon or 0 base price)
      if (finalPriceJod === 0) {
        const res = await api.post("/purchase-requests", {
          templateId: buyingTemplate.id,
          contactEmail: email,
          contactPhone: contactPhone.trim(),
          languageMode: purchaseLanguageMode,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        });

        const autoApproved = res.data?.status === "APPROVED" || finalPriceJod === 0;
        setIsInstantApproved(autoApproved);
        setCheckoutSuccess(true);
        setTimeout(() => {
          onClose();
          router.push("/dashboard/client");
        }, 1500);
      } else {
        // 2. Paid purchase (final price > 0): Create Tap Charge & Redirect to Tap Checkout URL
        const precision = ["JOD", "KWD", "BHD", "OMR"].includes(currency) ? 3 : 2;
        const chargeAmount = Number(finalPriceInCurrency.toFixed(precision));

        const res = await api.post<{ checkoutUrl: string; orderId: string }>(
          "/payment/create-charge",
          {
            customerName,
            customerEmail: email,
            templateDetails: {
              templateId: buyingTemplate.id,
              templateTitle: buyingTemplate.title,
              contactPhone: contactPhone.trim(),
              couponCode: appliedCoupon?.code,
              languageMode: purchaseLanguageMode,
            },
            amount: chargeAmount,
            currency: currency || "JOD",
          }
        );

        if (res.data?.checkoutUrl && res.data?.orderId) {
          // Close modal and navigate to custom styled payment page (/payment/checkout)
          onClose();
          router.push(
            `/payment/checkout?orderId=${res.data.orderId}&checkoutUrl=${encodeURIComponent(res.data.checkoutUrl)}`
          );
        } else {
          throw new Error(
            lang === "ar"
              ? "لم يتم استلام رابط صفحة الدفع من بوابة الدفع."
              : "Did not receive checkout URL from payment gateway."
          );
        }
      }
    } catch (err: any) {
      logger.error("Failed to submit checkout", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        (lang === "ar"
          ? "فشل البدء بعملية الدفع. يرجى المحاولة مرة أخرى."
          : "Failed to initiate payment. Please try again.");
      setCheckoutError(errorMsg);
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
            {isInstantApproved
              ? lang === "ar"
                ? "تم شراء وتفعيل القالب بنجاح!"
                : "Template Unlocked & Activated!"
              : lang === "ar"
              ? "تم تقديم طلبك بنجاح!"
              : "Order Submitted Successfully!"}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
            {isInstantApproved
              ? lang === "ar"
                ? "تم تطبيق الخصم بنسبة 100% وتفعيل القالب في حسابك مباشرة بدون انتظار موافقة الإدارة. يمكنك الآن بدء تعديل دعوتك!"
                : "100% discount applied and template activated immediately in your account. You can now start customizing your invitation!"
              : lang === "ar"
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
              {getTemplateTitle(buyingTemplate, lang)}
            </h3>
            <p className="text-xs text-neutral-400 mt-2">
              {getTemplateDescription(buyingTemplate, lang)}
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

            {/* Coupon Code Section */}
            <div>
              <label htmlFor="couponInput" className="block text-xs font-semibold text-neutral-700 mb-1">
                {lang === "ar" ? "كود الخصم (كوبون)" : "Coupon Code"}
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md uppercase font-mono">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-xs text-emerald-700 font-medium">
                      {lang === "ar"
                        ? `خصم ${appliedCoupon.discountPercent}% مطبق`
                        : `${appliedCoupon.discountPercent}% discount applied`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                  >
                    {lang === "ar" ? "إلغاء" : "Remove"}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    id="couponInput"
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder={lang === "ar" ? "أدخل الكوبون (مثلاً: mazoomen)" : "Enter code (e.g. mazoomen)"}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#E6E2DA] rounded-xl text-xs focus:outline-none focus:border-[#B89C72] font-mono uppercase"
                    dir="ltr"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    isLoading={validatingCoupon}
                    disabled={!couponCodeInput.trim() || validatingCoupon}
                    className="!rounded-xl border-[#B89C72] text-[#B89C72] hover:bg-[#B89C72] hover:text-white shrink-0"
                  >
                    {lang === "ar" ? "تطبيق" : "Apply"}
                  </Button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {couponError}
                </p>
              )}
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
              {appliedCoupon ? (
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-400 line-through">
                    {formatPrice(buyingTemplate.price)}
                  </span>
                  <span className="text-base font-bold text-emerald-600">
                    {formatPrice(finalPriceJod)}
                  </span>
                </div>
              ) : (
                <span className="text-base font-bold text-neutral-800">
                  {formatPrice(buyingTemplate.price)}
                </span>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={checkoutSubmitting}
              className="flex-1 !rounded-xl"
            >
              {finalPriceJod === 0
                ? lang === "ar"
                  ? "تأكيد طلب الشراء (مجاناً)"
                  : "Confirm Purchase (Free)"
                : lang === "ar"
                ? "الانتقال إلى الدفع"
                : "Proceed to Payment"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
