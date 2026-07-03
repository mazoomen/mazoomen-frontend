"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";

interface RequestTemplate {
  id: string;
  title: string;
  previewImage: string;
  price: string | number;
}

interface PurchaseRequestData {
  id: string;
  templateId: string;
  contactEmail: string;
  contactPhone: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  template: RequestTemplate;
}

export default function ClientOrdersPage() {
  const { lang, t } = useLanguage();
  const [requests, setRequests] = useState<PurchaseRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Premium custom themed modal states
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
      console.error("Error fetching purchase requests:", err);
      setError(t("Failed to load your orders. Make sure the backend server is running."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    setTimeout(() => {
      fetchRequests();
    }, 0);
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
    } catch (err: any) {
      console.error("Failed to cancel request:", err);
      setAlertModal({
        isOpen: true,
        message: err.response?.data?.message || t("Something went wrong. Please try again later."),
        isSuccess: false,
      });
    }
  };

  // ── WhatsApp expedition link builder ────────────────────────────────
  const getWhatsAppLink = (request: PurchaseRequestData) => {
    const isAr = lang === "ar";
    const msg = isAr
      ? `مرحباً، لقد أرسلت طلباً لشراء القالب "${request.template.title}" . أرجو تسريع تفعيله. هاتف التواصل: ${request.contactPhone}.`
      : `Hi, I would like to expedite my purchase request for the template "${request.template.title}" . Contact phone: ${request.contactPhone}.`;
    
    return `https://wa.me/962793809686?text=${encodeURIComponent(msg)}`;
  };

  // ── Loading state ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-neutral-200 border-t-black animate-spin"></div>
        <p className="text-xs text-neutral-500 font-medium">{t("Loading your dashboard...")}</p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-[#E6E2DA] rounded-2xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[#2D3142] mb-2">{t("Connection Issue")}</h3>
        <p className="text-xs text-[#7F8487] leading-relaxed mb-4">{error}</p>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 text-xs font-semibold text-[#E5C38B] bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] rounded-full transition-all"
        >
          {t("Retry Loading")}
        </button>
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
          <span className="text-4xl block mb-3">📋</span>
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
                  dir={lang === "ar" ? "rtl" : "ltr"
                }>
                  {/* Template Preview Thumbnail */}
                  <div className="w-24 h-24 rounded-xl bg-[#FAF8F5] border border-[#F0ECE3] overflow-hidden shrink-0 shadow-sm relative">
                    <img
                      src={request.template.previewImage}
                      alt={request.template.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details Section */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-sans font-bold text-neutral-800 text-[14px] leading-tight">
                          {request.template.title}
                        </h3>
                        <span className="text-[12px] font-bold text-neutral-700 font-mono">
                          ${request.template.price}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7F8487] mt-1 font-medium">
                        {t("Requested")}: {new Date(request.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="text-[9px] font-mono text-neutral-400 mt-1 leading-none">
                        ID: {request.id}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-2.5 flex items-center gap-2">
                      {status === "PENDING" && (
                        <span className="text-[9px] uppercase tracking-wider font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          ● {t("Pending")}
                        </span>
                      )}
                      {status === "APPROVED" && (
                        <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          ● {t("Approved")}
                        </span>
                      )}
                      {status === "REJECTED" && (
                        <span className="text-[9px] uppercase tracking-wider font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          ● {t("Rejected")}
                        </span>
                      )}
                      {status === "CANCELLED" && (
                        <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
                          ● {t("Cancelled")}
                        </span>
                      )}
                      <span className="text-[9px] text-[#7F8487] font-mono font-medium">
                        {t("Phone")}: {request.contactPhone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-[#FAF8F5] flex gap-2 justify-between items-center">
                  {status === "PENDING" ? (
                    <div className="w-full flex gap-3">
                      {/* Cancel Button */}
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="flex-1 py-2.5 text-xs font-semibold text-rose-600 bg-white border border-rose-100 hover:bg-rose-50 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>{t("Cancel Request")}</span>
                      </button>

                      {/* WhatsApp Button */}
                      <a
                        href={getWhatsAppLink(request)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer text-center"
                      >
                        {/* WhatsApp SVG Icon */}
                        <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span>{t("WhatsApp to Expedite")}</span>
                      </a>
                    </div>
                  ) : status === "APPROVED" ? (
                    /* Create Invitation link */
                    <Link
                      href="/dashboard/client"
                      className="w-full py-2 text-xs font-semibold text-[#E5C38B] bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{t("Create Invitation")}</span>
                    </Link>
                  ) : status === "CANCELLED" ? (
                    /* Cancelled request status text */
                    <div className="w-full py-2.5 text-center text-xs font-medium text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
                      {t("Cancelled")}
                    </div>
                  ) : (
                    /* Rejected status text only */
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
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-[#0B1528]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF9F6] border border-[#E6E2DA] rounded-[24px] max-w-sm w-full p-6 shadow-2xl relative text-center font-sans space-y-5">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
              <button
                onClick={() => {
                  if (confirmModal.requestId) {
                    executeCancelRequest(confirmModal.requestId);
                  }
                  setConfirmModal({ isOpen: false, requestId: null });
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                {lang === "ar" ? "نعم، إلغاء" : "Yes, Cancel"}
              </button>
              <button
                onClick={() => setConfirmModal({ isOpen: false, requestId: null })}
                className="flex-1 py-2.5 text-xs font-semibold text-neutral-700 bg-white border border-[#E6E2DA] hover:bg-neutral-50 rounded-xl transition-all cursor-pointer"
              >
                {lang === "ar" ? "تراجع" : "Go Back"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Alert Modal ───────────────────────────────────────── */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 bg-[#0B1528]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF9F6] border border-[#E6E2DA] rounded-[24px] max-w-sm w-full p-6 shadow-2xl relative text-center font-sans space-y-5">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              alertModal.isSuccess ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}>
              {alertModal.isSuccess ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-bold text-neutral-800">
                {alertModal.isSuccess
                  ? (lang === "ar" ? "نجاح العملية" : "Success")
                  : (lang === "ar" ? "حدث خطأ" : "Error")}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {alertModal.message}
              </p>
            </div>

            <button
              onClick={() => setAlertModal({ isOpen: false, message: "", isSuccess: true })}
              className="w-full py-2.5 text-xs font-semibold text-[#E5C38B] bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] rounded-xl transition-all cursor-pointer shadow-sm"
            >
              {lang === "ar" ? "موافق" : "OK"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
