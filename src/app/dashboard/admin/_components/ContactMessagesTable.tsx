"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";

export interface ContactMessageItem {
  id: string;
  userId?: string | null;
  email: string;
  phone: string;
  message: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  status: "UNREAD" | "READ" | "RESOLVED" | "REPLIED";
  createdAt: string;
  updatedAt: string;
}

interface ContactMessagesTableProps {
  messages: ContactMessageItem[];
  loading?: boolean;
  onRefresh: () => void;
}

export default function ContactMessagesTable({
  messages,
  loading = false,
  onRefresh,
}: ContactMessagesTableProps) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNREAD" | "READ" | "REPLIED" | "RESOLVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Active inline reply state
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleUpdateStatus = async (id: string, newStatus: "UNREAD" | "READ" | "RESOLVED" | "REPLIED") => {
    setActionLoadingId(id);
    try {
      await api.patch(`/contact/admin/${id}/status`, { status: newStatus });
      onRefresh();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setActionLoadingId(id);
    try {
      await api.post(`/contact/admin/${id}/reply`, { reply: replyText.trim() });
      setReplyingId(null);
      setReplyText("");
      onRefresh();
    } catch (err) {
      console.error("Failed to send reply", err);
      alert(isAr ? "فشل إرسال الرد، يرجى المحاولة لاحقاً" : "Failed to send reply. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذه الرسالة؟" : "Are you sure you want to delete this message?")) {
      return;
    }
    setActionLoadingId(id);
    try {
      await api.delete(`/contact/admin/${id}`);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete message", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesStatus = statusFilter === "ALL" || msg.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      msg.email.toLowerCase().includes(q) ||
      msg.phone.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q) ||
      (msg.adminReply || "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const unreadCount = messages.filter((m) => m.status === "UNREAD").length;

  return (
    <div className="space-y-6 font-sans" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Banner / Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1528] border border-[#1E2E4A] rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif font-bold text-[#E5C38B]">
              {isAr ? "رسائل الدعم والاتصال" : "Contact & Support Messages"}
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                {unreadCount} {isAr ? "غير مقروءة" : "Unread"}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {isAr
              ? "متابعة واستقبال والرد على الرسائل والمشاكل المرسلة من عملاء المنصة"
              : "Manage, reply to, and resolve support messages submitted by registered clients"}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", "UNREAD", "READ", "REPLIED", "RESOLVED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#E5C38B] text-[#0B1528] shadow-md"
                  : "bg-[#101F35] text-neutral-300 border border-[#1E2E4A] hover:border-[#E5C38B]/50"
              }`}
            >
              {st === "ALL" && (isAr ? "الكل" : "All")}
              {st === "UNREAD" && (isAr ? "غير مقروءة" : "Unread")}
              {st === "READ" && (isAr ? "مقروءة" : "Read")}
              {st === "REPLIED" && (isAr ? "تم الرد" : "Replied")}
              {st === "RESOLVED" && (isAr ? "تم الحل" : "Resolved")}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isAr ? "البحث بالبريد، الهاتف، محتوى الرسالة، أو الرد..." : "Search by email, phone, message, or reply..."}
          className="w-full bg-[#0B1528] border border-[#1E2E4A] focus:border-[#E5C38B] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition-colors"
        />
      </div>

      {/* Messages List / Table */}
      {loading ? (
        <div className="p-12 text-center text-neutral-400 text-xs">
          {isAr ? "جاري تحميل الرسائل..." : "Loading messages..."}
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-[#0B1528] border border-[#1E2E4A] rounded-2xl p-12 text-center text-neutral-400 text-xs">
          {isAr ? "لا توجد رسائل مطابقة" : "No messages found"}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => {
            const cleanPhone = (msg.phone || "").replace(/[^0-9]/g, "");
            const isUnread = msg.status === "UNREAD";
            const isReplying = replyingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`bg-[#0B1528] border rounded-2xl p-5 transition-all shadow-md ${
                  isUnread
                    ? "border-amber-500/40 bg-[#101F35]"
                    : "border-[#1E2E4A] hover:border-[#E5C38B]/30"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Message Details & Admin Reply */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Status Tag */}
                      {msg.status === "UNREAD" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          {isAr ? "جديد / غير مقروء" : "New / Unread"}
                        </span>
                      )}
                      {msg.status === "READ" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                          {isAr ? "مقروءة" : "Read"}
                        </span>
                      )}
                      {msg.status === "REPLIED" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          {isAr ? "تم الرد بالسيستم" : "Replied via System"}
                        </span>
                      )}
                      {msg.status === "RESOLVED" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          {isAr ? "تم المعالجة" : "Resolved"}
                        </span>
                      )}

                      <span className="text-[11px] text-neutral-400 font-mono">
                        {new Date(msg.createdAt).toLocaleString(isAr ? "ar-JO" : "en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    {/* Sender Info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-[#E5C38B] font-semibold hover:underline flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{msg.email}</span>
                      </a>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${msg.phone}`}
                          className="text-neutral-300 font-medium hover:text-white flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{msg.phone}</span>
                        </a>

                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                          >
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Original Message Box */}
                    <div className="bg-[#101F35] border border-[#1E2E4A] rounded-xl p-3.5 text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
                      <span className="block text-[10px] font-bold text-[#E5C38B] mb-1">
                        {isAr ? "محتوى رسالة العميل:" : "Client Message:"}
                      </span>
                      {msg.message}
                    </div>

                    {/* Existing Admin Reply Box if present */}
                    {msg.adminReply && (
                      <div className="bg-[#1A2D4C]/60 border border-[#E5C38B]/30 rounded-xl p-3.5 text-xs text-[#E5C38B] leading-relaxed whitespace-pre-wrap">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-[#E5C38B] uppercase tracking-wider flex items-center gap-1">
                            💬 {isAr ? "رد المشرف (تم إرسال إشعار للعميل):" : "Admin Reply (Notification sent to user):"}
                          </span>
                          {msg.repliedAt && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {new Date(msg.repliedAt).toLocaleString(isAr ? "ar-JO" : "en-US", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-white text-xs mt-1">{msg.adminReply}</p>
                      </div>
                    )}

                    {/* Inline Reply Form Toggle */}
                    {isReplying && (
                      <div className="mt-3 p-4 rounded-xl bg-[#08101E] border border-[#E5C38B]/40 space-y-3 animate-fadeIn">
                        <h4 className="text-xs font-bold text-[#E5C38B]">
                          {isAr ? "كتابة رد وإرساله كإشعار للعميل" : "Compose reply & send notification to client"}
                        </h4>
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={isAr ? "اكتب الرد هنا وسيتلقاه العميل فوراً كإشعار..." : "Type your reply here to notify the client..."}
                          className="w-full bg-[#101F35] border border-[#1E2E4A] focus:border-[#E5C38B] rounded-xl p-3 text-xs text-white placeholder:text-neutral-500 outline-none transition-colors resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setReplyingId(null);
                              setReplyText("");
                            }}
                            className="px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white text-xs transition-all cursor-pointer"
                          >
                            {isAr ? "إلغاء" : "Cancel"}
                          </button>
                          <button
                            disabled={actionLoadingId === msg.id || !replyText.trim()}
                            onClick={() => handleSendReply(msg.id)}
                            className="px-4 py-1.5 rounded-lg bg-[#E5C38B] text-[#0B1528] font-bold text-xs hover:bg-[#d6b377] transition-all cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === msg.id ? (isAr ? "جاري الإرسال..." : "Sending...") : (isAr ? "إرسال الرد والإشعار" : "Send Reply & Notify")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0 pt-2 md:pt-0">
                    <button
                      disabled={actionLoadingId === msg.id}
                      onClick={() => {
                        setReplyingId(replyingId === msg.id ? null : msg.id);
                        setReplyText(msg.adminReply || "");
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#E5C38B] text-[#0B1528] hover:bg-[#d6b377] text-[11px] font-bold transition-all cursor-pointer text-center shadow-xs"
                    >
                      💬 {isAr ? "رد وإشعار" : "Reply & Notify"}
                    </button>

                    {msg.status !== "READ" && msg.status !== "REPLIED" && (
                      <button
                        disabled={actionLoadingId === msg.id}
                        onClick={() => handleUpdateStatus(msg.id, "READ")}
                        className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 text-[11px] font-bold transition-all cursor-pointer text-center"
                      >
                        {isAr ? "تعيين كمقروء" : "Mark Read"}
                      </button>
                    )}

                    {msg.status !== "RESOLVED" && (
                      <button
                        disabled={actionLoadingId === msg.id}
                        onClick={() => handleUpdateStatus(msg.id, "RESOLVED")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer text-center"
                      >
                        {isAr ? "تم الحل" : "Resolve"}
                      </button>
                    )}

                    <button
                      disabled={actionLoadingId === msg.id}
                      onClick={() => handleDelete(msg.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-[11px] font-bold transition-all cursor-pointer text-center"
                    >
                      {isAr ? "حذف" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
