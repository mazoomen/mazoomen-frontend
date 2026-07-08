"use client";

import { useLanguage } from "@/components/LanguageContext";

// ── Types ────────────────────────────────────────────────────────────────

interface StatsCardsProps {
  pendingCount: number;
  approvedCount: number;
  totalRevenue: number;
  totalUsers: number;
  totalTemplates: number;
}

// ── Component ────────────────────────────────────────────────────────────

export default function StatsCards({
  pendingCount,
  approvedCount,
  totalRevenue,
  totalUsers,
  totalTemplates,
}: StatsCardsProps) {
  const { lang } = useLanguage();

  const cards = [
    {
      label: lang === "ar" ? "الطلبات المعلقة" : "Pending Requests",
      value: pendingCount,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: "amber" as const,
    },
    {
      label: lang === "ar" ? "الطلبات المعتمدة" : "Approved Requests",
      value: approvedCount,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: "emerald" as const,
    },
    {
      label: lang === "ar" ? "إجمالي القوالب" : "Total Templates",
      value: totalTemplates,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM5 20h14a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      color: "sand" as const,
    },
    {
      label: lang === "ar" ? "إجمالي المستخدمين" : "Total Users",
      value: totalUsers,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      color: "blue" as const,
    },
    {
      label: lang === "ar" ? "إجمالي الإيرادات" : "Total Revenue",
      value: lang === "ar"
        ? `${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.أ`
        : `${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} JOD`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: "navy" as const,
    },
  ];

  const colorMap = {
    amber: {
      card: "border-amber-100 bg-white shadow-sm hover:border-amber-300",
      icon: "bg-amber-50 text-amber-600 border border-amber-100",
      value: "text-amber-600",
    },
    emerald: {
      card: "border-emerald-100 bg-white shadow-sm hover:border-emerald-300",
      icon: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      value: "text-emerald-600",
    },
    sand: {
      card: "border-[#EBE7DF] bg-white shadow-sm hover:border-[#B89C72]/50",
      icon: "bg-[#FAF8F5] text-[#B89C72] border border-[#EBE7DF]",
      value: "text-[#B89C72]",
    },
    blue: {
      card: "border-blue-100 bg-white shadow-sm hover:border-blue-300",
      icon: "bg-blue-50 text-blue-600 border border-blue-100",
      value: "text-blue-600",
    },
    navy: {
      card: "border-emerald-100 bg-white shadow-sm hover:border-emerald-300",
      icon: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      value: "text-emerald-600",
    },
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 font-sans">
      {cards.map((card) => {
        const colors = colorMap[card.color];
        return (
          <div
            key={card.label}
            className={`rounded-2xl border p-4 transition-all duration-300 ${colors.card}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {card.label}
              </p>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${colors.icon}`}
              >
                {card.icon}
              </div>
            </div>
            <p className={`mt-2 text-xl font-extrabold tracking-tight ${colors.value}`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
