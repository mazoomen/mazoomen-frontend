"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { PhoneInput } from "@/components/ui";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const isAr = lang === "ar";

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      if (user.email) setEmail(user.email);
      if (user.phoneNumber) setPhone(user.phoneNumber);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email.trim() || !phone.trim() || !message.trim()) {
        setError(isAr ? "جميع الحقول مطلوبة" : "All fields are required");
        setLoading(false);
        return;
      }

      await api.post("/contact", {
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });

      setSuccess(true);
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (isAr ? "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة لاحقاً" : "Failed to send message. Please try again.");
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn font-sans">
      <div
        className="bg-[#0B1528] text-white border border-[#E5C38B]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#E5C38B] opacity-10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 rtl:left-auto rtl:right-4 text-neutral-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg bg-neutral-800/40 hover:bg-neutral-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#E5C38B]/20 text-[#E5C38B] flex items-center justify-center mx-auto border border-[#E5C38B]/40">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-serif font-bold text-[#E5C38B]">
              {isAr ? "تم استلام رسالتك بنجاح!" : "Message Received!"}
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto">
              {isAr
                ? "شكراً لتواصلك معنا. قام فريقنا باستلام استفسارك وسنقوم بالرد عليك في أقرب وقت."
                : "Thank you for reaching out. Our team has received your message and will contact you shortly."}
            </p>
            <button
              onClick={handleClose}
              className="mt-4 w-full bg-[#E5C38B] text-[#0B1528] font-bold text-xs py-2.5 rounded-xl hover:bg-[#d6b377] transition-all cursor-pointer shadow-md"
            >
              {isAr ? "إغلاق" : "Close"}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#E5C38B]/10 border border-[#E5C38B]/20 flex items-center justify-center text-[#E5C38B] shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#E5C38B]">
                  {isAr ? "تواصل معنا" : "Contact Us"}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {isAr ? "أرسل لنا استفسارك أو مشكلتك وسنساعدك فوراً" : "Send us your question or issue and we will help you"}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  {isAr ? "البريد الإلكتروني" : "Email Address"} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full bg-[#101F35] border border-[#1E2E4A] focus:border-[#E5C38B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  {isAr ? "رقم الهاتف / واتساب" : "Phone / WhatsApp Number"} *
                </label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  {isAr ? "الرسالة / التفاصيل" : "Message / Issue Details"} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isAr ? "اكتب تفاصيل طلبك أو المشكلة التي تواجهها..." : "Describe your inquiry or issue..."}
                  className="w-full bg-[#101F35] border border-[#1E2E4A] focus:border-[#E5C38B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E5C38B] text-[#0B1528] font-bold text-xs py-3 rounded-xl hover:bg-[#d6b377] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-[#0B1528]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>{isAr ? "جاري الإرسال..." : "Sending..."}</span>
                  </>
                ) : (
                  <span>{isAr ? "إرسال الرسالة" : "Send Message"}</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
