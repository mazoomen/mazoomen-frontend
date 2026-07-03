"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Template } from "@/types/invitation";
import PageLayout from "@/components/PageLayout";
import AuthModal from "@/components/AuthModal";
import { useLanguage } from "@/components/LanguageContext";

// ── MOCK TEMPLATES CATALOG (Matches the user design exactly) ─────────
const MOCK_TEMPLATES: Template[] = [];

export default function Home() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Popup Modal Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Details Modal Alert State
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  // Redesign filter and category states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"all" | "ready">("all");
  const [showEventTypesOverlay, setShowEventTypesOverlay] = useState(false);

  // Checkout modal states
  const [buyingTemplate, setBuyingTemplate] = useState<Template | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    // Check if token exists
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        setTimeout(() => {
          setIsLoggedIn(true);
        }, 0);
      }
    }

    async function fetchTemplates() {
      try {
        setLoading(true);
        const res = await api.get("/templates");
        if (res.data && res.data.length > 0) {
          const apiTemplates = res.data.map((t: Template) => ({
            ...t,
            price: parseFloat(t.price.toString()),
          }));
          setTemplates(apiTemplates);
        } else {
          setTemplates([]);
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  useEffect(() => {
    if (buyingTemplate && typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setContactEmail(user.email || "");
          setContactPhone(user.phoneNumber || "");
        } catch (e) {
          console.error(e);
        }
      }
      setCheckoutSuccess(false);
      setCheckoutError("");
    }
  }, [buyingTemplate]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingTemplate) return;

    setCheckoutSubmitting(true);
    setCheckoutError("");
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      let email = "user@example.com";
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          email = user.email || "user@example.com";
        } catch {}
      }

      await api.post("/purchase-requests", {
        templateId: buyingTemplate.id,
        contactEmail: email,
        contactPhone: contactPhone.trim()
      });
      setCheckoutSuccess(true);
      setTimeout(() => {
        setBuyingTemplate(null);
        router.push("/dashboard/client/orders");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setCheckoutError(
        err.response?.data?.message ||
        (lang === "ar" ? "فشل تقديم طلب الشراء. يرجى المحاولة مرة أخرى." : "Failed to submit purchase request. Please try again.")
      );
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleAction = (actionName: string, templateTitle: string) => {
    const actionTranslated = actionName === "Download" || actionName === "تنزيل" ? t("تنزيل") : t("تعديل");
    const titleTranslated = t(templateTitle);
    if (lang === "ar") {
      setModalMessage(
        `لقد اخترت "${actionTranslated}" للقالب "${titleTranslated}". ستتصل هذه الصفحة بصفحة التخصيص والشراء قريباً.`
      );
    } else {
      setModalMessage(
        `You selected "${actionTranslated}" for "${titleTranslated}". This page will connect to customize/purchase pages shortly.`
      );
    }
  };

  const filteredTemplates = templates.filter((template) => {
    // Search text query
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category selection
    const matchesCategory = selectedCategory ? template.category === selectedCategory : true;

    // Tab selection (Mockup Tab Filter: 'الكل' or 'جاهزة للتعديل')
    // 'ready' corresponds to non-premium (standard) templates, 'all' is all
    const matchesTab = selectedTab === "ready" ? !template.isPremium : true;

    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <PageLayout>

      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 pt-8 pb-4">
        <div
          className="max-w-[1700px] mx-auto rounded-[32px] border border-[#1E2E4A] p-12 sm:p-16 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[460px] bg-cover bg-center shadow-lg"
          style={{ backgroundImage: "url('/images/hero-couple.jpg')" }}
        >
          {/* Dark Navy overlay to make text pop */}
          <div className="absolute inset-0 bg-[#0B1528]/70 backdrop-blur-[0.5px] pointer-events-none"></div>

          {/* Center Brand content (Mockup Style Navy and Gold text) */}
          <div className="max-w-2xl flex flex-col items-center gap-5 z-20">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] tracking-[0.3em] text-[#E5C38B] font-bold uppercase font-sans">
                {t("DIGITAL WEDDING PLANNER")}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-wide text-[#E5C38B] drop-shadow-md select-none mt-2">
                {t("DIGITAL WEDDING PLANNER")}
              </h1>
              <p className="text-[11px] sm:text-xs text-neutral-300 font-sans tracking-wide max-w-md mx-auto leading-relaxed mt-3">
                {t("A romantic design performs and wedded wedding template with elegant anniversaries.")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center justify-center mt-3">
              <button
                onClick={() => {
                  const el = document.getElementById("templates");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-2.5 border border-[#E5C38B] text-[#E5C38B] hover:bg-[#E5C38B]/10 rounded-full text-[11px] font-semibold transition-all cursor-pointer"
              >
                {t("Explore Now")}
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setIsAuthOpen(true);
                }}
                className="px-6 py-2.5 bg-[#E5C38B] hover:bg-[#D4B27A] text-black rounded-full text-[11px] font-semibold transition-all cursor-pointer shadow-md"
              >
                {t("Register Now")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH BAR & CATEGORIES OVERLAY ─────────────────────────── */}
      <section className="px-6 sm:px-10 py-4 sticky top-20 bg-[#FAF9F6] z-30">
        <div className="max-w-xl mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={t("Search templates...")}
              value={searchQuery}
              onFocus={() => setShowEventTypesOverlay(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-10 py-2.5 bg-white border border-[#E6E2DA] rounded-full text-xs shadow-sm focus:outline-none focus:border-[#B89C72] focus:ring-1 focus:ring-[#B89C72] transition-all ${lang === "ar" ? "text-right" : "text-left"}`}
              dir={lang === "ar" ? "rtl" : "ltr"}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-[#7F8487]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Event Types Dropdown Button */}
            <button
              onClick={() => setShowEventTypesOverlay(!showEventTypesOverlay)}
              className="absolute left-3 w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E6E2DA] flex items-center justify-center text-xs text-[#7F8487] hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
              title="Event Types"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          </div>

          {/* "Event Types" Dropdown Card Overlay */}
          {showEventTypesOverlay && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowEventTypesOverlay(false)}></div>
              <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[340px] sm:w-[420px] bg-white border border-[#E6E2DA] rounded-2xl shadow-xl p-5 z-50 animate-fadeIn text-right font-sans" dir={lang === "ar" ? "rtl" : "ltr"}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-neutral-800">Event Types</span>
                  <button
                    onClick={() => setShowEventTypesOverlay(false)}
                    className="text-neutral-400 hover:text-black text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      name: "Weddings", arName: "Weddings", icon: (
                        <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      )
                    },
                    {
                      name: "Bridal Showers", arName: "Bridal Showers", icon: (
                        <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096m.813 5.096a9 9 0 0113.626-9.878m-13.626 9.878a9 9 0 1113.626-9.878" />
                        </svg>
                      )
                    },
                    {
                      name: "Engagement Parties", arName: "Engagement Parties", icon: (
                        <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <circle cx="12" cy="14" r="5" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8V4m0 0l2 2m-2-2L10 6" />
                        </svg>
                      )
                    },
                    {
                      name: "Anniversaries", arName: "Anniversaries", icon: (
                        <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                        </svg>
                      )
                    },
                    {
                      name: "Birthdays", arName: "Birthdays", icon: (
                        <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697-.056-4.024-.166C6.845 7.99 6 7.086 6 6V4.875C6 3.839 6.84 3 7.875 3h8.25c1.035 0 1.875.84 1.875 1.875V6c0 1.086-.845 1.99-1.976 2.084A41.748 41.748 0 0112 8.25zM12 8.25c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.414 18 10.5v.18c0 .907-.638 1.678-1.528 1.86A41.87 41.87 0 0112 12.75a41.87 41.87 0 01-4.472-.21c-.89-.182-1.528-.953-1.528-1.86v-.18c0-1.086.845-1.99 1.976-2.084A41.748 41.748 0 0112 8.25zm0 4.5c1.355 0 2.697.056 4.024.166C17.155 13.01 18 13.914 18 15v4.5A2.25 2.25 0 0115.75 21.75H8.25A2.25 2.25 0 016 19.5V15c0-1.086.845-1.99 1.976-2.084A41.748 41.748 0 0112 12.75z" />
                        </svg>
                      )
                    },
                    {
                      name: "Corporate Events", arName: "Corporate Events", icon: (
                        <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8v-1.661c0-.53-.222-1.03-.618-1.386l-1.382-1.244a2.25 2.25 0 00-1.508-.567H14.25m0 0V4.5A2.25 2.25 0 0012 2.25h-.75a2.25 2.25 0 00-2.25 2.25v2.25M9 6.75H5.25a2.25 2.25 0 00-1.508.567L2.36 8.56A2.25 2.25 0 001.74 9.95v1.661c0 .6.28 1.161.75 1.549M9 6.75h6" />
                        </svg>
                      )
                    }
                  ].map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setSelectedCategory(selectedCategory === cat.name ? null : cat.name);
                        setShowEventTypesOverlay(false);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-3 border rounded-xl hover:bg-neutral-50 transition-all cursor-pointer ${selectedCategory === cat.name
                        ? "border-[#B89C72] bg-[#FAF8F5] font-semibold text-black"
                        : "border-neutral-200 text-neutral-600 bg-white"
                        }`}
                    >
                      {cat.icon}
                      <span className="text-[10px] whitespace-nowrap">{t(cat.name)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── TEMPLATES GRID SECTION ──────────────────────────────────── */}
      <section id="templates" className="px-6 sm:px-10 py-6 max-w-[1700px] mx-auto w-full flex-1">
        <div className="w-full flex flex-col gap-6">

          {/* Tab Selector & Header */}
          <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3" dir={lang === "ar" ? "rtl" : "ltr"}>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTab("all")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${selectedTab === "all"
                  ? "bg-[#0B1528] text-[#E5C38B] border border-[#1E2E4A]"
                  : "bg-[#FAF8F5] text-[#7F8487] border border-[#EBE7DF] hover:bg-neutral-50"
                  }`}
              >
                {t("الكل")}
              </button>
              <button
                onClick={() => setSelectedTab("ready")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${selectedTab === "ready"
                  ? "bg-[#0B1528] text-[#E5C38B] border border-[#1E2E4A]"
                  : "bg-[#FAF8F5] text-[#7F8487] border border-[#EBE7DF] hover:bg-neutral-50"
                  }`}
              >
                {t("جاهزة للتعديل")}
              </button>
            </div>
            {selectedCategory && (
              <span className="text-[11px] text-[#B89C72] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#EBE7DF] font-semibold">
                {t("Category")}: {t(selectedCategory)}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-[#F4F1EA] border-t-black animate-spin"></div>
              <p className="text-xs text-[#7F8487] font-medium">{t("Loading templates...")}</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#EBE7DF] rounded-2xl">
              <p className="text-[#7F8487] font-medium text-xs">{t("لا توجد قوالب تطابق خيارات البحث.")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <article
                  key={template.id}
                  className="bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  {/* Premium Badge */}
                  {template.isPremium && (
                    <span className="absolute top-4 left-4 bg-neutral-800 text-white text-[9px] font-bold px-2 py-0.5 rounded z-10 tracking-wider shadow-sm uppercase">
                      Premium
                    </span>
                  )}

                  {/* Template Image Section */}
                  <div className="w-full aspect-[4/3.2] bg-[#FAF8F5] p-3 flex items-center justify-center overflow-hidden shrink-0 border-b border-[#F0ECE3]">
                    <div className="w-full h-full rounded-lg overflow-hidden shadow-sm relative">
                      <img
                        src={template.previewImage}
                        alt={t(template.title)}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-all duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Template Details */}
                  <div className={`p-4 flex-1 flex flex-col justify-between gap-3 font-sans ${lang === "ar" ? "text-right" : "text-left"}`} dir={lang === "ar" ? "rtl" : "ltr"}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-neutral-800 text-[13px] leading-tight group-hover:text-black transition-colors line-clamp-1">
                          {template.title}
                        </h3>
                        <span className="text-[11px] font-bold text-neutral-600 border border-neutral-200 px-1.5 py-0.5 rounded bg-[#FAF9F6] shrink-0 font-sans">
                          {typeof template.price === 'number' ? `$${template.price}` : template.price}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                        {t(template.description)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!isLoggedIn) {
                              setAuthMode("login");
                              setIsAuthOpen(true);
                              return;
                            }
                            setBuyingTemplate(template);
                          }}
                          className="flex-1 py-2 text-[11px] font-semibold text-black bg-[#E5C38B] hover:bg-[#D4B27A] rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          {t("شراء")}
                        </button>
                        <button
                          onClick={() => {
                            if (template.demoLink) {
                              window.open(template.demoLink, "_blank");
                            } else {
                              alert(lang === "ar" ? "لا تتوفر معاينة لهذا القالب حالياً." : "No demo link available for this template.");
                            }
                          }}
                          className="flex-1 py-2 text-[11px] font-semibold border border-[#E5C38B] text-[#B89C72] bg-white/40 hover:bg-[#E5C38B]/10 rounded-xl transition-all cursor-pointer"
                        >
                          {t("معاينة")}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ───────────────────────────────────── */}
      <section id="features" className="px-6 sm:px-10 py-16 bg-white border-t border-b border-[#E6E2DA]">
        <div className="max-w-[1700px] mx-auto flex flex-col gap-10">
          <div className="text-center flex flex-col gap-1.5">
            <h2 className="text-2xl font-serif font-medium text-neutral-800">{t("How It Works")}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
            {/* Couple Illustration */}
            <div className="flex justify-center items-center bg-[#FAF8F5] border border-[#E9E4DC] rounded-3xl p-6 shadow-sm h-48 w-full max-w-[240px] mx-auto lg:mx-0 shrink-0">
              <svg className="w-32 h-32 text-[#B89C72]" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="45" fill="#F4EDE1" />
                <path d="M60 48C60 48 57 41 50 41C44 41 40 45 40 51C40 59 60 70 60 70C60 70 80 59 80 51C80 45 76 41 70 41C63 41 60 48 60 48Z" fill="#E8DCC4" />
                <path d="M48 90C48 78 54 74 60 74C66 74 72 78 72 90" stroke="#5C4D37" strokeWidth="3" strokeLinecap="round" />
                <circle cx="60" cy="65" r="5" fill="#5C4D37" />
                <path d="M25 80C30 75 35 78 37 85" stroke="#B89C72" strokeWidth="2" strokeLinecap="round" />
                <circle cx="37" cy="85" r="2" fill="#B89C72" />
                <path d="M95 80C90 75 85 78 83 85" stroke="#B89C72" strokeWidth="2" strokeLinecap="round" />
                <circle cx="83" cy="85" r="2" fill="#B89C72" />
              </svg>
            </div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <h3 className="font-sans font-bold text-sm text-neutral-800">{t("Select a Design")}</h3>
              <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">
                {t("Curate your design layout by browsing and selecting from our premium template gallery.")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </div>
              <h3 className="font-sans font-bold text-sm text-neutral-800">{t("Customize Online")}</h3>
              <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">
                {t("Customize details like date, coordinates, texts, and music instantly on your dashboard.")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <h3 className="font-sans font-bold text-sm text-neutral-800">{t("Download & Share")}</h3>
              <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">
                {t("Download your invitation image or share the interactive guest link for online RSVP tracking.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ───────────────────────────────────── */}
      <section id="pricing" className="px-6 sm:px-10 py-16 bg-white border-t border-[#E6E2DA]">
        <div className="max-w-[1700px] mx-auto flex flex-col gap-10 relative">
          <div className="text-center flex flex-col gap-1">
            <h2 className="text-[26px] font-serif font-medium text-neutral-800">{t("Testimonials")}</h2>
          </div>

          <div className="relative w-full">
            {/* testimonial grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pr-12">
              {/* Review 1 */}
              <div className="bg-white border border-[#E9E4DC] p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all">
                <p className="text-[12px] italic text-[#7F8487] leading-relaxed">
                  {t("The botanical templates are exceptionally elegant. The guest response tracker made coordinating RSVPs for our wedding completely stress-free.")}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#EBE7DF] overflow-hidden flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-neutral-600">AR</span>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-[#2D3142]">{t("Ahmed Al-Rashid")}</h4>
                    <span className="text-[10px] text-[#7F8487] block -mt-0.5">{t("Wedding Host")}</span>
                  </div>
                </div>
              </div>

              {/* Review 2 */}
              <div className="bg-white border border-[#E9E4DC] p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all">
                <p className="text-[12px] italic text-[#7F8487] leading-relaxed">
                  {t("So beautiful and extremely simple to customize. Approved in minutes, editable fields work like magic. The audio music player option was a massive hit!")}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#EBE7DF] overflow-hidden flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-neutral-600">SA</span>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-[#2D3142]">{t("Sarah Al-Mansoori")}</h4>
                    <span className="text-[10px] text-[#7F8487] block -mt-0.5">{t("Bridal Shower Host")}</span>
                  </div>
                </div>
              </div>

              {/* Review 3 */}
              <div className="bg-white border border-[#E9E4DC] p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all">
                <p className="text-[12px] italic text-[#7F8487] leading-relaxed">
                  {t("The guest RSVP count feature was incredibly helpful. I could see the exact counts and companion details live. Saved hours of phone calls!")}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#EBE7DF] overflow-hidden flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-neutral-600">KB</span>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-[#2D3142]">{t("Khalid Bashir")}</h4>
                    <span className="text-[10px] text-[#7F8487] block -mt-0.5">{t("Anniversary Host")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right navigation arrow */}
            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-[#E9E4DC] shadow-sm flex items-center justify-center hover:bg-neutral-50 hover:shadow transition-all shrink-0">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Pagination dots */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D3142] transition-all"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-400 cursor-pointer"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-400 cursor-pointer"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-400 cursor-pointer"></span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="bg-[#FAF8F5] border-t border-[#E6E2DA] px-6 sm:px-10 py-16 mt-auto">
        <div className="max-w-[1700px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-xs mb-12">
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-neutral-800 text-[13px] tracking-wide uppercase">Explore</h4>
            <nav className="flex flex-col gap-2.5 text-neutral-500 font-medium">
              <a href="#" className="hover:text-black transition-colors">Home</a>
              <a href="#" className="hover:text-black transition-colors">Rights</a>
              <a href="#" className="hover:text-black transition-colors">Categories</a>
              <a href="#" className="hover:text-black transition-colors">Legal</a>
              <a href="#" className="hover:text-black transition-colors">Resources</a>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-neutral-800 text-[13px] tracking-wide uppercase">Account</h4>
            <nav className="flex flex-col gap-2.5 text-neutral-500 font-medium">
              <a href="#" onClick={(e) => { e.preventDefault(); if (!isLoggedIn) { setAuthMode("login"); setIsAuthOpen(true); } }} className="hover:text-black transition-colors">About</a>
              <a href="#" onClick={(e) => { e.preventDefault(); if (!isLoggedIn) { setAuthMode("login"); setIsAuthOpen(true); } }} className="hover:text-black transition-colors">Account</a>
              <a href="#" className="hover:text-black transition-colors">Pricing</a>
              <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-neutral-800 text-[13px] tracking-wide uppercase">Support</h4>
            <nav className="flex flex-col gap-2.5 text-neutral-500 font-medium">
              <a href="#" className="hover:text-black transition-colors">Contact Us</a>
              <a href="#" className="hover:text-black transition-colors">Support</a>
              <a href="#" className="hover:text-black transition-colors">Saved Drafts</a>
              <a href="#" className="hover:text-black transition-colors">Events & Flyers</a>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-neutral-800 text-[13px] tracking-wide uppercase">Legal</h4>
            <div className="flex items-center gap-3 mt-1">
              {/* Social icons */}
              <a href="#" className="w-7 h-7 rounded-full bg-neutral-200 hover:bg-black hover:text-white transition-all flex items-center justify-center text-neutral-600 shadow-sm">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-neutral-200 hover:bg-black hover:text-white transition-all flex items-center justify-center text-neutral-600 shadow-sm">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-neutral-200 hover:bg-black hover:text-white transition-all flex items-center justify-center text-neutral-600 shadow-sm">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-neutral-200 hover:bg-black hover:text-white transition-all flex items-center justify-center text-neutral-600 shadow-sm">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.091.377-.293 1.195-.332 1.357-.052.211-.172.256-.396.152-1.479-.688-2.405-2.847-2.405-4.582 0-3.731 2.712-7.16 7.82-7.16 4.104 0 7.293 2.925 7.293 6.833 0 4.077-2.571 7.358-6.139 7.358-1.2 0-2.33-.624-2.716-1.361l-.74 2.82c-.267 1.029-1.001 2.322-1.492 3.125 1.124.347 2.317.534 3.551.534 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-[1700px] mx-auto pt-8 border-t border-[#E6E2DA] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-neutral-400 font-medium">
          <p>&copy; Copyright - 2023 Mazoom. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      {/* ── MODAL INTERACTION WARNING ────────────────────────────────── */}
      {modalMessage && (
        <div className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E2DA] rounded-2xl max-w-sm w-full p-6 shadow-xl flex flex-col gap-4 text-center">
            <h3 className="font-bold text-sm text-[#2D3142]">Action Triggered</h3>
            <p className="text-xs text-[#7F8487] leading-relaxed">{modalMessage}</p>
            <button
              onClick={() => setModalMessage(null)}
              className="w-full py-2 bg-[#B89C72] hover:bg-[#A3875D] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* ── PURCHASE / CHECKOUT MODAL ────────────────────────────────── */}
      {buyingTemplate && (
        <div className="fixed inset-0 bg-[#0B1528]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] border border-[#E6E2DA] rounded-[24px] max-w-md w-full p-8 shadow-2xl relative text-right font-sans" dir="rtl">
            <button
              onClick={() => setBuyingTemplate(null)}
              className="absolute top-5 left-5 text-gray-400 hover:text-black transition-colors text-sm font-semibold cursor-pointer"
            >
              ✕
            </button>

            {checkoutSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center text-emerald-600">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-neutral-800">{lang === "ar" ? "تم تقديم طلبك بنجاح!" : "Order Submitted Successfully!"}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {lang === "ar"
                    ? "لقد تم تسجيل طلب الشراء للقالب بنجاح. سيقوم المسؤول بمراجعته وتفعيله لك قريباً."
                    : "Your template purchase request has been submitted. The administrator will review and activate it shortly."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                <div>
                  <span className="text-[10px] tracking-widest text-[#B89C72] font-bold uppercase">{lang === "ar" ? "شراء قالب" : "BUY TEMPLATE"}</span>
                  <h3 className="text-xl font-serif font-medium text-neutral-800 mt-1">{buyingTemplate.title}</h3>
                  <p className="text-xs text-neutral-400 mt-2">{buyingTemplate.description}</p>
                </div>

                <div className="h-px bg-[#EBE7DF]" />

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">{lang === "ar" ? "رقم الجوال للتواصل" : "Contact Phone"}</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+966500000000"
                      className="w-full px-4 py-2.5 bg-white border border-[#E6E2DA] rounded-xl text-xs focus:outline-none focus:border-[#B89C72] text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                {checkoutError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg text-center">
                    {checkoutError}
                  </p>
                )}

                <div className="flex justify-between items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block">{lang === "ar" ? "الإجمالي" : "Total Price"}</span>
                    <span className="text-base font-bold text-neutral-800">${buyingTemplate.price}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={checkoutSubmitting}
                    className="flex-1 py-3 text-xs font-semibold text-black bg-[#E5C38B] hover:bg-[#D4B27A] rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {checkoutSubmitting
                      ? (lang === "ar" ? "جاري الإرسال..." : "Submitting...")
                      : (lang === "ar" ? "تأكيد طلب الشراء" : "Confirm Purchase")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
