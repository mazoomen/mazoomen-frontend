'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useLanguage } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';
import Link from 'next/link';

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
      // Fallback
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
      {/* Security Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white dark:bg-gray-800 border border-[#E6E2DA] rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] border border-[#E6E2DA] flex items-center justify-center text-[#B89C72] text-xl font-bold">
            🔒
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-800 dark:text-white">
              {isRtl ? 'بوابة الدفع الآمنة (Tap Payments)' : 'Secure Tap Payment Gateway'}
            </h1>
            <p className="text-xs text-neutral-500">
              {isRtl
                ? 'تشفير 256-bit معتمد ومحمي بالكامل'
                : '256-bit SSL encrypted & 100% secure transaction'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF6F0] border border-[#E6E2DA] rounded-xl text-xs text-[#B89C72] font-semibold">
          <span>⏱️</span>
          <span>{isRtl ? 'حجز الطلب ينتهي خلال:' : 'Order reserved for:'}</span>
          <span className="font-mono font-bold">{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-[#E6E2DA]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B89C72] mb-4" />
          <p className="text-sm font-medium text-neutral-600">
            {isRtl ? 'جاري تحميل تفاصيل الدفع...' : 'Loading payment details...'}
          </p>
        </div>
      ) : error ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-red-200 text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mb-4 font-bold">
            ✕
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">{error}</h2>
          <Link
            href="/"
            className="mt-4 px-6 py-2.5 bg-[#B89C72] text-white font-medium rounded-xl hover:bg-[#A38350] transition-all text-xs"
          >
            {isRtl ? 'العودة للرئيسية' : 'Return Home'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left Column: Order Details */}
          <div className="bg-white dark:bg-gray-800 border border-[#E6E2DA] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] tracking-widest text-[#B89C72] font-bold uppercase block">
                {isRtl ? 'تفاصيل الطلب' : 'ORDER DETAILS'}
              </span>
              <h2 className="text-xl font-serif font-bold text-neutral-800 dark:text-white">
                {order?.templateDetails?.templateTitle ||
                  (isRtl ? 'تصميم دعوة إلكترونية' : 'Digital Invitation Template')}
              </h2>

              <div className="h-px bg-[#EBE7DF] dark:bg-gray-700" />

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-500">{isRtl ? 'رقم الطلب:' : 'Order ID:'}</span>
                  <span className="font-mono font-medium text-neutral-800 dark:text-gray-200">
                    {order?.id ? `#${order.id.slice(0, 8)}` : 'N/A'}
                  </span>
                </div>

                {order?.customerName && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-500">{isRtl ? 'الاسم:' : 'Customer:'}</span>
                    <span className="font-medium text-neutral-800 dark:text-gray-200">
                      {order.customerName}
                    </span>
                  </div>
                )}

                {order?.templateDetails?.contactPhone && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-500">{isRtl ? 'رقم الجوال:' : 'Phone:'}</span>
                    <span className="font-mono font-medium text-neutral-800 dark:text-gray-200" dir="ltr">
                      {order.templateDetails.contactPhone}
                    </span>
                  </div>
                )}

                {order?.templateDetails?.couponCode && (
                  <div className="flex justify-between items-center py-1 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      {isRtl ? 'كوبون الخصم:' : 'Coupon Code:'}
                    </span>
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                      {order.templateDetails.couponCode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Total Price Box */}
            <div className="bg-[#FAF9F6] dark:bg-gray-900/50 p-4 rounded-2xl border border-[#E6E2DA] flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-600 dark:text-gray-400">
                {isRtl ? 'المبلغ المطلوب سداده:' : 'Total Amount to Pay:'}
              </span>
              <span className="text-2xl font-extrabold text-[#B89C72]">
                {formatPrice(order?.amount || 0)}
              </span>
            </div>
          </div>

          {/* Right Column: Tap Action Card */}
          <div className="bg-[#FAF6F0] dark:bg-gray-800/80 border border-[#E6E2DA] rounded-3xl p-6 shadow-md flex flex-col justify-between text-center space-y-6">
            <div className="space-y-3">
              <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-xs border border-[#E6E2DA]">
                💳
              </div>
              <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                {isRtl ? 'استكمال السداد عبر Tap Payments' : 'Complete Payment via Tap Payments'}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
                {isRtl
                  ? 'سيتم تحويلك بشكل آمن إلى بوابة Tap لاختيار طريقة الدفع المفضل لديك (كي نت، مدى، بطاقة ائتمان، أو أبل باي).'
                  : 'You will be securely redirected to Tap Payments gateway to choose KNET, Mada, Credit Card, or Apple Pay.'}
              </p>
            </div>

            {/* Payment Method Badges */}
            <div className="flex justify-center gap-2 flex-wrap text-xs font-bold text-neutral-700">
              <span className="px-3 py-1.5 bg-white border border-[#E6E2DA] rounded-xl shadow-2xs">
                💳 Card
              </span>
              <span className="px-3 py-1.5 bg-white border border-[#E6E2DA] rounded-xl shadow-2xs text-blue-700">
                KNET
              </span>
              <span className="px-3 py-1.5 bg-white border border-[#E6E2DA] rounded-xl shadow-2xs text-emerald-700">
                Mada
              </span>
              <span className="px-3 py-1.5 bg-white border border-[#E6E2DA] rounded-xl shadow-2xs text-black dark:text-white">
                 Apple Pay
              </span>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={handlePayNow}
              className="w-full py-4 px-6 bg-[#111827] hover:bg-black text-white text-sm font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
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
