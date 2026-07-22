'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const tapId = searchParams.get('tap_id') || searchParams.get('tap_charge_id') || searchParams.get('charge_id') || '';

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('Order ID missing from URL parameters.');
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
          setError(err.message || 'Failed to fetch order status.');
          setLoading(false);
        }
      }
    };

    checkStatus();

    return () => {
      isSubscribed = false;
    };
  }, [orderId, tapId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Verifying Payment Status...
        </h2>
        <p className="text-sm text-gray-500 mt-1">Please wait a moment while we confirm with Tap Payments.</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
          ✕
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Unable to Verify Order
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'Order not found.'}</p>
        <Link
          href="/"
          className="px-6 py-3 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-all"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const isSuccess = order.status === 'COMPLETED';
  const isPending = order.status === 'PENDING';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      {isSuccess ? (
        <>
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4 text-3xl font-bold">
            ✓
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Thank you, <span className="font-semibold">{order.customerName}</span>. Your payment has been confirmed and your digital template is unlocked and activated in your account.
          </p>
        </>
      ) : isPending ? (
        <>
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mb-4 text-3xl font-bold">
            ⏳
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Processing
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We are confirming your payment with Tap Payments. You can check back shortly or view your orders in the dashboard.
          </p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4 text-3xl font-bold">
            ✕
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Unsuccessful
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {order.failureReason
              ? `Reason: ${order.failureReason}`
              : `The transaction was not completed. Status: ${order.status}`}
          </p>
        </>
      )}

      <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-left border border-gray-200 dark:border-gray-700 mb-6 space-y-2">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">
          Order Summary
        </div>
        <div className="flex justify-between text-sm py-1 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-500">Order ID:</span>
          <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{order.id}</span>
        </div>
        <div className="flex justify-between text-sm py-1 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-500">Amount Paid:</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {order.amount} {order.currency}
          </span>
        </div>
        <div className="flex justify-between text-sm py-1 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-500">Status:</span>
          <span
            className={`font-semibold ${
              isSuccess
                ? 'text-emerald-600 dark:text-emerald-400'
                : isPending
                ? 'text-amber-600'
                : 'text-red-600'
            }`}
          >
            {order.status}
          </span>
        </div>
        {order.failureReason && (
          <div className="flex justify-between text-sm py-1 text-red-600 font-medium">
            <span>Failure Reason:</span>
            <span>{order.failureReason}</span>
          </div>
        )}
      </div>

      <div className="w-full flex gap-3">
        <Link
          href={isSuccess ? '/dashboard/client' : '/'}
          className="flex-1 py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow transition-all text-center"
        >
          {isSuccess ? 'Go to Dashboard' : 'Back to Mazoomin'}
        </Link>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading payment status...</div>}>
      <PaymentStatusContent />
    </Suspense>
  );
}
