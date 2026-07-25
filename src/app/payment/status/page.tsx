'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import { useLanguage } from '@/components/LanguageContext';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  const orderId = searchParams.get('orderId');
  const tapId = searchParams.get('tap_id') || searchParams.get('tap_charge_id') || searchParams.get('charge_id') || '';

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError(isRtl ? 'رقم الطلب غير موجود.' : 'Order ID missing from URL parameters.');
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    let isSubscribed = true;
    let pollCount = 0;
    const maxPolls = 4;

    const checkStatus = async () => {
      try {
        const queryParam = tapId ? `?tap_id=${encodeURIComponent(tapId)}` : '';
        const res = await fetch(`${backendUrl}/payment/status/${orderId}${queryParam}`);

        if (!res.ok) throw new Error('Order details not found.');
        const data = await res.json();

        if (isSubscribed) {
          setOrder(data);
          setLoading(false);

          // Auto-poll if status is still PENDING and maxPolls not reached
          if (data.status === 'PENDING' && pollCount < maxPolls) {
            pollCount++;
            setTimeout(checkStatus, 3000);
          }
        }
      } catch (err: any) {
        if (isSubscribed) {
          console.error(err);
          setError(err.message || (isRtl ? 'فشل تحميل حالة الطلب.' : 'Failed to fetch order status.'));
          setLoading(false);
        }
      }
    };

    checkStatus();

    return () => {
      isSubscribed = false;
    };
  }, [orderId, tapId, isRtl]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B89C72] mb-4"></div>
        <h2 className="text-xl font-bold text-[#0B1528]">
          {isRtl ? 'جاري التحقق من حالة الدفع...' : 'Verifying Payment Status...'}
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          {isRtl ? 'يرجى الانتظار قليلاً أثناء التأكيد مع بوابة Tap Payments.' : 'Please wait a moment while we confirm with Tap Payments.'}
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto font-sans">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl border border-red-200 flex items-center justify-center mb-4 text-2xl font-bold">
          ✕
        </div>
        <h2 className="text-2xl font-bold text-[#0B1528] mb-2">
          {isRtl ? 'تعذر التحقق من الطلب' : 'Unable to Verify Order'}
        </h2>
        <p className="text-sm text-neutral-600 mb-6">{error || (isRtl ? 'الطلب غير موجود.' : 'Order not found.')}</p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#0B1528] hover:bg-[#1A2D4C] text-[#E5C38B] border border-[#1E2E4A] font-semibold rounded-xl transition-all text-xs shadow-md"
        >
          {isRtl ? 'العودة للرئيسية' : 'Return Home'}
        </Link>
      </div>
    );
  }

  const isSuccess = order.status === 'COMPLETED';
  const isPending = order.status === 'PENDING';

  return (
    <div
      className="max-w-lg mx-auto w-full px-4 py-12 flex flex-col items-center text-center font-sans"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {isSuccess ? (
        <>
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mb-4 text-3xl font-bold shadow-xs">
            ✓
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1528] mb-2">
            {isRtl ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
          </h2>
          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            {isRtl ? (
              <>شكراً لك، <span className="font-bold text-[#0B1528]">{order.customerName}</span>. تم تأكيد عملية الدفع وتفعيل دعوتك الإلكترونية في حسابك.</>
            ) : (
              <>Thank you, <span className="font-bold text-[#0B1528]">{order.customerName}</span>. Your payment has been confirmed and your digital template is unlocked and activated in your account.</>
            )}
          </p>
        </>
      ) : isPending ? (
        <>
          <div className="w-16 h-16 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center mb-4 text-3xl font-bold shadow-xs">
            ⏳
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1528] mb-2">
            {isRtl ? 'جاري مراجعة عملية الدفع' : 'Payment Processing'}
          </h2>
          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            {isRtl
              ? 'نقوم حالياً بالتحقق من عملية الدفع مع بوابة Tap Payments. يمكنك العودة لاحقاً أو متابعة طلباتك من لوحة التحكم.'
              : 'We are confirming your payment with Tap Payments. You can check back shortly or view your orders in the dashboard.'}
          </p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-red-50 text-red-600 border border-red-200 rounded-2xl flex items-center justify-center mb-4 text-3xl font-bold shadow-xs">
            ✕
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1528] mb-2">
            {isRtl ? 'لم تكتمل عملية الدفع' : 'Payment Unsuccessful'}
          </h2>
          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            {order.failureReason
              ? `${isRtl ? 'السبب:' : 'Reason:'} ${order.failureReason}`
              : (isRtl ? 'لم يتم إكمال عملية الدفع بنجاح.' : `The transaction was not completed. Status: ${order.status}`)}
          </p>
        </>
      )}

      {/* Summary Box */}
      <div className="w-full bg-white border border-[#E6E2DA] p-5 rounded-2xl shadow-sm text-start mb-6 space-y-2.5">
        <div className="text-xs text-[#B89C72] uppercase tracking-wider font-bold mb-3 border-b border-[#FAF6F0] pb-2">
          {isRtl ? 'ملخص الطلب' : 'Order Summary'}
        </div>
        <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-[#FAF6F0]">
          <span className="text-neutral-500">{isRtl ? 'رقم الطلب:' : 'Order ID:'}</span>
          <span className="font-mono font-semibold text-[#0B1528]">{order.id}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-[#FAF6F0]">
          <span className="text-neutral-500">{isRtl ? 'المبلغ المدفوع:' : 'Amount Paid:'}</span>
          <span className="font-extrabold text-[#B89C72]">
            {order.amount} {order.currency}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm py-1">
          <span className="text-neutral-500">{isRtl ? 'الحالة:' : 'Status:'}</span>
          <span
            className={`font-bold ${
              isSuccess
                ? 'text-emerald-700'
                : isPending
                ? 'text-amber-700'
                : 'text-red-700'
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="w-full flex gap-3">
        <Link
          href={isSuccess ? '/dashboard/client' : '/'}
          className="w-full py-3.5 px-6 bg-[#0B1528] hover:bg-[#1A2D4C] text-[#E5C38B] border border-[#1E2E4A] font-bold text-sm rounded-xl shadow-md transition-all text-center"
        >
          {isSuccess
            ? (isRtl ? 'الانتقال إلى لوحة التحكم' : 'Go to Dashboard')
            : (isRtl ? 'العودة للرئيسية' : 'Back to Home')}
        </Link>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <PageLayout>
      <Suspense fallback={<div className="p-8 text-center text-neutral-500">Loading payment status...</div>}>
        <PaymentStatusContent />
      </Suspense>
    </PageLayout>
  );
}

