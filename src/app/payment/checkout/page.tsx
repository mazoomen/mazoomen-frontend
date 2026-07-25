'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useLanguage } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';
import Link from 'next/link';

const ApplePayIcon = () => (
  <svg className="w-4 h-4 inline-block me-1 fill-current" viewBox="0 0 170 170" aria-label="Apple Pay">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.84.13-9.68-1.91-14.52-6.13-3.21-2.74-7.11-7.44-11.7-14.11-6.73-9.82-12.04-20.91-15.93-33.27-3.89-12.36-5.84-24.08-5.84-35.15 0-14.2 3.42-26.06 10.26-35.58 6.84-9.52 15.42-14.36 25.75-14.52 4.67 0 9.77 1.15 15.3 3.45 5.53 2.3 9.4 3.49 11.62 3.57 2.01 0 5.96-1.23 11.85-3.69 5.89-2.46 10.74-3.61 14.55-3.45 10.02.45 18.23 4.29 24.63 11.53-15.64 9.49-23.23 22.86-22.78 40.11.45 13.38 5.63 24.3 15.54 32.76 4.39 3.82 9.22 6.64 14.49 8.47-1.34 4.02-3.04 8.57-5.09 13.65zM119.22 31.84c0-7.37 2.68-14.42 8.04-21.16 5.36-6.74 12.04-10.68 20.04-11.82.12 1.01.18 1.9.18 2.68 0 7.37-2.74 14.5-8.22 21.39-5.48 6.89-12.18 10.78-20.1 11.67-.06-.84-.12-1.74-.12-2.76z" />
  </svg>
);

function PaymentCheckoutContent() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();

  const orderId = searchParams.get('orderId');
  const checkoutUrlParam = searchParams.get('checkoutUrl');

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  useEffect(() => {
    if (checkoutUrlParam) {
      const decoded = decodeURIComponent(checkoutUrlParam);
      setCheckoutUrl(decoded);
    }

    if (!orderId) {
      setLoading(false);
      setError(
        lang === 'ar'
          ? 'رقم الطلب غير موجود. يرجى البدء من جديد.'
          : 'Order ID is missing. Please start checkout again.'
      );
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    fetch(`${backendUrl}/payment/status/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load order details.');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(
          lang === 'ar'
            ? 'تعذر تحميل تفاصيل الطلب.'
            : 'Unable to retrieve order details.'
        );
        setLoading(false);
      });
  }, [orderId, checkoutUrlParam, lang]);

  // Reservation timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePayNow = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else if (orderId) {
      window.location.href = checkoutUrlParam
        ? decodeURIComponent(checkoutUrlParam)
        : '#';
    }
  };

  const isRtl = lang === 'ar';

  return (
    <div
      className="max-w-4xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 font-sans"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Security Header Banner - Luxury Dark Navy Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 bg-[#0B1528] border border-[#1E2E4A] rounded-2xl shadow-lg text-white">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#101F35] border border-[#1E2E4A] flex items-center justify-center text-[#E5C38B] text-xl font-bold shrink-0">
            🔒
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#E5C38B]">
              {isRtl ? 'بوابة الدفع الآمنة (Tap Payments)' : 'Secure Tap Payment Gateway'}
            </h1>
            <p className="text-xs text-neutral-300">
              {isRtl
                ? 'تشفير 256-bit معتمد ومحمي بالكامل'
                : '256-bit SSL encrypted & 100% secure transaction'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-[#101F35] border border-[#1E2E4A] rounded-xl text-xs text-[#E5C38B] font-semibold shrink-0">
          <span>⏱️</span>
          <span>{isRtl ? 'حجز الطلب ينتهي خلال:' : 'Order reserved for:'}</span>
          <span className="font-mono font-bold text-white text-sm">{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-[#E6E2DA] shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B89C72] mb-4" />
          <p className="text-sm font-medium text-[#0B1528]">
            {isRtl ? 'جاري تحميل تفاصيل الدفع...' : 'Loading payment details...'}
          </p>
        </div>
      ) : error ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-red-200 shadow-sm text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mb-4 font-bold">
            ✕
          </div>
          <h2 className="text-xl font-bold text-[#0B1528] mb-2">{error}</h2>
          <Link
            href="/"
            className="mt-4 px-6 py-3 bg-[#0B1528] hover:bg-[#1A2D4C] text-[#E5C38B] border border-[#1E2E4A] font-semibold rounded-xl transition-all text-xs shadow-md"
          >
            {isRtl ? 'العودة للرئيسية' : 'Return Home'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left Column: Order Details */}
          <div className="bg-white border border-[#E6E2DA] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[11px] tracking-widest text-[#B89C72] font-bold uppercase block">
                {isRtl ? 'تفاصيل الطلب' : 'ORDER DETAILS'}
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#0B1528]">
                {order?.templateDetails?.templateTitle ||
                  (isRtl ? 'تصميم دعوة إلكترونية' : 'Digital Invitation Template')}
              </h2>

              <div className="h-px bg-[#EBE7DF]" />

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-[#FAF6F0]">
                  <span className="text-neutral-500">{isRtl ? 'رقم الطلب:' : 'Order ID:'}</span>
                  <span className="font-mono font-semibold text-[#0B1528]">
                    {order?.id ? `#${order.id.slice(0, 8)}` : 'N/A'}
                  </span>
                </div>

                {order?.customerName && (
                  <div className="flex justify-between items-center py-1.5 border-b border-[#FAF6F0]">
                    <span className="text-neutral-500">{isRtl ? 'الاسم:' : 'Customer:'}</span>
                    <span className="font-semibold text-[#0B1528]">
                      {order.customerName}
                    </span>
                  </div>
                )}

                {order?.templateDetails?.contactPhone && (
                  <div className="flex justify-between items-center py-1.5 border-b border-[#FAF6F0]">
                    <span className="text-neutral-500">{isRtl ? 'رقم الجوال:' : 'Phone:'}</span>
                    <span className="font-mono font-semibold text-[#0B1528]" dir="ltr">
                      {order.templateDetails.contactPhone}
                    </span>
                  </div>
                )}

                {order?.templateDetails?.couponCode && (
                  <div className="flex justify-between items-center py-2 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                    <span className="text-emerald-700 font-medium">
                      {isRtl ? 'كوبون الخصم:' : 'Coupon Code:'}
                    </span>
                    <span className="font-mono font-bold text-emerald-800 uppercase">
                      {order.templateDetails.couponCode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Total Price Box */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E2DA] flex justify-between items-center mt-auto">
              <span className="text-xs sm:text-sm font-bold text-neutral-700">
                {isRtl ? 'المبلغ المطلوب سداده:' : 'Total Amount to Pay:'}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#B89C72]">
                {formatPrice(order?.amount || 0)}
              </span>
            </div>
          </div>

          {/* Right Column: Tap Action Card */}
          <div className="bg-[#FAF6F0] border border-[#E6E2DA] rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between text-center space-y-6">
            <div className="space-y-3.5">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xs border border-[#E6E2DA] text-[#0B1528]">
                💳
              </div>
              <h3 className="text-xl font-bold text-[#0B1528]">
                {isRtl ? 'استكمال السداد عبر Tap Payments' : 'Complete Payment via Tap Payments'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xs mx-auto">
                {isRtl
                  ? 'سيتم تحويلك بشكل آمن إلى بوابة Tap لاختيار طريقة الدفع المفضلة لديك (كي نت، مدى، بطاقة ائتمان، أو أبل باي).'
                  : 'You will be securely redirected to Tap Payments gateway to choose KNET, Mada, Credit Card, or Apple Pay.'}
              </p>
            </div>

            {/* Payment Method Badges */}
            <div className="flex justify-center gap-2.5 flex-wrap text-xs font-bold text-neutral-800">
              <span className="px-3.5 py-2 bg-white border border-[#E6E2DA] rounded-xl shadow-xs flex items-center gap-1.5">
                💳 {isRtl ? 'بطاقة ائتمان' : 'Card'}
              </span>
              <span className="px-3.5 py-2 bg-white border border-[#E6E2DA] rounded-xl shadow-xs text-blue-700">
                KNET
              </span>
              <span className="px-3.5 py-2 bg-white border border-[#E6E2DA] rounded-xl shadow-xs text-emerald-700">
                mada
              </span>
              <span className="px-3.5 py-2 bg-white border border-[#E6E2DA] rounded-xl shadow-xs text-black flex items-center gap-1">
                <ApplePayIcon /> Apple Pay
              </span>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={handlePayNow}
              className="w-full py-4 px-6 bg-[#0B1528] hover:bg-[#1A2D4C] text-[#E5C38B] border border-[#1E2E4A] text-sm sm:text-base font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isRtl ? 'الانتقال إلى صفحة الدفع الآمنة' : 'Proceed to Tap Secure Payment'}</span>
              <span className="text-base">{isRtl ? '←' : '→'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentCheckoutPage() {
  return (
    <PageLayout>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B89C72]" />
          </div>
        }
      >
        <PaymentCheckoutContent />
      </Suspense>
    </PageLayout>
  );
}

