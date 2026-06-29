"use client";

// ── Types ────────────────────────────────────────────────────────────────

interface StatsCardsProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalRevenue: number;
}

// ── Component ────────────────────────────────────────────────────────────

export default function StatsCards({
  pendingCount,
  approvedCount,
  rejectedCount,
  totalRevenue,
}: StatsCardsProps) {
  const cards = [
    {
      label: "Pending Orders",
      value: pendingCount,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 7v5l3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "amber" as const,
    },
    {
      label: "Approved Orders",
      value: approvedCount,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "emerald" as const,
    },
    {
      label: "Rejected Orders",
      value: rejectedCount,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "rose" as const,
    },
    {
      label: "Total Revenue",
      value: `${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "indigo" as const,
    },
  ];

  const colorMap = {
    amber: {
      card: "border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/0",
      icon: "bg-amber-500/10 text-amber-400",
      value: "text-amber-400",
    },
    emerald: {
      card: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/0",
      icon: "bg-emerald-500/10 text-emerald-400",
      value: "text-emerald-400",
    },
    rose: {
      card: "border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-rose-500/0",
      icon: "bg-rose-500/10 text-rose-400",
      value: "text-rose-400",
    },
    indigo: {
      card: "border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-indigo-500/0",
      icon: "bg-indigo-500/10 text-indigo-400",
      value: "text-indigo-400",
    },
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const colors = colorMap[card.color];
        return (
          <div
            key={card.label}
            className={`rounded-xl border p-4 transition-colors ${colors.card}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                {card.label}
              </p>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.icon}`}
              >
                {card.icon}
              </div>
            </div>
            <p className={`mt-2 text-2xl font-bold ${colors.value}`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
