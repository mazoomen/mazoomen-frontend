"use client";

import { useEffect, useState, useCallback } from "react";
import { getS3Url } from "@/lib/s3";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import type { Template, AuthUser } from "@/types/invitation";
import { useLanguage } from "@/components/LanguageContext";
import {
  OrdersTable,
  AddTemplateForm,
  StatsCards,
  UsersTable,
  ReviewsTable,
  AdminCharts,
  CouponsTable,
  AdminInvitationTracker,
  type Order,
  type User,
} from "./_components";
import type { Coupon } from "@/types/purchase";
import InvitationEditor from "../client/_components/InvitationEditor";
import { Spinner, ErrorState, Modal, Button } from "@/components/ui";

type LoadStatus = "loading" | "loaded" | "error";
type TabType = "overview" | "users" | "requests" | "templates" | "reviews" | "coupons";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();

  // Dashboard datasets
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  // Reactive UI Navigation state
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authenticated Admin details
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);

  // ── Template Add/Edit States ─────────────────────────────────────────
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);

  // ── Admin Edit Invitation States ────────────────────────────────────
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any | null>(null);

  // ── Admin Track Invitation Modal State ─────────────────────────────
  const [trackingModalInfo, setTrackingModalInfo] = useState<{
    slug?: string;
    invitationId?: string;
    title?: string;
  } | null>(null);

  // ── User Add/Edit Modal States ───────────────────────────────────────
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null); // Null = Add Mode, User = Edit Mode
  const [modalForm, setModalForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "CLIENT" as "ADMIN" | "CLIENT",
    isActive: true,
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // ── Fetch all data simultaneously ────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      const [ordersRes, usersRes, templatesRes, reviewsRes, couponsRes] = await Promise.all([
        api.get<Order[]>("/purchase-requests"),
        api.get<User[]>("/users"),
        api.get<Template[]>("/templates?includeInactive=true"),
        api.get<any[]>("/testimonials/admin"),
        api.get<Coupon[]>("/coupons"),
      ]);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setTemplates(templatesRes.data);
      setReviews(reviewsRes.data);
      setCoupons(couponsRes.data);
      setStatus("loaded");
    } catch (err) {
      logger.error("Dashboard data fetching error", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Load admin user metadata
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setAdminUser(JSON.parse(stored));
        } catch {}
      }
    }
    // Fetch data
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Logout ───────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("user");
      router.replace("/?auth=login");
    }
  };

  // ── Requests approval status updates ───────────────────────────────────
  const handleStatusUpdated = (
    orderId: string,
    newStatus: "APPROVED" | "REJECTED"
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // ── Manage User Modals ────────────────────────────────────────────────
  const openAddUserModal = () => {
    setEditingUser(null);
    setModalForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "CLIENT",
      isActive: true,
    });
    setModalError("");
    setUserModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setModalForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: "", // Leave blank unless updating password
      role: user.role,
      isActive: user.isActive,
    });
    setModalError("");
    setUserModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError("");

    try {
      if (editingUser) {
        // Edit Mode: PUT /users/:id
        const payload: Record<string, any> = {
          firstName: modalForm.firstName.trim(),
          lastName: modalForm.lastName.trim(),
          email: modalForm.email.trim(),
          phoneNumber: modalForm.phoneNumber.trim(),
          role: modalForm.role,
          isActive: modalForm.isActive,
        };
        if (modalForm.password) {
          payload.password = modalForm.password;
        }

        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        // Add Mode: POST /users
        if (!modalForm.password) {
          throw new Error(
            lang === "ar" ? "كلمة المرور مطلوبة للمستخدمين الجدد." : "Password is required for new users."
          );
        }

        await api.post("/users", {
          firstName: modalForm.firstName.trim(),
          lastName: modalForm.lastName.trim(),
          email: modalForm.email.trim(),
          phoneNumber: modalForm.phoneNumber.trim(),
          password: modalForm.password,
          role: modalForm.role,
          isActive: modalForm.isActive,
        });
      }

      // Success: Close modal and reload data
      setUserModalOpen(false);
      await fetchDashboardData();
    } catch (err: unknown) {
      logger.error("Failed to save user details", err);
      const error = err as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        setModalError(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setModalError(
          error.message ||
            (lang === "ar" ? "فشل حفظ تفاصيل المستخدم." : "Failed to save user details.")
        );
      }
    } finally {
      setModalSubmitting(false);
    }
  };

  // ── Template & Invitation Activation Control ─────────────────────────
  const handleToggleTemplateActivation = async (templateId: string, currentActive: boolean) => {
    try {
      const newActive = !currentActive;
      await api.put(`/templates/${templateId}`, { isActive: newActive });
      setTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? { ...t, isActive: newActive } : t))
      );
    } catch (err) {
      logger.error("Failed to toggle template activation", err);
    }
  };

  const handleLinkStatusUpdated = (invitationId: string, isActive: boolean) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.purchase?.invitation?.id === invitationId
          ? {
              ...o,
              purchase: {
                ...o.purchase,
                invitation: {
                  ...o.purchase.invitation,
                  isActive,
                },
              },
            }
          : o
      )
    );
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await api.delete(`/testimonials/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      logger.error("Failed to delete review", err);
    }
  };

  const handleAddSuccess = async () => {
    setIsAddingTemplate(false);
    await fetchDashboardData();
  };

  const handleEditSuccess = async () => {
    setEditingTemplate(null);
    await fetchDashboardData();
  };

  // Stats
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const approvedCount = orders.filter((o) => o.status === "APPROVED").length;
  const totalRevenue = orders
    .filter((o) => o.status === "APPROVED")
    .reduce((sum, o) => sum + parseFloat(o.template.price.toString()), 0);
  const totalUsers = users.length;
  const totalTemplates = templates.length;

  // Render Loading skeleton
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] font-sans">
        <Spinner
          label={
            lang === "ar" ? "جاري تحميل لوحة التحكم..." : "Loading dashboard details..."
          }
        />
      </div>
    );
  }

  // Render error banner
  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] font-sans p-6">
        <ErrorState
          title={
            lang === "ar"
              ? "فشل في تحميل لوحة تحكم الإدارة."
              : "Failed to load Admin Panel."
          }
          message={
            lang === "ar"
              ? "فشل في تحميل لوحة تحكم الإدارة. يرجى التأكد من تشغيل الخادم."
              : "Failed to load Admin Panel. Make sure the backend server is running."
          }
          retryLabel={lang === "ar" ? "إعادة المحاولة" : "Retry Loading"}
          onRetry={fetchDashboardData}
          className="max-w-md w-full"
        />
      </div>
    );
  }

  // Navigation Links definition
  const menuItems = [
    { id: "overview" as const, labelAr: "لوحة التحكم", labelEn: "Overview" },
    { id: "users" as const, labelAr: "إدارة المستخدمين", labelEn: "Users Directory" },
    { id: "requests" as const, labelAr: "طلبات النماذج", labelEn: "Form Requests" },
    {
      id: "templates" as const,
      labelAr: "إدارة النماذج والقوالب",
      labelEn: "Forms & Templates",
    },
    {
      id: "reviews" as const,
      labelAr: "إدارة التقييمات",
      labelEn: "Client Reviews",
    },
    {
      id: "coupons" as const,
      labelAr: "إدارة الكوبونات",
      labelEn: "Coupons Management",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAF9F6]">
      {/* ── Mobile Sidebar Overlay ────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Refactored Sidebar component ───────────────────────── */}
      <aside
        className={`fixed inset-y-0 ${
          lang === "ar" ? "right-0 border-l" : "left-0 border-r"
        } z-50 flex w-64 flex-col border-[#1E2E4A]/25 bg-[#0B1528] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : lang === "ar"
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo and Brand */}
        <div className="flex h-16 items-center border-b border-[#1E2E4A]/30 px-6 justify-between">
          <span className="text-lg font-bold text-white flex items-center gap-2 select-none">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="#E5C38B"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              className="shrink-0 text-[#E5C38B]"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-[#E5C38B] font-serif">Mazoom</span>
            <span className="text-[9px] bg-[#E5C38B]/10 text-[#E5C38B] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              {lang === "ar" ? "مشرف" : "Admin"}
            </span>
          </span>

          {/* Inline Language Selector */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="text-[10px] font-bold text-neutral-400 border border-[#1E2E4A] hover:bg-[#1E2E4A]/50 hover:text-white px-2 py-1 rounded transition-colors uppercase font-sans cursor-pointer"
          >
            {lang === "ar" ? "EN" : "عربي"}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6 font-sans">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-widest text-[#7F8487]">
            {lang === "ar" ? "إدارة المنصة" : "Platform Management"}
          </p>

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-300 select-none cursor-pointer ${
                activeTab === item.id
                  ? "bg-[#1E2E4A]/50 text-[#E5C38B] border-r-2 border-[#E5C38B] shadow-inner"
                  : "text-neutral-400 hover:text-white hover:bg-[#1E2E4A]/25"
              }`}
            >
              {item.id === "overview" && (
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  className="shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              )}
              {item.id === "users" && (
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  className="shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
              {item.id === "requests" && (
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  className="shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
              {item.id === "templates" && (
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  className="shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {item.id === "reviews" && (
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  className="shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499c.195-.572.93-.572 1.125 0l2.122 6.24a.75.75 0 00.716.521h6.562c.607 0 .86.779.37 1.17l-5.309 4.148a.75.75 0 00-.273.839l2.122 6.24c.196.572-.453 1.05-.94.7l-5.308-4.149a.75.75 0 00-.895 0l-5.308 4.149c-.487.35-1.136-.128-.94-.7l2.12-6.24a.75.75 0 00-.273-.839l-5.308-4.148c-.49-.391-.237-1.17.37-1.17h6.563a.75.75 0 00.716-.521l2.122-6.24z"
                  />
                </svg>
              )}
              {item.id === "coupons" && (
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  className="shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 7h10M7 12h10m-8 5h8M15 3a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h6z"
                  />
                </svg>
              )}
              <span className="truncate">{lang === "ar" ? item.labelAr : item.labelEn}</span>
            </button>
          ))}
        </nav>

        {/* Logged in User metadata */}
        <div className="border-t border-[#1E2E4A]/30 p-4 bg-[#08101E] font-sans">
          {adminUser && (
            <div className="mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5C38B]/20 text-[10px] font-bold text-[#E5C38B]">
                  {adminUser.firstName[0]}
                  {adminUser.lastName[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {adminUser.firstName} {adminUser.lastName}
                  </p>
                  <p className="text-[10px] text-[#7F8487] truncate mt-0.5">{adminUser.email}</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#7F8487] hover:bg-[#1E2E4A]/30 hover:text-red-400 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{lang === "ar" ? "تسجيل الخروج" : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* ── Main Panel Content ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Navbar Header */}
        <header className="flex h-16 shrink-0 items-center border-b border-[#1E2E4A]/20 bg-[#0B1528] px-4 backdrop-blur-md lg:hidden text-white justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-neutral-400 hover:bg-[#1E2E4A]/30 hover:text-white cursor-pointer"
            aria-label="Open sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 12h18M3 6h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <span className="text-xs font-bold font-serif text-[#E5C38B]">
            {activeTab === "overview"
              ? lang === "ar"
                ? "لوحة التحكم"
                : "Overview"
              : activeTab === "users"
                ? lang === "ar"
                  ? "إدارة المستخدمين"
                  : "Users Management"
                : activeTab === "requests"
                  ? lang === "ar"
                    ? "طلبات النماذج"
                    : "Form Requests"
                  : activeTab === "templates"
                    ? lang === "ar"
                      ? "إدارة القوالب"
                      : "Forms & Templates"
                    : activeTab === "reviews"
                      ? lang === "ar"
                        ? "إدارة التقييمات"
                        : "Client Reviews"
                      : lang === "ar"
                        ? "إدارة الكوبونات"
                        : "Coupons Management"}
          </span>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="text-[10px] font-bold text-[#E5C38B] border border-[#1E2E4A] hover:bg-[#1E2E4A]/50 px-2.5 py-1 rounded transition-colors"
          >
            {lang === "ar" ? "EN" : "عربي"}
          </button>
        </header>

        {/* Content Container Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header Area */}
            <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-800 font-serif">
                  {activeTab === "overview"
                    ? lang === "ar"
                      ? "لوحة التحكم الرئيسية"
                      : "Overview Dashboard"
                    : activeTab === "users"
                      ? lang === "ar"
                        ? "دليل المستخدمين"
                        : "User Directory"
                      : activeTab === "requests"
                        ? lang === "ar"
                          ? "طلبات تفعيل النماذج"
                          : "Form Unlock Requests"
                        : activeTab === "templates"
                          ? lang === "ar"
                            ? "إدارة القوالب والنماذج"
                            : "Forms & Templates"
                          : activeTab === "reviews"
                            ? lang === "ar"
                              ? "إدارة مراجعات العملاء"
                              : "Client Reviews Management"
                            : lang === "ar"
                              ? "إدارة كوبونات الخصم"
                              : "Coupons Management"}
                </h1>
                <p className="text-[11px] text-neutral-400 mt-1 font-sans">
                  {activeTab === "overview"
                    ? lang === "ar"
                      ? "نظرة عامة على مبيعات وإحصاءات المنصة."
                      : "Overview of platform templates, requests, and total revenue."
                    : activeTab === "users"
                      ? lang === "ar"
                        ? "إدارة وتعديل بيانات مستخدمي المنصة وتعيين الصلاحيات."
                        : "Manage platform users, update information, and assign roles."
                      : activeTab === "requests"
                        ? lang === "ar"
                          ? "طلبات شراء وتفعيل النماذج والقوالب المعلقة من قبل العملاء."
                          : "Pending custom templates activation and purchases requests."
                        : activeTab === "templates"
                          ? lang === "ar"
                            ? "إضافة وتعديل وحذف النماذج والقوالب المتوفرة على المنصة."
                            : "Configure templates, prices, preview images, and edit default categories."
                          : activeTab === "reviews"
                            ? lang === "ar"
                              ? "عرض والبحث وحذف تقييمات العملاء للنماذج والخدمات."
                              : "Browse, filter, and delete customer reviews and ratings."
                            : lang === "ar"
                              ? "إضافة وتعديل وتفعيل أو تعطيل وحذف كوبونات الخصم المئوية."
                              : "Add, edit, activate, deactivate, and soft-delete percentage discount coupons."}
                </p>
              </div>

              {/* Action Buttons based on Tab */}
              {activeTab === "users" && (
                <Button variant="primary" onClick={openAddUserModal}>
                  {lang === "ar" ? "+ مستخدم جديد" : "+ Add User"}
                </Button>
              )}
              {activeTab === "templates" && !isAddingTemplate && !editingTemplate && (
                <Button variant="primary" onClick={() => setIsAddingTemplate(true)}>
                  {lang === "ar" ? "+ قالب جديد" : "+ Add Template"}
                </Button>
              )}
            </div>

            {/* Content Area Rendering */}
            <div className="transition-all duration-300">
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fadeIn">
                  <StatsCards
                    pendingCount={pendingCount}
                    approvedCount={approvedCount}
                    totalRevenue={totalRevenue}
                    totalUsers={totalUsers}
                    totalTemplates={totalTemplates}
                  />

                  <AdminCharts orders={orders} users={users} />

                  <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 shadow-xs">
                    <h3 className="mb-4 font-serif text-sm font-bold text-neutral-800">
                      {lang === "ar" ? "الطلبات الأخيرة" : "Recent Purchase Requests"}
                    </h3>
                    <OrdersTable
                      orders={orders.slice(0, 5)}
                      onStatusUpdated={handleStatusUpdated}
                      onLinkStatusUpdated={handleLinkStatusUpdated}
                      onEditInvitation={(purchase) => {
                        setEditingPurchase(purchase);
                        setIsEditorOpen(true);
                      }}
                      onTrackInvitation={(inv) => {
                        setTrackingModalInfo({
                          invitationId: inv.id,
                          slug: inv.slug,
                          title: inv.eventTitle,
                        });
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 shadow-xs animate-fadeIn">
                  <UsersTable
                    users={users}
                    onEditUser={openEditUserModal}
                    onAddUser={openAddUserModal}
                  />
                </div>
              )}

              {activeTab === "requests" && (
                <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 shadow-xs animate-fadeIn">
                  <OrdersTable
                    orders={orders}
                    onStatusUpdated={handleStatusUpdated}
                    onLinkStatusUpdated={handleLinkStatusUpdated}
                    onEditInvitation={(purchase) => {
                      setEditingPurchase(purchase);
                      setIsEditorOpen(true);
                    }}
                    onTrackInvitation={(inv) => {
                      setTrackingModalInfo({
                        invitationId: inv.id,
                        slug: inv.slug,
                        title: inv.eventTitle,
                      });
                    }}
                  />
                </div>
              )}

              {activeTab === "templates" && (
                <div className="animate-fadeIn">
                  {isAddingTemplate && (
                    <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 shadow-xs">
                      <div className="mb-6 flex items-center justify-between border-b border-[#FAF1EA] pb-3">
                        <h3 className="font-serif text-sm font-bold text-neutral-850">
                          {lang === "ar" ? "إضافة قالب زفاف جديد" : "Add New Wedding Template"}
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddingTemplate(false)}
                        >
                          {lang === "ar" ? "إلغاء وتراجع" : "Cancel"}
                        </Button>
                      </div>
                      <AddTemplateForm
                        onSuccess={handleAddSuccess}
                        onCancel={() => setIsAddingTemplate(false)}
                      />
                    </div>
                  )}

                  {editingTemplate && (
                    <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 shadow-xs">
                      <div className="mb-6 flex items-center justify-between border-b border-[#FAF1EA] pb-3">
                        <h3 className="font-serif text-sm font-bold text-neutral-850">
                          {lang === "ar" ? "تعديل بيانات القالب" : "Edit Template Details"} —{" "}
                          <span className="text-[#B89C72]">{editingTemplate.title}</span>
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTemplate(null)}
                        >
                          {lang === "ar" ? "إلغاء وتراجع" : "Cancel"}
                        </Button>
                      </div>
                      <AddTemplateForm
                        onSuccess={handleEditSuccess}
                        initialTemplateData={editingTemplate}
                        onCancel={() => setEditingTemplate(null)}
                      />
                    </div>
                  )}

                  {!isAddingTemplate && !editingTemplate && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {templates.map((tpl) => (
                          <div
                            key={tpl.id}
                            className="bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                          >
                            {/* Image Section */}
                            <div className="w-full aspect-[4/3] bg-[#FAF8F5] p-3 border-b border-[#FAF1EA] flex items-center justify-center relative overflow-hidden shrink-0">
                              <Image
                                src={getS3Url(tpl.previewImage)}
                                alt={tpl.title}
                                fill
                                unoptimized
                                className="object-cover group-hover:scale-102 transition-transform duration-500"
                              />
                              <div className="absolute top-2.5 inset-x-2.5 flex justify-between items-center z-10">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[8px] font-bold text-white shadow-xs ${
                                    tpl.isActive ? "bg-emerald-500" : "bg-rose-500"
                                  }`}
                                >
                                  {tpl.isActive
                                    ? lang === "ar"
                                      ? "نشط"
                                      : "Active"
                                    : lang === "ar"
                                      ? "معطل"
                                      : "Inactive"}
                                </span>
                                {tpl.isPremium && (
                                  <span className="bg-amber-500 text-white rounded-full px-2 py-0.5 text-[8px] font-bold shadow-xs">
                                    ★ Premium
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="p-4 flex-1 flex flex-col justify-between gap-4 font-sans text-xs">
                              <div>
                                <h4 className="font-bold text-neutral-850 truncate">
                                  {tpl.title}
                                </h4>
                                <p className="text-[10px] text-neutral-450 mt-1 line-clamp-2 leading-relaxed">
                                  {tpl.description}
                                </p>
                              </div>

                              <div className="flex justify-between items-center border-t border-[#FAF1EA] pt-3 mt-auto">
                                <span className="font-bold text-neutral-800">
                                  {tpl.price} JOD
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingTemplate(tpl)}
                                  >
                                    {lang === "ar" ? "تعديل" : "Edit"}
                                  </Button>
                                  <Button
                                    variant={tpl.isActive ? "danger" : "gold"}
                                    size="sm"
                                    onClick={() =>
                                      handleToggleTemplateActivation(tpl.id, tpl.isActive)
                                    }
                                  >
                                    {tpl.isActive
                                      ? lang === "ar"
                                        ? "تعطيل"
                                        : "Deactivate"
                                      : lang === "ar"
                                        ? "تفعيل"
                                        : "Activate"}
                                  </Button>
                                </div>
                              </div>

                              {tpl.demoLink && (
                                <button
                                  onClick={() => {
                                    const slug = tpl.demoLink?.replace(/^\/invite\//, "").replace(/^\//, "");
                                    setTrackingModalInfo({
                                      slug,
                                      title: `${tpl.title} (${lang === "ar" ? "النسخة التجريبية" : "Demo"})`,
                                    });
                                  }}
                                  className="w-full mt-2 py-2 px-3 bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#B89C72] border border-[#E6E2DA] hover:border-[#B89C72] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                  <span>{lang === "ar" ? "متابعة التجريبية (الردود والصور)" : "Track Demo (RSVPs & Photos)"}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {templates.length === 0 && (
                          <div className="col-span-full p-12 text-center bg-[#FAF9F6]/50 flex flex-col items-center border border-dashed border-neutral-250 rounded-2xl">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-3">
                              <svg
                                width="24"
                                height="24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <p className="mt-1 text-xs text-neutral-400">
                              {lang === "ar"
                                ? "لا توجد قوالب زفاف مضافة بعد."
                                : "No templates added yet."}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 shadow-xs animate-fadeIn">
                  <ReviewsTable
                    reviews={reviews}
                    onDeleteReview={handleDeleteReview}
                  />
                </div>
              )}

              {activeTab === "coupons" && (
                <div className="animate-fadeIn">
                  <CouponsTable
                    coupons={coupons}
                    onRefresh={fetchDashboardData}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── User Add/Edit Popup Modal overlay ──────────────────── */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        backdrop="dark"
        className="bg-white border border-[#EBE7DF] rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 text-neutral-800"
        ariaLabel={
          editingUser
            ? lang === "ar"
              ? "تعديل تفاصيل الحساب"
              : "Edit User Details"
            : lang === "ar"
              ? "إضافة حساب مستخدم جديد"
              : "Add New User Account"
        }
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#FAF1EA] pb-3">
          <h3 className="font-serif font-bold text-neutral-800 text-sm">
            {editingUser
              ? lang === "ar"
                ? "تعديل تفاصيل الحساب"
                : "Edit User Details"
              : lang === "ar"
                ? "إضافة حساب مستخدم جديد"
                : "Add New User Account"}
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleModalSubmit} className="space-y-4 font-sans text-xs text-right" dir="rtl">
          {modalError && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-[11px] text-red-600 font-medium text-center"
              role="alert"
            >
              {modalError}
            </div>
          )}

          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                {lang === "ar" ? "الاسم الأول" : "First Name"} *
              </label>
              <input
                type="text"
                required
                value={modalForm.firstName}
                onChange={(e) => setModalForm({ ...modalForm, firstName: e.target.value })}
                className="w-full bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#B89C72] text-right"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                {lang === "ar" ? "اسم العائلة" : "Last Name"} *
              </label>
              <input
                type="text"
                required
                value={modalForm.lastName}
                onChange={(e) => setModalForm({ ...modalForm, lastName: e.target.value })}
                className="w-full bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#B89C72] text-right"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              {lang === "ar" ? "البريد الإلكتروني" : "Email Address"} *
            </label>
            <input
              type="email"
              required
              value={modalForm.email}
              onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#B89C72] text-right"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              {lang === "ar" ? "رقم الهاتف" : "Phone Number"} *
            </label>
            <input
              type="text"
              required
              placeholder="+966501234567"
              value={modalForm.phoneNumber}
              onChange={(e) => setModalForm({ ...modalForm, phoneNumber: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#B89C72] text-right"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              {lang === "ar" ? "كلمة المرور" : "Password"}{" "}
              {!editingUser
                ? "*"
                : `(${lang === "ar" ? "اتركه فارغاً للاحتفاظ بالحالي" : "leave empty to keep current"})`}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={modalForm.password}
              onChange={(e) => setModalForm({ ...modalForm, password: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#B89C72] text-right"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              {lang === "ar" ? "الصلاحية / الدور" : "Role"} *
            </label>
            <select
              value={modalForm.role}
              onChange={(e) =>
                setModalForm({ ...modalForm, role: e.target.value as "ADMIN" | "CLIENT" })
              }
              className="w-full bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs text-neutral-800 outline-none focus:border-[#B89C72]"
            >
              <option value="CLIENT">{lang === "ar" ? "CLIENT (عميل)" : "CLIENT"}</option>
              <option value="ADMIN">{lang === "ar" ? "ADMIN (مشرف)" : "ADMIN"}</option>
            </select>
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#EBE7DF] rounded-xl">
            <div>
              <span className="block text-xs font-bold text-neutral-700">
                {lang === "ar" ? "حالة الحساب" : "Account Status"}
              </span>
              <span className="block text-[10px] text-neutral-400 mt-0.5">
                {lang === "ar"
                  ? "تفعيل أو تعطيل حساب المستخدم"
                  : "Activate or deactivate the user account"}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={modalForm.isActive}
                onChange={(e) => setModalForm({ ...modalForm, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex gap-2 justify-end pt-3 border-t border-[#FAF1EA] mt-4" dir="ltr">
            <Button variant="outline" onClick={() => setUserModalOpen(false)}>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" variant="primary" isLoading={modalSubmitting}>
              {lang === "ar" ? "حفظ الحساب" : "Save User"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Invitation Editor Overlay Modal (Admin Edit Popup) ───── */}
      {isEditorOpen && editingPurchase && (
        <div
          className="fixed inset-0 bg-[#2D3142]/45 backdrop-blur-sm z-50 overflow-y-auto p-4 flex justify-center items-start"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[32px] max-w-xl w-full p-8 shadow-2xl relative my-8 mx-auto text-neutral-800">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsEditorOpen(false);
                setEditingPurchase(null);
              }}
              className="absolute top-6 right-6 text-neutral-450 hover:text-black transition-colors cursor-pointer"
              aria-label="Close editor"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Body */}
            <InvitationEditor
              purchaseId={editingPurchase.id}
              invitation={editingPurchase.invitation}
              templateTitle={editingPurchase.template?.title || ""}
              onSaved={() => {
                setIsEditorOpen(false);
                setEditingPurchase(null);
                fetchDashboardData();
              }}
              editableFields={editingPurchase.template?.editableFields}
            />
          </div>
        </div>
      )}

      {/* Admin Tracker Modal */}
      {trackingModalInfo && (
        <AdminInvitationTracker
          slug={trackingModalInfo.slug}
          invitationId={trackingModalInfo.invitationId}
          title={trackingModalInfo.title}
          onClose={() => setTrackingModalInfo(null)}
        />
      )}
    </div>
  );
}
