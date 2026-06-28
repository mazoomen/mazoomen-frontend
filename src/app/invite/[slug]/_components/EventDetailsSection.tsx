"use client";

import { motion } from "framer-motion";

interface EventDetailsSectionProps {
  eventDate: string;
  locationUrl: string;
}

export default function EventDetailsSection({
  eventDate,
  locationUrl,
}: EventDetailsSectionProps) {
  const date = new Date(eventDate);

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-lg rounded-2xl border border-[#D4AF37]/20 bg-white p-8 text-center shadow-lg sm:p-12"
      >
        <h2 className="mb-6 font-serif text-2xl text-[#2C2C2C] sm:text-3xl">
          Event Details
        </h2>

        <div className="mb-8 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

        {/* Date */}
        <div className="mb-6">
          <div className="mb-1 text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
            Date
          </div>
          <p className="font-serif text-lg text-[#2C2C2C]">{formattedDate}</p>
        </div>

        {/* Time */}
        <div className="mb-6">
          <div className="mb-1 text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
            Time
          </div>
          <p className="font-serif text-lg text-[#2C2C2C]">{formattedTime}</p>
        </div>

        {/* Divider */}
        <div className="mb-8 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

        {/* Location CTA */}
        <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
          Venue
        </div>
        <a
          href={locationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-6 py-3 text-sm font-medium text-[#2C2C2C] transition-all hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:shadow-md"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#D4AF37] transition-transform group-hover:scale-110"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="currentColor"
              opacity="0.2"
            />
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="12"
              cy="9"
              r="2.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          View on Google Maps
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#9B9B9B] transition-transform group-hover:translate-x-0.5"
          >
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </motion.div>
    </section>
  );
}
