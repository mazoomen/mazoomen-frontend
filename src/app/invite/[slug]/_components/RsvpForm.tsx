"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import type { CreateRsvpPayload } from "@/types/invitation";

interface RsvpFormProps {
  invitationId: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function RsvpForm({ invitationId }: RsvpFormProps) {
  const [guestName, setGuestName] = useState("");
  const [willAttend, setWillAttend] = useState<boolean | null>(null);
  const [companionsCount, setCompanionsCount] = useState(0);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || willAttend === null) return;

    setStatus("submitting");
    setErrorMsg("");

    const payload: CreateRsvpPayload = {
      invitationId,
      guestName: guestName.trim(),
      willAttend,
      companionsCount: willAttend ? companionsCount : 0,
    };

    try {
      await api.post("/rsvps", payload);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setErrorMsg(
          axiosErr.response?.data?.message ||
            "Something went wrong. Please try again.",
        );
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <section className="px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-lg"
      >
        <h2 className="mb-2 text-center font-serif text-2xl text-[#2C2C2C] sm:text-3xl">
          RSVP
        </h2>
        <p className="mb-10 text-center text-sm text-[#9B9B9B]">
          We would be honored by your presence
        </p>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            /* ── Success State ──────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-[#D4AF37]/20 bg-white p-10 text-center shadow-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-4 text-5xl"
              >
                ✨
              </motion.div>
              <h3 className="mb-2 font-serif text-2xl text-[#2C2C2C]">
                Thank You!
              </h3>
              <p className="text-[#6B6B6B]">
                Your response has been recorded.
                <br />
                We look forward to celebrating with you!
              </p>
            </motion.div>
          ) : (
            /* ── Form State ────────────────────────────────── */
            <motion.form
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[#D4AF37]/20 bg-white p-8 shadow-lg sm:p-10"
            >
              {/* Guest Name */}
              <div className="mb-6">
                <label
                  htmlFor="rsvp-name"
                  className="mb-2 block text-xs uppercase tracking-[0.15em] text-[#9B9B9B]"
                >
                  Your Name
                </label>
                <input
                  id="rsvp-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-[#FDFCFA] px-4 py-3 text-[#2C2C2C] placeholder-[#C8C8C8] outline-none transition-colors focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20"
                />
              </div>

              {/* Will Attend */}
              <div className="mb-6">
                <label className="mb-3 block text-xs uppercase tracking-[0.15em] text-[#9B9B9B]">
                  Will you attend?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWillAttend(true)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      willAttend === true
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] shadow-sm"
                        : "border-gray-200 bg-[#FDFCFA] text-[#6B6B6B] hover:border-[#D4AF37]/30"
                    }`}
                  >
                    ✓ Joyfully Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => setWillAttend(false)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      willAttend === false
                        ? "border-[#9B9B9B] bg-gray-100 text-[#6B6B6B] shadow-sm"
                        : "border-gray-200 bg-[#FDFCFA] text-[#6B6B6B] hover:border-gray-300"
                    }`}
                  >
                    Respectfully Decline
                  </button>
                </div>
              </div>

              {/* Companions Count — only when attending */}
              <AnimatePresence>
                {willAttend && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-6">
                      <label
                        htmlFor="rsvp-companions"
                        className="mb-2 block text-xs uppercase tracking-[0.15em] text-[#9B9B9B]"
                      >
                        Number of Companions
                      </label>
                      <select
                        id="rsvp-companions"
                        value={companionsCount}
                        onChange={(e) =>
                          setCompanionsCount(Number(e.target.value))
                        }
                        className="w-full rounded-xl border border-gray-200 bg-[#FDFCFA] px-4 py-3 text-[#2C2C2C] outline-none transition-colors focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20"
                      >
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n === 0 ? "Just me" : `+ ${n} companion${n > 1 ? "s" : ""}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600"
                >
                  {errorMsg}
                </motion.p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  !guestName.trim() ||
                  willAttend === null ||
                  status === "submitting"
                }
                className="mt-2 w-full rounded-xl bg-[#D4AF37] py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#C9A42F] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "submitting" ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M4 12a8 8 0 018-8"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Sending…
                  </span>
                ) : (
                  "Send Response"
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
