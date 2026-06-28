"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MusicPlayerProps {
  musicUrl: string;
}

export default function MusicPlayer({ musicUrl }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(musicUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [musicUrl]);

  const toggle = () => {
    if (!audioRef.current) return;

    if (!hasInteracted) setHasInteracted(true);

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        // Autoplay policy may block — user must interact first
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      {/* Floating button — fixed bottom-right */}
      <motion.button
        onClick={toggle}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-white/90 shadow-lg backdrop-blur-md transition-colors hover:bg-[#D4AF37]/10"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-[3px]"
            >
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: ["8px", "18px", "8px"],
                  }}
                  transition={{
                    duration: 0.6 + i * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-[3px] rounded-full bg-[#D4AF37]"
                />
              ))}
            </motion.div>
          ) : (
            <motion.svg
              key="paused"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#D4AF37]"
            >
              <path
                d="M9.525 18.025C8.25 18.788 6.75 17.85 6.75 16.38V7.62c0-1.47 1.5-2.408 2.775-1.645l7.5 4.38c1.3.76 1.3 2.53 0 3.29l-7.5 4.38z"
                fill="currentColor"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* First-visit tooltip */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: 3, duration: 0.5 }}
            className="fixed bottom-8 right-24 z-50 rounded-lg border border-[#D4AF37]/20 bg-white/95 px-4 py-2 text-sm text-[#6B6B6B] shadow-md backdrop-blur-md"
          >
            🎵 Tap to play music
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
