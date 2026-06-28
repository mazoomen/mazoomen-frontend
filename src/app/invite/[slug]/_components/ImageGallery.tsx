"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
};

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [[current, direction], setCurrent] = useState([0, 0]);

  const paginate = useCallback(
    (dir: number) => {
      setCurrent(([prev]) => {
        const next = (prev + dir + images.length) % images.length;
        return [next, dir];
      });
    },
    [images.length],
  );

  if (!images.length) return null;

  return (
    <section className="px-6 py-16 sm:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="mb-10 text-center font-serif text-2xl text-[#2C2C2C] sm:text-3xl"
      >
        Our Moments
      </motion.h2>

      <div className="relative mx-auto max-w-2xl">
        {/* Image container */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#D4AF37]/15 bg-[#F9F6F0] shadow-lg sm:aspect-[3/2]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
              }}
              className="absolute inset-0"
            >
              <Image
                src={images[current]}
                alt={`Photo ${current + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority={current === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-[#D4AF37]/20 bg-white/80 p-2 shadow-md backdrop-blur-sm transition-colors hover:bg-[#D4AF37]/10 sm:left-4 sm:p-3"
              aria-label="Previous photo"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#D4AF37]"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => paginate(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#D4AF37]/20 bg-white/80 p-2 shadow-md backdrop-blur-sm transition-colors hover:bg-[#D4AF37]/10 sm:right-4 sm:p-3"
              aria-label="Next photo"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#D4AF37]"
              >
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="mt-5 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent([i, i > current ? 1 : -1])}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-[#D4AF37]"
                    : "w-2 bg-[#D4AF37]/25 hover:bg-[#D4AF37]/50"
                }`}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
