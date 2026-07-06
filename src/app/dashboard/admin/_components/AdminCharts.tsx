"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import type { Order } from "./OrdersTable";
import type { User } from "./UsersTable";

// ── Types ────────────────────────────────────────────────────────────────

interface AdminChartsProps {
  orders: Order[];
  users: User[];
}

type Timeframe = "week" | "month" | "year" | "all" | "specific";

interface ChartDataPoint {
  label: string;
  value: number;
  tooltip: string;
  dateKey: string;
}

// ── Helper Date Constants & Aggregation Utilities ────────────────────────

const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", 
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// Parse date string to YYYY-MM-DD local format
const getLocalDateString = (isoString: string): string => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Generate list of last N days
const getLastNDays = (n: number): Date[] => {
  const list: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    list.push(d);
  }
  return list;
};

// Generate list of last 12 months
const getLast12Months = (): Date[] => {
  const list: Date[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1); // avoid month overflow issues
    d.setMonth(d.getMonth() - i);
    list.push(d);
  }
  return list;
};

// ── Reusable Custom SVG Line/Area Chart ──────────────────────────────────

interface SvgAreaChartProps {
  data: ChartDataPoint[];
  color: "gold" | "blue" | "emerald";
  lang: "ar" | "en";
  ySuffix?: string;
  valuePrefix?: string;
}

function SvgAreaChart({ data, color, lang, ySuffix = "", valuePrefix = "" }: SvgAreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // SVG coordinate configurations
  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 60;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 40;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Compute boundaries
  const maxVal = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 0);
    return max === 0 ? 100 : max * 1.15; // 15% padding on top
  }, [data]);

  // Coordinates mapping
  const points = useMemo(() => {
    if (data.length === 0) return [];
    return data.map((d, i) => {
      const x = padLeft + (data.length === 1 ? chartWidth / 2 : (i / (data.length - 1)) * chartWidth);
      const y = svgHeight - padBottom - (d.value / maxVal) * chartHeight;
      return { x, y };
    });
  }, [data, maxVal, chartWidth, chartHeight, padLeft, padBottom, svgHeight]);

  // Generate SVG Line and Area path strings
  const paths = useMemo(() => {
    if (points.length === 0) return { line: "", area: "" };
    
    // Draw straight connecting lines
    const linePath = points.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, "");

    const areaPath = points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - padBottom} L ${points[0].x} ${svgHeight - padBottom} Z`
      : "";

    return { line: linePath, area: areaPath };
  }, [points, svgHeight, padBottom]);

  // Styling maps
  const colorMap = {
    gold: {
      stroke: "#B89C72",
      fillGrad: "url(#gold-gradient)",
      dotColor: "#B89C72",
      dotBg: "#FAF8F5",
      glow: "rgba(184, 156, 114, 0.4)",
    },
    blue: {
      stroke: "#2563EB",
      fillGrad: "url(#blue-gradient)",
      dotColor: "#2563EB",
      dotBg: "#EFF6FF",
      glow: "rgba(37, 99, 235, 0.4)",
    },
    emerald: {
      stroke: "#059669",
      fillGrad: "url(#emerald-gradient)",
      dotColor: "#059669",
      dotBg: "#ECFDF5",
      glow: "rgba(5, 150, 105, 0.4)",
    },
  };

  const style = colorMap[color];

  // Grid levels (5 horizontal lines)
  const gridLevels = [0, 0.25, 0.5, 0.75, 1];

  // X Axis Label filtering to avoid layout clutter
  const labelInterval = useMemo(() => {
    if (data.length <= 10) return 1;
    if (data.length <= 16) return 2;
    if (data.length <= 31) return 5;
    return Math.ceil(data.length / 6);
  }, [data.length]);

  return (
    <div ref={containerRef} className="relative w-full font-sans select-none">
      {/* Chart SVG */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width="100%"
        height={svgHeight}
        className="overflow-visible text-neutral-800"
      >
        <defs>
          <linearGradient id="gold-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B89C72" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#B89C72" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines and Y axis Labels */}
        {gridLevels.map((level, i) => {
          const val = maxVal * level;
          const y = svgHeight - padBottom - level * chartHeight;
          const formattedVal = val.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
            maximumFractionDigits: 0,
          });

          return (
            <g key={i} className="opacity-40">
              <line
                x1={padLeft}
                y1={y}
                x2={svgWidth - padRight}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={lang === "ar" ? svgWidth - padRight + 5 : padLeft - 10}
                y={y + 4}
                textAnchor={lang === "ar" ? "start" : "end"}
                className="text-[9px] fill-neutral-400 font-bold"
              >
                {formattedVal} {ySuffix}
              </text>
            </g>
          );
        })}

        {/* Chart Paths */}
        {data.length > 0 && (
          <>
            {/* Area under curve */}
            <path d={paths.area} fill={style.fillGrad} />

            {/* Main Path Line */}
            <path
              d={paths.line}
              fill="none"
              stroke={style.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Individual Data point circles */}
            {points.map((p, i) => {
              const isSelected = hoveredIndex === i;
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 6 : 2}
                  fill={isSelected ? style.dotBg : style.dotColor}
                  stroke={style.dotColor}
                  strokeWidth={isSelected ? 3 : 1}
                  className="transition-all duration-150"
                />
              );
            })}
          </>
        )}

        {/* X Axis Labels */}
        {data.map((d, i) => {
          if (i % labelInterval !== 0 && i !== data.length - 1) return null;
          const p = points[i];
          if (!p) return null;
          return (
            <text
              key={i}
              x={p.x}
              y={svgHeight - padBottom + 16}
              textAnchor="middle"
              className="text-[9px] fill-neutral-400 font-bold opacity-80"
            >
              {d.label}
            </text>
          );
        })}

        {/* Vertical hover overlay zone line */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <line
            x1={points[hoveredIndex].x}
            y1={padTop}
            x2={points[hoveredIndex].x}
            y2={svgHeight - padBottom}
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="opacity-70"
          />
        )}

        {/* Hover detection overlay panels */}
        {points.map((p, i) => {
          const colWidth = chartWidth / Math.max(data.length - 1, 1);
          const x = p.x - colWidth / 2;
          return (
            <rect
              key={i}
              x={x}
              y={padTop}
              width={colWidth}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseMove={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
      </svg>

      {/* Floating HTML Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && points[hoveredIndex] && (
        <div
          className="absolute z-30 pointer-events-none rounded-xl border border-neutral-100 bg-white p-2.5 shadow-md text-xs transition-all duration-75"
          style={{
            top: `${points[hoveredIndex].y - 65}px`,
            left: lang === "ar"
              ? `calc(${100 - (points[hoveredIndex].x / svgWidth) * 100}% - 60px)`
              : `calc(${(points[hoveredIndex].x / svgWidth) * 100}% - 60px)`,
            direction: lang === "ar" ? "rtl" : "ltr",
          }}
        >
          <p className="font-bold text-neutral-400 text-[10px] leading-none mb-1">
            {data[hoveredIndex].tooltip}
          </p>
          <p className="font-extrabold text-neutral-850">
            {valuePrefix}
            {data[hoveredIndex].value.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
            {ySuffix && ` ${ySuffix}`}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Reusable Custom SVG Bar Chart ────────────────────────────────────────

interface SvgBarChartProps {
  data: ChartDataPoint[];
  color: "blue" | "emerald" | "gold";
  lang: "ar" | "en";
}

function SvgBarChart({ data, color, lang }: SvgBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const svgWidth = 300;
  const svgHeight = 160;
  const padLeft = 40;
  const padRight = 10;
  const padTop = 15;
  const padBottom = 30;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  const maxVal = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 0);
    return max === 0 ? 10 : Math.ceil(max * 1.15);
  }, [data]);

  // Layout calculations for bars
  const totalBars = data.length;
  const barSpacing = totalBars > 15 ? 2 : 4;
  const availableWidthForBars = chartWidth - (totalBars - 1) * barSpacing;
  const barWidth = Math.max(availableWidthForBars / totalBars, 1.5);

  const bars = useMemo(() => {
    return data.map((d, i) => {
      const x = padLeft + i * (barWidth + barSpacing);
      const h = (d.value / maxVal) * chartHeight;
      const y = svgHeight - padBottom - h;
      return { x, y, w: barWidth, h, value: d.value };
    });
  }, [data, maxVal, chartHeight, barWidth, barSpacing, padLeft, padBottom, svgHeight]);

  const colorMap = {
    blue: {
      fill: "#3B82F6",
      hoverFill: "#2563EB",
      bg: "bg-blue-50",
    },
    emerald: {
      fill: "#10B981",
      hoverFill: "#059669",
      bg: "bg-emerald-50",
    },
    gold: {
      fill: "#E5C38B",
      hoverFill: "#B89C72",
      bg: "bg-[#FAF8F5]",
    },
  };

  const style = colorMap[color];

  // Grid levels
  const gridLevels = [0, 0.33, 0.66, 1];

  const labelInterval = useMemo(() => {
    if (data.length <= 7) return 1;
    if (data.length <= 15) return 2;
    return 5;
  }, [data.length]);

  return (
    <div className="relative w-full font-sans select-none">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width="100%"
        height={svgHeight}
        className="overflow-visible"
      >
        {/* Grids & Y-Labels */}
        {gridLevels.map((level, i) => {
          const val = maxVal * level;
          const y = svgHeight - padBottom - level * chartHeight;
          const formattedVal = Math.round(val).toLocaleString(lang === "ar" ? "ar-EG" : "en-US");

          return (
            <g key={i} className="opacity-45">
              <line
                x1={padLeft}
                y1={y}
                x2={svgWidth - padRight}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="0.75"
                strokeDasharray="3 3"
              />
              <text
                x={padLeft - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[8px] fill-neutral-400 font-bold"
              >
                {formattedVal}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {bars.map((bar, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <rect
              key={i}
              x={bar.x}
              y={bar.y}
              width={bar.w}
              height={Math.max(bar.h, 0.5)}
              fill={isHovered ? style.hoverFill : style.fill}
              rx={Math.min(bar.w / 2, 2)}
              className="transition-colors duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseMove={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}

        {/* X Labels */}
        {data.map((d, i) => {
          if (i % labelInterval !== 0 && i !== data.length - 1) return null;
          const bar = bars[i];
          if (!bar) return null;
          return (
            <text
              key={i}
              x={bar.x + bar.w / 2}
              y={svgHeight - padBottom + 12}
              textAnchor="middle"
              className="text-[8px] fill-neutral-400 font-bold opacity-80"
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      {/* Bar Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && bars[hoveredIndex] && (
        <div
          className="absolute z-35 pointer-events-none rounded-xl border border-neutral-100 bg-white p-2 shadow-md text-[10px] transition-all duration-75"
          style={{
            top: `${bars[hoveredIndex].y - 50}px`,
            left: lang === "ar"
              ? `calc(${100 - ((bars[hoveredIndex].x + bars[hoveredIndex].w / 2) / svgWidth) * 100}% - 40px)`
              : `calc(${((bars[hoveredIndex].x + bars[hoveredIndex].w / 2) / svgWidth) * 100}% - 40px)`,
            direction: lang === "ar" ? "rtl" : "ltr",
          }}
        >
          <p className="font-bold text-neutral-400 leading-none mb-0.5">
            {data[hoveredIndex].tooltip}
          </p>
          <p className="font-extrabold text-neutral-800 text-xs">
            {data[hoveredIndex].value.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main AdminCharts Component ───────────────────────────────────────────

export default function AdminCharts({ orders, users }: AdminChartsProps) {
  const { lang } = useLanguage();

  // Selected timeframes states for each chart
  const [revenueTimeframe, setRevenueTimeframe] = useState<Timeframe>("week");
  const [usersTimeframe, setUsersTimeframe] = useState<Timeframe>("week");
  const [requestsTimeframe, setRequestsTimeframe] = useState<Timeframe>("week");

  // Specific month selection state (for selections)
  const [revSelectedYear, setRevSelectedYear] = useState<number>(new Date().getFullYear());
  const [revSelectedMonth, setRevSelectedMonth] = useState<number>(new Date().getMonth());

  const [usersSelectedYear, setUsersSelectedYear] = useState<number>(new Date().getFullYear());
  const [usersSelectedMonth, setUsersSelectedMonth] = useState<number>(new Date().getMonth());

  const [reqSelectedYear, setReqSelectedYear] = useState<number>(new Date().getFullYear());
  const [reqSelectedMonth, setReqSelectedMonth] = useState<number>(new Date().getMonth());

  // Extract years dynamically from users and orders dataset
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(new Date().getFullYear()); // always include current year
    
    users.forEach((u) => {
      if (u.createdAt) {
        const y = new Date(u.createdAt).getFullYear();
        if (!isNaN(y)) yearsSet.add(y);
      }
    });

    orders.forEach((o) => {
      if (o.createdAt) {
        const y = new Date(o.createdAt).getFullYear();
        if (!isNaN(y)) yearsSet.add(y);
      }
    });

    return Array.from(yearsSet).sort((a, b) => b - a); // descending order
  }, [users, orders]);

  // Aggregation mapping
  const aggregateData = (
    timeframe: Timeframe,
    selYear: number,
    selMonth: number,
    dataType: "revenue" | "users" | "requests"
  ): ChartDataPoint[] => {
    const today = new Date();
    
    if (timeframe === "week") {
      const dates = getLastNDays(7);
      return dates.map((date) => {
        const key = getLocalDateString(date.toISOString());
        const dayIdx = date.getDay();
        const label = lang === "ar" ? WEEKDAYS_AR[dayIdx] : WEEKDAYS_EN[dayIdx];
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const tooltip = `${mm}/${dd}`;

        let val = 0;
        if (dataType === "revenue") {
          val = orders
            .filter((o) => o.status === "APPROVED" && getLocalDateString(o.createdAt) === key)
            .reduce((sum, o) => sum + parseFloat(o.template.price), 0);
        } else if (dataType === "users") {
          val = users.filter((u) => getLocalDateString(u.createdAt) === key).length;
        } else {
          val = orders.filter((o) => getLocalDateString(o.createdAt) === key).length;
        }

        return { label, value: val, tooltip, dateKey: key };
      });
    }

    if (timeframe === "month") {
      const dates = getLastNDays(30);
      return dates.map((date) => {
        const key = getLocalDateString(date.toISOString());
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const label = `${mm}/${dd}`;
        const tooltip = key;

        let val = 0;
        if (dataType === "revenue") {
          val = orders
            .filter((o) => o.status === "APPROVED" && getLocalDateString(o.createdAt) === key)
            .reduce((sum, o) => sum + parseFloat(o.template.price), 0);
        } else if (dataType === "users") {
          val = users.filter((u) => getLocalDateString(u.createdAt) === key).length;
        } else {
          val = orders.filter((o) => getLocalDateString(o.createdAt) === key).length;
        }

        return { label, value: val, tooltip, dateKey: key };
      });
    }

    if (timeframe === "year") {
      const months = getLast12Months();
      return months.map((mDate) => {
        const y = mDate.getFullYear();
        const m = mDate.getMonth();
        const key = `${y}-${String(m + 1).padStart(2, "0")}`;
        const label = lang === "ar" ? MONTHS_AR[m] : MONTHS_EN[m];
        const tooltip = `${label} ${y}`;

        let val = 0;
        if (dataType === "revenue") {
          val = orders
            .filter((o) => o.status === "APPROVED" && getLocalDateString(o.createdAt).startsWith(key))
            .reduce((sum, o) => sum + parseFloat(o.template.price), 0);
        } else if (dataType === "users") {
          val = users.filter((u) => getLocalDateString(u.createdAt).startsWith(key)).length;
        } else {
          val = orders.filter((o) => getLocalDateString(o.createdAt).startsWith(key)).length;
        }

        return { label, value: val, tooltip, dateKey: key };
      });
    }

    if (timeframe === "all") {
      let oldestDate = new Date();
      oldestDate.setMonth(oldestDate.getMonth() - 11);

      const allDates = [
        ...users.map((u) => new Date(u.createdAt)),
        ...orders.map((o) => new Date(o.createdAt)),
      ].filter((d) => !isNaN(d.getTime()));

      if (allDates.length > 0) {
        const minTime = Math.min(...allDates.map((d) => d.getTime()));
        oldestDate = new Date(minTime);
      }

      const list: ChartDataPoint[] = [];
      const iter = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 1);

      // Guard to prevent infinite loop if dates are corrupted
      let limitCount = 0;
      while (iter <= end && limitCount < 600) {
        limitCount++;
        const y = iter.getFullYear();
        const m = iter.getMonth();
        const key = `${y}-${String(m + 1).padStart(2, "0")}`;

        const monthLabel = lang === "ar" ? MONTHS_AR[m] : MONTHS_EN[m];
        const label = `${monthLabel} ${String(y).slice(-2)}`;
        const tooltip = `${monthLabel} ${y}`;

        let val = 0;
        if (dataType === "revenue") {
          val = orders
            .filter((o) => o.status === "APPROVED" && getLocalDateString(o.createdAt).startsWith(key))
            .reduce((sum, o) => sum + parseFloat(o.template.price), 0);
        } else if (dataType === "users") {
          val = users.filter((u) => getLocalDateString(u.createdAt).startsWith(key)).length;
        } else {
          val = orders.filter((o) => getLocalDateString(o.createdAt).startsWith(key)).length;
        }

        list.push({ label, value: val, tooltip, dateKey: key });
        iter.setMonth(iter.getMonth() + 1);
      }

      return list;
    }

    if (timeframe === "specific") {
      const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
      const list: ChartDataPoint[] = [];
      
      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = String(d).padStart(2, "0");
        const monthStr = String(selMonth + 1).padStart(2, "0");
        const key = `${selYear}-${monthStr}-${dayStr}`;

        const label = `${d}`;
        const monthLabel = lang === "ar" ? MONTHS_AR[selMonth] : MONTHS_EN[selMonth];
        const tooltip = `${monthLabel} ${d}, ${selYear}`;

        let val = 0;
        if (dataType === "revenue") {
          val = orders
            .filter((o) => o.status === "APPROVED" && getLocalDateString(o.createdAt) === key)
            .reduce((sum, o) => sum + parseFloat(o.template.price), 0);
        } else if (dataType === "users") {
          val = users.filter((u) => getLocalDateString(u.createdAt) === key).length;
        } else {
          val = orders.filter((o) => getLocalDateString(o.createdAt) === key).length;
        }

        list.push({ label, value: val, tooltip, dateKey: key });
      }

      return list;
    }

    return [];
  };

  const revenueChartData = useMemo(() => {
    return aggregateData(revenueTimeframe, revSelectedYear, revSelectedMonth, "revenue");
  }, [revenueTimeframe, revSelectedYear, revSelectedMonth, orders]);

  const usersChartData = useMemo(() => {
    return aggregateData(usersTimeframe, usersSelectedYear, usersSelectedMonth, "users");
  }, [usersTimeframe, usersSelectedYear, usersSelectedMonth, users]);

  const requestsChartData = useMemo(() => {
    return aggregateData(requestsTimeframe, reqSelectedYear, reqSelectedMonth, "requests");
  }, [requestsTimeframe, reqSelectedYear, reqSelectedMonth, orders]);

  const localized = {
    revenueTitle: lang === "ar" ? "إحصاءات الإيرادات" : "Revenue Statistics",
    usersTitle: lang === "ar" ? "تسجيلات المستخدمين الجدد" : "New User Registrations",
    requestsTitle: lang === "ar" ? "طلبات تفعيل النماذج" : "Unlock Purchase Requests",
    
    lastWeek: lang === "ar" ? "الأسبوع الماضي" : "Last Week",
    lastMonth: lang === "ar" ? "الشهر الماضي" : "Last Month",
    lastYear: lang === "ar" ? "السنة الماضية" : "Last Year",
    allTime: lang === "ar" ? "كل الوقت" : "All Time",
    chooseMonth: lang === "ar" ? "اختر شهراً" : "Select Month",
  };

  const TimeframeSelector = ({
    selected,
    onChange,
    hasMonthSelect,
    onYearChange,
    onMonthChange,
    selectedYear,
    selectedMonth,
  }: {
    selected: Timeframe;
    onChange: (t: Timeframe) => void;
    hasMonthSelect?: boolean;
    onYearChange?: (y: number) => void;
    onMonthChange?: (m: number) => void;
    selectedYear?: number;
    selectedMonth?: number;
  }) => {
    const timeframes: { id: Timeframe; label: string }[] = [
      { id: "week", label: localized.lastWeek },
      { id: "month", label: localized.lastMonth },
      { id: "year", label: localized.lastYear },
      { id: "all", label: localized.allTime },
    ];

    if (hasMonthSelect) {
      timeframes.push({ id: "specific", label: localized.chooseMonth });
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-neutral-155 bg-neutral-100 p-1 rounded-xl gap-0.5">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => onChange(tf.id)}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                selected === tf.id
                  ? "bg-white text-neutral-800 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {selected === "specific" && hasMonthSelect && onYearChange && onMonthChange && (
          <div className="flex items-center gap-1.5 animate-fadeIn">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="text-[10px] font-bold bg-white border border-[#EBE7DF] rounded-lg px-2 py-1 outline-hidden text-neutral-700 cursor-pointer shadow-xs focus:border-[#B89C72]/50"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="text-[10px] font-bold bg-white border border-[#EBE7DF] rounded-lg px-2 py-1 outline-hidden text-neutral-700 cursor-pointer shadow-xs focus:border-[#B89C72]/50"
            >
              {(lang === "ar" ? MONTHS_AR : MONTHS_EN).map((mName, idx) => (
                <option key={idx} value={idx}>
                  {mName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Section 1: Revenue Statistics Chart ────────────────── */}
      <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 shadow-xs relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-[#FAF8F5] pb-4">
          <div>
            <h3 className="font-serif text-sm font-bold text-neutral-800">
              {localized.revenueTitle}
            </h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {lang === "ar"
                ? "متابعة أداء الأرباح والمبيعات بالريال السعودي."
                : "Monitor revenue growth and total template unlock orders in SAR."}
            </p>
          </div>

          <TimeframeSelector
            selected={revenueTimeframe}
            onChange={setRevenueTimeframe}
            hasMonthSelect
            selectedYear={revSelectedYear}
            selectedMonth={revSelectedMonth}
            onYearChange={setRevSelectedYear}
            onMonthChange={setRevSelectedMonth}
          />
        </div>

        <div className="pt-2">
          <SvgAreaChart
            data={revenueChartData}
            color="gold"
            lang={lang}
            ySuffix={lang === "ar" ? "ر.س" : "SAR"}
            valuePrefix=""
          />
        </div>
      </div>

      {/* ── Section 2: Users & Requests Grid (Two Columns) ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Users Growth Bar Chart */}
        <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-[#FAF8F5] pb-4">
            <div>
              <h3 className="font-serif text-xs font-bold text-neutral-800">
                {localized.usersTitle}
              </h3>
              <p className="text-[9px] text-neutral-400 mt-0.5">
                {lang === "ar"
                  ? "تسجيلات الحسابات الجديدة للعملاء."
                  : "Daily/monthly customer registration growth count."}
              </p>
            </div>

            <TimeframeSelector
              selected={usersTimeframe}
              onChange={setUsersTimeframe}
              hasMonthSelect
              selectedYear={usersSelectedYear}
              selectedMonth={usersSelectedMonth}
              onYearChange={setUsersSelectedYear}
              onMonthChange={setUsersSelectedMonth}
            />
          </div>

          <div className="pt-2">
            <SvgBarChart data={usersChartData} color="blue" lang={lang} />
          </div>
        </div>

        {/* Right Column: Requests Growth Bar Chart */}
        <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-[#FAF8F5] pb-4">
            <div>
              <h3 className="font-serif text-xs font-bold text-neutral-800">
                {localized.requestsTitle}
              </h3>
              <p className="text-[9px] text-neutral-400 mt-0.5">
                {lang === "ar"
                  ? "طلبات فك القفل للنماذج (جديد ومعلق ومعتمد)."
                  : "Volume of purchase unlock requests sent by users."}
              </p>
            </div>

            <TimeframeSelector
              selected={requestsTimeframe}
              onChange={setRequestsTimeframe}
              hasMonthSelect
              selectedYear={reqSelectedYear}
              selectedMonth={reqSelectedMonth}
              onYearChange={setReqSelectedYear}
              onMonthChange={setReqSelectedMonth}
            />
          </div>

          <div className="pt-2">
            <SvgBarChart data={requestsChartData} color="emerald" lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
