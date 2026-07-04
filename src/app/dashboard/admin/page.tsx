"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Template, AuthUser } from "@/types/invitation";
import { useLanguage } from "@/components/LanguageContext";
import {
  OrdersTable,
  AddTemplateForm,
  StatsCards,
  UsersTable,
  type Order,
  type User,
} from "./_components";
import InvitationEditor from "../client/_components/InvitationEditor";

type LoadStatus = "loading" | "loaded" | "error";
type TabType = "overview" | "users" | "requests" | "templates";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();

  // Dashboard datasets
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
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
      const [ordersRes, usersRes, templatesRes] = await Promise.all([
        api.get<Order[]>("/purchase-requests"),
        api.get<User[]>("/users"),
        api.get<Template[]>("/templates"),
      ]);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setTemplates(templatesRes.data);
      setStatus("loaded");
    } catch (err) {
      console.error("Dashboard data fetching error:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Load admin user metadata
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setAdminUser(JSON.parse(stored));
        } catch {}
      }
    }
    // Fetch data
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Logout ───────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.replace("/?auth=login");
  };

  // ── Requests approval status updates ───────────────────────────────────
  const handleStatusUpdated = (
    orderId: string,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
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
          throw new Error(lang === "ar" ? "كلمة المرور مطلوبة للمستخدمين الجدد." : "Password is required for new users.");
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
      console.error(err);
      const error = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        setModalError(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setModalError(
          error.message || (lang === "ar" ? "فشل حفظ تفاصيل المستخدم." : "Failed to save user details.")
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
      console.error("Failed to toggle template activation:", err);
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
    .reduce((sum, o) => sum + parseFloat(o.template.price), 0);
  const totalUsers = users.length;
  const totalTemplates = templates.length;

  // Render Loading skeleton
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#EBE7DF] border-t-[#B89C72]" />
          <p className="text-xs text-neutral-400 font-medium">
            {lang === "ar" ? "جاري تحميل لوحة التحكم..." : "Loading dashboard details..."}
          </p>
        </div>
      </div>
    );
  }

  // Render error banner
  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] font-sans p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-md w-full shadow flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="mt-1 text-sm text-red-600 font-bold leading-normal">
            {lang === "ar"
              ? "فشل في تحميل لوحة تحكم الإدارة. يرجى التأكد من تشغيل الخادم."
              : "Failed to load Admin Panel. Make sure the backend server is running."}
          </p>
          <button
            onClick={() => {
              setStatus("loading");
              fetchDashboardData();
            }}
            className="mt-5 rounded-full bg-red-100 px-6 py-2 text-xs font-bold text-red-700 hover:bg-red-200 transition-all cursor-pointer"
          >
            {lang === "ar" ? "إعادة المحاولة" : "Retry Loading"}
          </button>
        </div>
      </div>
    );
  }

  // Navigation Links definition
  const menuItems = [
    { id: "overview" as const, labelAr: "لوحة التحكم", labelEn: "Overview" },
    { id: "users" as const, labelAr: "إدارة المستخدمين", labelEn: "Users Directory" },
    { id: "requests" as const, labelAr: "طلبات النماذج", labelEn: "Form Requests" },
    { id: "templates" as const, labelAr: "إدارة النماذج والقوالب", labelEn: "Forms & Templates" },
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
            <svg width="18" height="18" fill="none" stroke="#E5C38B" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0 text-[#E5C38B]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
              {item.id === "users" && (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              {item.id === "requests" && (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {item.id === "templates" && (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
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
            className="rounded-lg p-2 text-neutral-400 hover:bg-[#1E2E4A]/30 hover:text-white"
            aria-label="Open sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
              : lang === "ar"
              ? "إدارة القوالب"
              : "Forms & Templates"}
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
                    : lang === "ar"
                    ? "إدارة القوالب والنماذج"
                    : "Forms & Templates"}
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
                      ? "التحكم بطلبات فتح القوالب من قبل العملاء وتغيير حالتها."
                      : "Review, approve, or reject client purchase requests."
                    : lang === "ar"
                    ? "استعراض وتعديل قوالب وتصاميم بطاقات الدعوة المتاحة."
                    : "Browse, edit, and configure available invitation designs and templates."}
                </p>
              </div>

              <button
                onClick={() => {
                  setStatus("loading");
                  fetchDashboardData();
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#EBE7DF] px-3.5 py-1.5 text-[10px] font-bold text-neutral-600 shadow-xs transition-all hover:bg-neutral-50 cursor-pointer"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-neutral-500">
                  <path
                    d="M1 4v6h6M23 20v-6h-6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {lang === "ar" ? "تحديث البيانات" : "Refresh Data"}
              </button>
            </div>

            {/* Render Tab Contents */}
            <div className="space-y-6">
              {/* Overview / Stats Dashboard */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fadeIn">
                  <StatsCards
                    pendingCount={pendingCount}
                    approvedCount={approvedCount}
                    totalRevenue={totalRevenue}
                    totalUsers={totalUsers}
                    totalTemplates={totalTemplates}
                  />

                  {/* Summary Details Grid */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recent requests */}
                    <div className="lg:col-span-2 rounded-2xl border border-[#EBE7DF] bg-white p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-[#FAF1EA] pb-3">
                        <h3 className="font-serif font-bold text-neutral-800 text-xs">
                          {lang === "ar" ? "الطلبات الأخيرة" : "Recent Requests"}
                        </h3>
                        <button
                          onClick={() => setActiveTab("requests")}
                          className="text-[10px] font-bold text-[#B89C72] hover:text-[#A3875D] transition-colors"
                        >
                          {lang === "ar" ? "عرض جميع الطلبات ←" : "View All Requests →"}
                        </button>
                      </div>

                      <div className="divide-y divide-[#FAF1EA]">
                        {orders.slice(0, 3).map((o) => (
                          <div
                            key={o.id}
                            className={`py-3 flex items-center justify-between text-xs font-sans ${
                              lang === "ar" ? "text-right" : "text-left"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative h-8 w-12 shrink-0 overflow-hidden rounded border border-[#EBE7DF] bg-[#FAF8F5]">
                                <img
                                  src={o.template.previewImage}
                                  alt={o.template.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-neutral-800 leading-tight">
                                  {o.user.firstName} {o.user.lastName}
                                </p>
                                <p className="text-[10px] text-neutral-400 mt-0.5">
                                  {lang === "ar"
                                    ? `طلب قالب ${o.template.title}`
                                    : `Requested ${o.template.title}`}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                                o.status === "PENDING"
                                  ? "bg-amber-50 text-amber-600 border-amber-100"
                                  : o.status === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-red-50 text-red-600 border-red-100"
                              }`}
                            >
                              {o.status === "PENDING"
                                ? lang === "ar"
                                  ? "قيد الانتظار"
                                  : "Pending"
                                : o.status === "APPROVED"
                                ? lang === "ar"
                                  ? "مقبول"
                                  : "Approved"
                                : lang === "ar"
                                ? "مرفوض"
                                : "Rejected"}
                            </span>
                          </div>
                        ))}

                        {orders.length === 0 && (
                          <p className="text-xs text-neutral-400 py-4 text-center">
                            {lang === "ar" ? "لا توجد طلبات شراء مسجلة." : "No purchase requests have been made yet."}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick navigation panel */}
                    <div className="rounded-2xl border border-[#EBE7DF] bg-white p-5 text-neutral-800 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-neutral-800 text-xs border-b border-[#FAF1EA] pb-3">
                          {lang === "ar" ? "الوصول السريع" : "Quick Actions"}
                        </h3>
                        <div className="mt-4 space-y-2 font-sans text-xs">
                          <button
                            onClick={() => setActiveTab("templates")}
                            className={`flex w-full items-center gap-2.5 rounded-xl bg-[#FAF9F6] border border-[#EBE7DF] hover:bg-[#FAF8F5] hover:border-[#B89C72]/50 px-3.5 py-2.5 text-neutral-700 font-bold transition-all ${
                              lang === "ar" ? "text-right" : "text-left"
                            }`}
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0 text-[#B89C72]">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>{lang === "ar" ? "إضافة قالب جديد" : "Add New Template"}</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("requests")}
                            className={`flex w-full items-center gap-2.5 rounded-xl bg-[#FAF9F6] border border-[#EBE7DF] hover:bg-[#FAF8F5] hover:border-[#B89C72]/50 px-3.5 py-2.5 text-neutral-700 font-bold transition-all ${
                              lang === "ar" ? "text-right" : "text-left"
                            }`}
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0 text-[#B89C72]">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>
                              {lang === "ar"
                                ? `مراجعة ${pendingCount} طلب معلق`
                                : `Review ${pendingCount} Pending Requests`}
                            </span>
                          </button>
                          <button
                            onClick={() => setActiveTab("users")}
                            className={`flex w-full items-center gap-2.5 rounded-xl bg-[#FAF9F6] border border-[#EBE7DF] hover:bg-[#FAF8F5] hover:border-[#B89C72]/50 px-3.5 py-2.5 text-neutral-700 font-bold transition-all ${
                              lang === "ar" ? "text-right" : "text-left"
                            }`}
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0 text-[#B89C72]">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>
                              {lang === "ar"
                                ? `إدارة ${totalUsers} مستخدم نشط`
                                : `Manage ${totalUsers} Active Users`}
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[#FAF1EA] mt-4 text-[10px] text-neutral-400 leading-normal font-sans">
                        {lang === "ar"
                          ? "استخدم روابط الاختصارات أعلاه للوصول السريع لمجموعات إدارة عناصر المنصة."
                          : "Use these shortcut links to jump directly to specific control sections."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Directory tab */}
              {activeTab === "users" && (
                <div className="space-y-4 animate-fadeIn bg-white border border-[#EBE7DF] p-6 rounded-2xl shadow-xs">
                  <UsersTable
                    users={users}
                    onEditUser={openEditUserModal}
                    onAddUser={openAddUserModal}
                  />
                </div>
              )}

              {/* Requests Management tab */}
              {activeTab === "requests" && (
                <div className="space-y-4 animate-fadeIn bg-white border border-[#EBE7DF] p-6 rounded-2xl shadow-xs">
                  <OrdersTable
                    orders={orders}
                    onStatusUpdated={handleStatusUpdated}
                    onLinkStatusUpdated={handleLinkStatusUpdated}
                    onEditInvitation={(purchase) => {
                      setEditingPurchase(purchase);
                      setIsEditorOpen(true);
                    }}
                  />
                </div>
              )}

              {/* Templates Management tab */}
              {activeTab === "templates" && (
                <div className="space-y-6 animate-fadeIn">
                  {editingTemplate ? (
                    <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 sm:p-8 shadow-xs space-y-4">
                      <div className="border-b border-[#FAF1EA] pb-3 flex justify-between items-center">
                        <h3 className="font-serif font-bold text-neutral-800 text-sm">
                          {lang === "ar" ? "تعديل القالب" : "Edit Template"}: {editingTemplate.title}
                        </h3>
                        <button
                          onClick={() => setEditingTemplate(null)}
                          className="text-xs text-neutral-400 hover:text-neutral-650 cursor-pointer font-bold font-sans"
                        >
                          {lang === "ar" ? "← رجوع للقائمة" : "← Back to List"}
                        </button>
                      </div>
                      <AddTemplateForm
                        initialTemplateData={editingTemplate}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setEditingTemplate(null)}
                      />
                    </div>
                  ) : isAddingTemplate ? (
                    <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 sm:p-8 shadow-xs space-y-4">
                      <div className="border-b border-[#FAF1EA] pb-3 flex justify-between items-center">
                        <h3 className="font-serif font-bold text-neutral-800 text-sm">
                          {lang === "ar" ? "إنشاء قالب زفاف جديد" : "Create New Wedding Template"}
                        </h3>
                        <button
                          onClick={() => setIsAddingTemplate(false)}
                          className="text-xs text-neutral-400 hover:text-neutral-650 cursor-pointer font-bold font-sans"
                        >
                          {lang === "ar" ? "← رجوع للقائمة" : "← Back to List"}
                        </button>
                      </div>
                      <AddTemplateForm
                        onSuccess={handleAddSuccess}
                        onCancel={() => setIsAddingTemplate(false)}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4 bg-white border border-[#EBE7DF] p-6 rounded-2xl shadow-xs">
                      {/* Section Header */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#FAF1EA] pb-4">
                        <div>
                          <h3 className="font-serif font-bold text-neutral-800 text-sm">
                            {lang === "ar" ? "القوالب والنماذج المتاحة" : "Existing Invitation Templates"}
                          </h3>
                          <p className="text-[10px] text-neutral-450 mt-0.5">
                            {lang === "ar"
                              ? "عرض وتعديل وتفعيل أو إيقاف قوالب دعوات الزفاف المسجلة في المنصة."
                              : "View, edit, activate, or deactivate invitation templates registered on the platform."}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsAddingTemplate(true)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0B1528] px-4 py-2.5 text-xs font-bold text-[#E5C38B] hover:bg-[#1E2E4A] transition-all cursor-pointer shadow-sm"
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>{lang === "ar" ? "إضافة قالب جديد" : "Add New Template"}</span>
                        </button>
                      </div>

                      {/* Template Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                        {templates.map((tpl) => (
                          <div
                            key={tpl.id}
                            className="rounded-xl border border-[#EBE7DF] bg-[#FAF8F5]/30 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-300"
                          >
                            {/* Image Preview & Badges */}
                            <div className="relative aspect-video bg-neutral-100 overflow-hidden border-b border-[#EBE7DF]">
                              <img
                                src={tpl.previewImage}
                                alt={tpl.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                              />
                              <div className="absolute top-2.5 inset-x-2.5 flex justify-between items-center">
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
                                <h4 className="font-bold text-neutral-850 truncate">{tpl.title}</h4>
                                <p className="text-[10px] text-neutral-450 mt-1 line-clamp-2 leading-relaxed">
                                  {tpl.description}
                                </p>
                              </div>

                              <div className="flex justify-between items-center border-t border-[#FAF1EA] pt-3 mt-auto">
                                <span className="font-bold text-neutral-800">{tpl.price} SAR</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingTemplate(tpl)}
                                    className="px-2.5 py-1.5 rounded-lg border border-[#EBE7DF] bg-white text-neutral-600 font-bold hover:bg-neutral-50 cursor-pointer"
                                  >
                                    {lang === "ar" ? "تعديل" : "Edit"}
                                  </button>
                                  <button
                                    onClick={() => handleToggleTemplateActivation(tpl.id, tpl.isActive)}
                                    className={`px-2.5 py-1.5 rounded-lg border font-bold cursor-pointer transition-all ${
                                      tpl.isActive
                                        ? "border-rose-200 text-rose-600 bg-rose-50/20 hover:bg-rose-50"
                                        : "border-emerald-200 text-emerald-600 bg-emerald-50/20 hover:bg-emerald-50"
                                    }`}
                                  >
                                    {tpl.isActive
                                      ? lang === "ar"
                                        ? "تعطيل"
                                        : "Deactivate"
                                      : lang === "ar"
                                      ? "تفعيل"
                                      : "Activate"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {templates.length === 0 && (
                          <div className="col-span-full p-12 text-center bg-[#FAF9F6]/50 flex flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-3">
                              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="mt-1 text-xs text-neutral-400">
                              {lang === "ar" ? "لا توجد قوالب زفاف مضافة بعد." : "No templates added yet."}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── User Add/Edit Popup Modal overlay ──────────────────── */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-[#EBE7DF] rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 text-neutral-800">
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
              <button
                onClick={() => setUserModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-sans"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4 font-sans text-xs">
              {modalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-[11px] text-red-600 font-medium">
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
                    className="w-full bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#B89C72]"
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
                    className="w-full bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#B89C72]"
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
                  className="w-full bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#B89C72]"
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
                  className="w-full bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#B89C72]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  {lang === "ar" ? "كلمة المرور" : "Password"}{" "}
                  {!editingUser ? "*" : `(${lang === "ar" ? "اتركه فارغاً للاحتفاظ بالحالي" : "leave empty to keep current"})`}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={modalForm.password}
                  onChange={(e) => setModalForm({ ...modalForm, password: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-[#B89C72]"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  {lang === "ar" ? "الصلاحية / الدور" : "Role"} *
                </label>
                <select
                  value={modalForm.role}
                  onChange={(e) => setModalForm({ ...modalForm, role: e.target.value as "ADMIN" | "CLIENT" })}
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
              <div className="flex gap-2 justify-end pt-3 border-t border-[#FAF1EA] mt-4">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 border border-[#EBE7DF] bg-white rounded-lg hover:bg-neutral-50 text-neutral-600 transition-all font-bold cursor-pointer"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 bg-[#0B1528] text-[#E5C38B] rounded-lg hover:bg-[#1E2E4A] font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <>
                      <div className="w-3 h-3 rounded-full border border-[#E5C38B]/30 border-t-[#E5C38B] animate-spin"></div>
                      {lang === "ar" ? "جاري الحفظ..." : "Saving..."}
                    </>
                  ) : lang === "ar" ? (
                    "حفظ الحساب"
                  ) : (
                    "Save User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Invitation Editor Overlay Modal (Admin Edit Popup) ───── */}
      {isEditorOpen && editingPurchase && (
        <div className="fixed inset-0 bg-[#2D3142]/45 backdrop-blur-sm z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[32px] max-w-xl w-full p-8 shadow-2xl relative my-8 mx-auto text-neutral-800">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsEditorOpen(false);
                setEditingPurchase(null);
              }}
              className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
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
                fetchDashboardData(); // Refresh admin dashboard tables
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
