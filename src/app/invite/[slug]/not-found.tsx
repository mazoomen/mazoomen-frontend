"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function InviteNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FBF9F5] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="mb-6 text-6xl">💌</div>
        <h1 className="mb-3 font-serif text-3xl text-[#2C2C2C]">
          Invitation Not Found
        </h1>
        <p className="mb-8 max-w-sm text-[#9B9B9B]">
          This invitation link may be incorrect or has been removed. Please
          check with the person who shared it with you.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full border border-[#D4AF37]/30 px-6 py-3 text-sm font-medium text-[#2C2C2C] transition-all hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
        >
          Go Home
        </Link>
      </motion.div>
    </main>
  );
}
