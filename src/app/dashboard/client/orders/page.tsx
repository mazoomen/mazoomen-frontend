"use client";

import { useEffect, useState, useCallback } from "react";
import { getS3Url } from "@/lib/s3";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import { useLanguage } from "@/components/LanguageContext";
import { getTemplateTitle } from "@/lib/template-utils";
import { useCurrency } from "@/components/CurrencyContext";
import type { PurchaseRequestData } from "@/types/invitation";
import { Spinner, ErrorState, Button, Modal } from "@/components/ui";
import type { AxiosError } from "axios";

export default function ClientOrdersPage() {
  const { lang, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [requests, setRequests] = useState<PurchaseRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    purchaseId: string | null;
    rating: number;
    comment: string;
  }>({
    isOpen: false,
    purchaseId: null,
    rating: 5,
    comment: "",
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    requestId: string | null;
  }>({
    isOpen: false,
    requestId: null,
  });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    isSuccess: boolean;
  }>({
    isOpen: false,
    message: "",
    isSuccess: true,
  });

  // ── Fetch client purchase requests ──────────────────────────────────
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<PurchaseRequestData[]>("/purchase-requests/my-requests");
      setRequests(res.data);
      setError(null);
    } catch (err) {
      logger.error("Error fetching purchase requests", err);
      setError(t("Failed to load your orders. Make sure the backend server is running."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Cancel request ──────────────────────────────────────────────────
  const handleCancelRequest = (id: string) => {
    setConfirmModal({
      isOpen: true,
      requestId: id,
    });
  };

  const executeCancelRequest = async (id: string) => {
    try {
      await api.patch(`/purchase-requests/${id}/cancel`);
      setAlertModal({
        isOpen: true,
        message: t("Request Cancelled"),
        isSuccess: true,
      });
      fetchRequests();
    } catch (err) {
      const errorVal = err as AxiosError<{ message?: string }>;
      logger.error("Failed to cancel request", err);
      setAlertModal({
        isOpen: true,
        message:
          errorVal.response?.data?.message ||
          t("Something went wrong. Please try again later."),
        isSuccess: false,
      });
    }
  };

  // ── Testimonial Review Actions ─────────────────────────────────────
  const handleOpenReviewModal = (request: PurchaseRequestData) => {
    if (!request.purchase) return;
    setReviewModal({
      isOpen: true,
      purchaseId: request.purchase.id,
      rating: request.purchase.testimonial?.rating || 5,
      comment: request.purchase.testimonial?.comment || "",
    });
  };

  const handleSubmittingReview = async () => {
    try {
      if (!reviewModal.purchaseId) return;
      await api.post("/testimonials", {
        purchaseId: reviewModal.purchaseId,
        rating: reviewModal.rating,
        comment: reviewModal.comment,
      });

      setReviewModal((prev) => ({ ...prev, isOpen: false }));
      setAlertModal({
        isOpen: true,
        message: t("Review Submitted Successfully"),
        isSuccess: true,
      });
      fetchRequests();
    } catch (err) {
      const errorVal = err as AxiosError<{ message?: string }>;
      logger.error("Failed to submit review", err);
      setAlertModal({
        isOpen: true,
        message:
          errorVal.response?.data?.message ||
          t("Something went wrong. Please try again later."),
        isSuccess: false,
      });
    }
  };

  // ── WhatsApp expedition link builder ────────────────────────────────
  const getWhatsAppLink = (request: PurchaseRequestData) => {
    const isAr = lang === "ar";
    const title = getTemplateTitle(request.template, lang);
    const msg = isAr
      ? `مرحباً، لقد أرسلت طلباً لشراء القالب "${title}" . أرجو تسريع تفعيله. هاتف التواصل: ${request.contactPhone}.`
      : `Hi, I would like to expedite my purchase request for the template "${title}" . Contact phone: ${request.contactPhone}.`;

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER || "962793809686";
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  if (loading) {
    return (
      <div className="py-24">
        <Spinner label={t("Loading your dashboard...")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-12">
        <ErrorState
          title={t("Connection Issue")}
          message={error}
          retryLabel={t("Retry Loading")}
          onRetry={fetchRequests}
          className="max-w-md mx-auto"
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto space-y-10">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className={lang === "ar" ? "text-right" : "text-left"} dir={lang === "ar" ? "rtl" : "ltr"}>
        <h1 className="text-3xl font-serif font-medium text-neutral-800">{t("My Orders")}</h1>
        <p className="mt-1.5 text-xs text-[#7F8487] leading-relaxed">
          {t("Track purchase requests")}
        </p>
      </div>

      {/* ── Empty State ────────────────────────────────────────────── */}
      {requests.length === 0 ? (
        <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-12 text-center shadow-sm">
          <span className="text-4xl block mb-3" role="img" aria-label="clipboard">
            📋
          </span>
          <h3 className="font-bold text-sm text-[#2D3142] mb-1">{t("No Orders Found")}</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed mb-4">
            {t("You haven't requested any template purchases yet.")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 h-10 text-xs font-semibold text-[#E5C38B] bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] rounded-xl transition-all shadow-sm"
          >
            {t("Browse Mazoom")}
          </Link>
        </div>
      ) : (
        /* ── Orders List Grid ──────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {requests.map((request) => {
            const status = request.status;

            return (
              <article
                key={request.id}
                className="bg-white border border-[#EBE7DF] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Image & Main Info Layout */}
                <div
                  className={`p-5 flex gap-4 border-b border-[#F4F1EA] ${
                    lang === "ar" ? "flex-row-reverse text-right" : "flex-row text-left"
                  }`}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  {/* Template Preview Thumbnail */}
                  <div className="w-24 h-24 rounded-xl bg-[#FAF8F5] border border-[#F0ECE3] overflow-hidden shrink-0 shadow-sm relative">
                    <Image
                      src={getS3Url(request.template.previewImage)}
                      alt={getTemplateTitle(request.template, lang)}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  {/* Details Section */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-sans font-bold text-neutral-800 text-[14px] leading-tight">
                          {getTemplateTitle(request.template, lang)}
                        </h3>
                        {request.couponCode ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-neutral-400 line-through font-mono">
                              {formatPrice(request.template.price)}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[12px] font-bold text-emerald-600 font-mono">
                                {formatPrice(request.finalPrice ?? request.template.price)}
                              </span>
                              <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                                {request.couponCode}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[12px] font-bold text-neutral-700 font-mono">
                            {formatPrice(request.template.price)}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#7F8487] mt-1 font-medium">
                        {t("Requested")}:{" "}
                        {new Date(request.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <span className="text-[9px] text-[#7F8487] font-mono font-medium">
                        {t("Phone")}: {request.contactPhone}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-2.5 flex items-center gap-2">
                      {status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {t("Pending")}
                        </span>
                      )}
                      {status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {t("Approved")}
                        </span>
                      )}
                      {status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          {t("Rejected")}
                        </span>
                      )}
                      {status === "CANCELLED" && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-neutral-600 bg-neutral-50 px-2 py-0.5 rounded-full border border-neutral-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                          {t("Cancelled")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-[#FAF8F5] flex gap-2 justify-between items-center">
                  {status === "PENDING" ? (
                    <div className="w-full flex gap-3">
                      {/* Cancel Button */}
                      <Button
                        variant="outline"
                        onClick={() => handleCancelRequest(request.id)}
                        className="flex-grow !text-rose-600 !border-rose-100 hover:!bg-rose-50 flex items-center justify-center gap-1"
                      >
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <span>{t("Cancel Request")}</span>
                      </Button>

                      {/* WhatsApp Button */}
                      <a
                        href={getWhatsAppLink(request)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer text-center"
                      >
                        <svg
                          className="w-4 h-4 shrink-0 fill-current"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span>{t("WhatsApp to Expedite")}</span>
                      </a>
                    </div>
                  ) : status === "APPROVED" ? (
                    <div className="w-full flex gap-2 flex-col sm:flex-row">
                      <Link
                        href="/dashboard/client"
                        className="flex-grow py-2.5 text-xs font-semibold text-[#E5C38B] bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer text-center"
                      >
                        <span>{t("Create Invitation")}</span>
                      </Link>
                      {request.purchase && (
                        request.purchase.testimonial?.isDeleted ? (
                          <div className="flex-grow py-2.5 text-center text-xs font-semibold text-rose-500 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-center gap-1.5 px-3 select-none">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0 text-rose-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>
                              {lang === "ar" ? "تم حذف تقييمك بواسطة المشرف" : "Your review has been deleted by an admin"}
                            </span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => handleOpenReviewModal(request)}
                            className="flex-grow"
                          >
                            {request.purchase.testimonial ? t("Update Review") : t("Rate Service")}
                          </Button>
                        )
                      )}
                    </div>
                  ) : status === "CANCELLED" ? (
                    <div className="w-full py-2.5 text-center text-xs font-medium text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
                      {t("Cancelled")}
                    </div>
                  ) : (
                    <div className="w-full py-2.5 text-center text-xs font-medium text-rose-500 bg-rose-50 rounded-xl border border-rose-100">
                      {t("Rejected")}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Custom Confirm Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, requestId: null })}
        backdrop="dark"
        className="bg-[#FAF9F6] border border-[#E6E2DA] rounded-[24px] max-w-sm w-full p-6 shadow-2xl relative text-center font-sans space-y-5"
        ariaLabel={lang === "ar" ? "تأكيد إلغاء الطلب" : "Confirm Cancellation"}
      >
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-neutral-800">
            {lang === "ar" ? "تأكيد إلغاء الطلب" : "Confirm Cancellation"}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {lang === "ar"
              ? "هل أنت متأكد من رغبتك في إلغاء طلب شراء هذا القالب؟"
              : "Are you sure you want to cancel this template purchase request?"}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="danger"
            onClick={() => {
              if (confirmModal.requestId) {
                executeCancelRequest(confirmModal.requestId);
              }
              setConfirmModal({ isOpen: false, requestId: null });
            }}
            className="flex-grow"
          >
            {lang === "ar" ? "نعم، إلغاء" : "Yes, Cancel"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setConfirmModal({ isOpen: false, requestId: null })}
            className="flex-grow"
          >
            {lang === "ar" ? "تراجع" : "Go Back"}
          </Button>
        </div>
      </Modal>

      {/* ── Custom Alert Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: "", isSuccess: true })}
        backdrop="dark"
        className="bg-[#FAF9F6] border border-[#E6E2DA] rounded-[24px] max-w-sm w-full p-6 shadow-2xl relative text-center font-sans space-y-5"
        ariaLabel={
          alertModal.isSuccess
            ? lang === "ar"
              ? "نجاح العملية"
              : "Success"
            : lang === "ar"
              ? "حدث خطأ"
              : "Error"
        }
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
            alertModal.isSuccess ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}
        >
          {alertModal.isSuccess ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-neutral-800">
            {alertModal.isSuccess
              ? lang === "ar"
                ? "نجاح العملية"
                : "Success"
              : lang === "ar"
                ? "حدث خطأ"
                : "Error"}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">{alertModal.message}</p>
        </div>

        <Button
          variant="primary"
          onClick={() => setAlertModal({ isOpen: false, message: "", isSuccess: true })}
          className="w-full"
        >
          {lang === "ar" ? "موافق" : "OK"}
        </Button>
      </Modal>

      {/* ── Custom Review Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal((prev) => ({ ...prev, isOpen: false }))}
        backdrop="dark"
        className="bg-[#FAF9F6] border border-[#E6E2DA] rounded-[24px] max-w-md w-full p-6 shadow-2xl relative font-sans space-y-5"
        ariaLabel={t("Rate and Comment")}
      >
        <div className={lang === "ar" ? "text-right" : "text-left"}>
          <h3 className="text-base font-bold text-neutral-800">{t("Rate and Comment")}</h3>
          <p className="text-xs text-neutral-500 mt-1">
            {lang === "ar"
              ? "شاركنا رأيك وتقييمك في الخدمة والقالب الذي قمت بشرائه."
              : "Share your rating and comment about the template and service you purchased."}
          </p>
        </div>

        {/* Stars Selector */}
        <div className="flex flex-col gap-2 text-right">
          <label className="text-xs font-semibold text-neutral-700">{t("Rating (Stars)")}</label>
          <div className="flex gap-2 justify-center py-2 bg-white rounded-xl border border-[#E6E2DA]">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewModal((prev) => ({ ...prev, rating: star }))}
                className="text-2xl transition-all hover:scale-110 cursor-pointer focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <span className={star <= reviewModal.rating ? "text-amber-400" : "text-neutral-200"}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Comment Area */}
        <div className="flex flex-col gap-2 text-right">
          <label className="text-xs font-semibold text-neutral-700">{t("Review Comment")}</label>
          <textarea
            value={reviewModal.comment}
            onChange={(e) => setReviewModal((prev) => ({ ...prev, comment: e.target.value }))}
            placeholder={t("Write your review here...")}
            rows={4}
            className="w-full text-xs border border-neutral-200 rounded-xl p-3 focus:outline-none focus:border-[#E5C38B] bg-white resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleSubmittingReview} className="flex-grow">
            {t("Submit Review")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setReviewModal((prev) => ({ ...prev, isOpen: false }))}
            className="flex-grow"
          >
            {lang === "ar" ? "تراجع" : "Cancel"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
