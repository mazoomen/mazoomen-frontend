"use client";

interface SpinnerProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional label displayed below the spinner */
  label?: string;
  /** Additional CSS classes for the container */
  className?: string;
}

const sizeMap = {
  sm: "w-6 h-6 border-2",
  md: "w-10 h-10 border-4",
  lg: "w-14 h-14 border-4",
};

export default function Spinner({
  size = "md",
  label,
  className = "",
}: SpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-label={label ?? "Loading"}
    >
      <div
        className={`rounded-full border-[#F4F1EA] border-t-black animate-spin ${sizeMap[size]}`}
      />
      {label && (
        <p className="text-xs text-[#7F8487] font-medium">{label}</p>
      )}
    </div>
  );
}
