"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  titleAr?: string | null;
  message: string;
  messageAr?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { lang } = useLanguage();
  const { isLoggedIn } = useAuth();
  const isAr = lang === "ar";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const res = await api.get<NotificationItem[]>("/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoggedIn) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  return (
    <div className="relative font-sans" ref={dropdownRef} dir={isAr ? "rtl" : "ltr"}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-full border border-[#1E2E4A] bg-[#101F35] hover:bg-[#1A2D4C] flex items-center justify-center text-[#E5C38B] transition-all cursor-pointer shadow-sm focus:outline-none"
        title={isAr ? "الإشعارات" : "Notifications"}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E5C38B] text-[#0B1528] text-[9px] font-bold px-1 shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Popup */}
      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 bg-[#0B1528] border border-[#E5C38B]/30 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-[#1E2E4A] flex items-center justify-between bg-[#101F35]">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-serif font-bold text-[#E5C38B]">
                {isAr ? "الإشعارات" : "Notifications"}
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E5C38B]/20 text-[#E5C38B]">
                  {unreadCount} {isAr ? "جديد" : "New"}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-[#E5C38B] hover:underline cursor-pointer bg-transparent border-none"
              >
                {isAr ? "تحديد الكل كمقروء" : "Mark all read"}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#1E2E4A]/50">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">
                {isAr ? "جاري التحديث..." : "Loading notifications..."}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#101F35] text-[#E5C38B]/50 flex items-center justify-center mx-auto">
                  🔔
                </div>
                <p>{isAr ? "لا توجد إشعارات حالياً" : "No notifications yet"}</p>
              </div>
            ) : (
              notifications.map((item) => {
                const titleText = isAr ? item.titleAr || item.title : item.title;
                const messageText = isAr ? item.messageAr || item.message : item.message;

                return (
                  <div
                    key={item.id}
                    onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                    className={`p-4 transition-colors cursor-pointer relative group ${
                      !item.isRead ? "bg-[#101F35] hover:bg-[#1A2D4C]" : "bg-[#0B1528] hover:bg-[#101F35]"
                    }`}
                  >
                    {!item.isRead && (
                      <div className="absolute top-4 left-3 rtl:left-auto rtl:right-3 w-2 h-2 rounded-full bg-[#E5C38B]" />
                    )}

                    <div className={`${!item.isRead ? "pl-3 rtl:pl-0 rtl:pr-3" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#E5C38B] leading-tight">
                          {titleText}
                        </h4>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 text-xs transition-opacity p-0.5 cursor-pointer"
                          title={isAr ? "حذف الإشعار" : "Delete notification"}
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-[11px] text-neutral-200 mt-1 leading-relaxed whitespace-pre-wrap">
                        {messageText}
                      </p>

                      <span className="block text-[9px] text-neutral-400 font-mono mt-2">
                        {new Date(item.createdAt).toLocaleString(isAr ? "ar-JO" : "en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
