"use client";

type StatusVariant = "pending" | "approved" | "rejected" | "cancelled" | "active" | "inactive";

interface StatusBadgeProps {
  status: StatusVariant;
  label: string;
  /** Additional CSS classes */
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200",
  approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected:
    "bg-red-50 text-red-600 border-red-200",
  cancelled:
    "bg-neutral-100 text-neutral-500 border-neutral-200",
  active:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive:
    "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export default function StatusBadge({
  status,
  label,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full border ${variantStyles[status]} ${className}`}
    >
      {label}
    </span>
  );
}
