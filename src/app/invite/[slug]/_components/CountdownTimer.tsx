"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  eventDate: string; // ISO 8601
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const now = new Date().getTime();
  const diff = target.getTime() - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const units: { key: keyof TimeLeft; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export default function CountdownTimer({ eventDate }: CountdownTimerProps) {
  const target = new Date(eventDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDate]);

  const isPast =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  return (
    <section className="px-6 py-16 text-center sm:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="mb-2 font-serif text-2xl text-[#2C2C2C] sm:text-3xl"
      >
        {isPast ? "The Celebration Has Begun" : "Counting Down To"}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-10 text-sm text-[#9B9B9B]"
      >
        {target.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </motion.p>

      <div className="mx-auto flex max-w-md justify-center gap-3 sm:gap-5">
        {units.map(({ key, label }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
            className="flex flex-1 flex-col items-center"
          >
            <div className="relative flex h-20 w-full items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-white shadow-sm sm:h-24">
              <span className="font-serif text-3xl tabular-nums text-[#2C2C2C] sm:text-4xl">
                {mounted
                  ? String(timeLeft[key]).padStart(2, "0")
                  : "--"}
              </span>
            </div>
            <span className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#9B9B9B] sm:text-xs">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
