"use client";

interface ErrorStateProps {
  /** Heading text */
  title: string;
  /** Descriptive error message */
  message: string;
  /** Retry button label */
  retryLabel?: string;
  /** Callback when the retry button is clicked */
  onRetry?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export default function ErrorState({
  title,
  message,
  retryLabel,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`bg-white border border-[#E6E2DA] rounded-2xl p-8 text-center shadow-sm ${className}`}
      role="alert"
    >
      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
      <h3 className="font-bold text-sm text-[#2D3142] mb-2">{title}</h3>
      <p className="text-xs text-[#7F8487] leading-relaxed max-w-sm mx-auto mb-4">
        {message}
      </p>
      {onRetry && retryLabel && (
        <button
          onClick={onRetry}
          className="px-6 h-10 text-xs font-semibold text-[#E5C38B] bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] rounded-xl transition-all shadow-sm cursor-pointer"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
