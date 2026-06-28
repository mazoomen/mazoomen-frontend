"use client";

import { motion } from "framer-motion";

interface HeroSectionProps {
  welcomeText: string;
}

export default function HeroSection({ welcomeText }: HeroSectionProps) {
  // Split welcomeText by newlines to support multi-line welcome messages
  const lines = welcomeText.split("\n").filter(Boolean);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {/* Decorative background ornaments */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-40 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-40 w-[1px] -translate-x-1/2 bg-gradient-to-t from-transparent via-[#D4AF37]/40 to-transparent" />
      </div>

      {/* Top ornament */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="mb-6 text-5xl"
      >
        ✦
      </motion.div>

      {/* Main heading — couples' names or welcome */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        className="font-serif text-4xl leading-tight tracking-wide text-[#2C2C2C] sm:text-5xl md:text-6xl lg:text-7xl"
      >
        {lines[0] || "You're Invited"}
      </motion.h1>

      {/* Decorative divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        className="my-6 h-[1px] w-32 origin-center bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent sm:w-48"
      />

      {/* Welcome subtext lines */}
      {lines.slice(1).map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 + i * 0.2, ease: "easeOut" }}
          className="mt-2 max-w-lg text-base leading-relaxed text-[#6B6B6B] sm:text-lg"
        >
          {line}
        </motion.p>
      ))}

      {/* If only one line, show the whole text as subtext too */}
      {lines.length === 1 && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
          className="mt-2 max-w-lg text-base leading-relaxed text-[#6B6B6B] sm:text-lg"
        >
          {welcomeText}
        </motion.p>
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-[#D4AF37]/60"
        >
          <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
          <svg
            width="16"
            height="24"
            viewBox="0 0 16 24"
            fill="none"
            className="opacity-60"
          >
            <path
              d="M8 4L8 20M8 20L2 14M8 20L14 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
