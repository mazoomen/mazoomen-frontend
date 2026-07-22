'use client';

import React, { useState } from 'react';
import { handleBuyNow, CreateChargeParams } from '@/lib/payment';

interface CheckoutButtonProps {
  payload: CreateChargeParams;
  buttonText?: string;
  className?: string;
}

export function CheckoutButton({
  payload,
  buttonText,
  className = '',
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      await handleBuyNow(payload);
    } catch (err: any) {
      console.error('Payment Error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full py-3.5 px-6 font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${className}`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          buttonText || `Buy Now (${payload.amount} ${payload.currency || 'KWD'})`
        )}
      </button>
    </div>
  );
}
