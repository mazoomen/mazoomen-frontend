"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Template } from "@/types/invitation";

// ── MOCK TEMPLATES CATALOG (Matches the user design exactly) ─────────
const MOCK_TEMPLATES: Template[] = [
  {
    id: "mock-1",
    title: "Elegant Botanical Wedding",
    description: "Curated collection of soft green leaves, eucalyptus framing, and hand-drawn gold accents. Perfect for romantic, natural wedding styles.",
    previewImage: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    title: "Modern Geometric Birthday",
    description: "Clean modern triangles and copper polygons styled with a bold dark text layer. Fits all contemporary birthday theme configurations.",
    previewImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80",
    price: 100,
    editableFields: {},
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-3",
    title: "Modern Geometric Birthday",
    description: "Premium gold-trimmed edition of the modern geometric series, adding smooth marble background gradients and customized typography blocks.",
    previewImage: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-4",
    title: "Classic Graduation Announcement",
    description: "Formally styled academic design with cap borders, gold tassels, and editable slots for graduates, majors, and honors lists.",
    previewImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    price: 120,
    editableFields: {},
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-5",
    title: "Floral Baby Shower Invite",
    description: "Gentle baby pastel theme with watercolor flower bouquets and cursive title texts. Warm, elegant invite for hosting baby showers.",
    previewImage: "https://images.unsplash.com/photo-1519689680058-324335c77ebe?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-6",
    title: "Modern Geometric Birthday",
    description: "Vibrant party design with high-quality colorful particles and festive card textures. Great for kids and adult milestone birthdays.",
    previewImage: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=600&auto=format&fit=crop&q=80",
    price: 100,
    editableFields: {},
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-7",
    title: "Minimalist Corporate Event",
    description: "Sleek slate-grey layouts with precise timing blocks, location links, and maps. Built for panels, keynotes, and product releases.",
    previewImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
    price: 120,
    editableFields: {},
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-8",
    title: "Minimalist Corporate Event",
    description: "Premium edition of our corporate event invitation, styled with dark charcoal layers, executive gold borders, and live coordinates.",
    previewImage: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-9",
    title: "Minimalist Corporate Event",
    description: "Clean modern design for startup meetups, networking dinners, and casual corporate socials. Fully responsive sections.",
    previewImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80",
    price: 120,
    editableFields: {},
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-10",
    title: "Floral Geometric Event",
    description: "Delightful gold geometry merged with elegant rose and leaf watercolor motifs. Multipurpose template for weddings or socials.",
    previewImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    price: 100,
    editableFields: {},
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-11",
    title: "Classic Graduation Announcement",
    description: "Luxury graduation card with full photo backing, custom text letter blocks, and executive border frames.",
    previewImage: "https://images.unsplash.com/photo-1532649538693-f3a2ec1bf8bd?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-12",
    title: "Minimalist Corporate Event",
    description: "Executive-tier invitation with high-end dark backgrounds and minimalist layout. Perfect for Board of Directors and AGM meetings.",
    previewImage: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-13",
    title: "Minimalist Corporate Event",
    description: "Executive-tier invitation with high-end dark backgrounds and minimalist layout. Perfect for Board of Directors and AGM meetings.",
    previewImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-14",
    title: "Minimalist Corporate Event",
    description: "Sleek slate-grey layouts with precise timing blocks, location links, and maps. Built for panels, keynotes, and product releases.",
    previewImage: "https://images.unsplash.com/photo-1505232458627-a7272658b19a?w=600&auto=format&fit=crop&q=80",
    price: 120,
    editableFields: {},
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-15",
    title: "Minimalist Corporate Event",
    description: "Premium edition of our corporate event invitation, styled with dark charcoal layers, executive gold borders, and live coordinates.",
    previewImage: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-16",
    title: "Floral Geometric Event",
    description: "Delightful gold geometry merged with elegant rose and leaf watercolor motifs. Multipurpose template for weddings or socials.",
    previewImage: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop&q=80",
    price: 100,
    editableFields: {},
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-17",
    title: "Classic Graduation Announcement",
    description: "Luxury graduation card with full photo backing, custom text letter blocks, and executive border frames.",
    previewImage: "https://images.unsplash.com/photo-1531058020387-3be344559be6?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-18",
    title: "Minimalist Corporate Event",
    description: "Executive-tier invitation with high-end dark backgrounds and minimalist layout. Perfect for Board of Directors and AGM meetings.",
    previewImage: "https://images.unsplash.com/photo-1522682756864-7a1b007e86e5?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-19",
    title: "Minimalist Corporate Event",
    description: "Sleek slate-grey layouts with precise timing blocks, location links, and maps. Built for panels, keynotes, and product releases.",
    previewImage: "https://images.unsplash.com/photo-1519225495810-7512c696505a?w=600&auto=format&fit=crop&q=80",
    price: 120,
    editableFields: {},
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-20",
    title: "Minimalist Corporate Event",
    description: "Premium edition of our corporate event invitation, styled with dark charcoal layers, executive gold borders, and live coordinates.",
    previewImage: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-21",
    title: "Minimalist Corporate Event",
    description: "Clean modern design for startup meetups, networking dinners, and casual corporate socials. Fully responsive sections.",
    previewImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&auto=format&fit=crop&q=80",
    price: 120,
    editableFields: {},
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-22",
    title: "Floral Geometric Event",
    description: "Delightful gold geometry merged with elegant rose and leaf watercolor motifs. Multipurpose template for weddings or socials.",
    previewImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
    price: 100,
    editableFields: {},
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-23",
    title: "Classic Graduation Announcement",
    description: "Luxury graduation card with full photo backing, custom text letter blocks, and executive border frames.",
    previewImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-24",
    title: "Minimalist Corporate Event",
    description: "Executive-tier invitation with high-end dark backgrounds and minimalist layout. Perfect for Board of Directors and AGM meetings.",
    previewImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&auto=format&fit=crop&q=80",
    price: 150,
    editableFields: {},
    isPremium: true,
    createdAt: new Date().toISOString(),
  }
];

export default function Home() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);

  // Popup Modal Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register inputs
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Details Modal Alert State
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        setIsLoggedIn(true);
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUser({
            name: payload.email.split("@")[0].toUpperCase(),
            role: payload.role,
            email: payload.email,
          });
        } catch {
          // Ignore decode errors
        }
      }
    }

    async function fetchTemplates() {
      try {
        setLoading(true);
        const res = await api.get("/templates");
        if (res.data && res.data.length > 0) {
          // Merge API templates with mock templates to ensure full grid matches image
          const apiTemplates = res.data.map((t: any) => ({
            ...t,
            price: parseFloat(t.price.toString()),
          }));
          setTemplates([...apiTemplates, ...MOCK_TEMPLATES]);
        } else {
          setTemplates(MOCK_TEMPLATES);
        }
        setError(null);
      } catch (err: any) {
        console.error("Error fetching templates:", err);
        // Fallback gracefully to mocks if API server is not up, keeping home page intact
        setTemplates(MOCK_TEMPLATES);
        setError(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    window.location.reload();
  };

  const handleAction = (actionName: string, templateTitle: string) => {
    setModalMessage(
      `You selected "${actionName}" for "${templateTitle}". This page will connect to customize/purchase pages shortly.`
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError("Please fill in all fields.");
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await api.post("/auth/login", {
        email: loginEmail.trim(),
        password: loginPassword,
      });

      const { accessToken, user: loggedUser } = res.data;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      // Redirect based on role
      window.location.href = loggedUser.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/client";
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAuthError("Invalid email or password. Please try again.");
      } else if (err.response?.data?.message) {
        setAuthError(err.response.data.message);
      } else {
        setAuthError("Something went wrong. Please try again later.");
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setAuthError("All fields are required.");
      return;
    }

    if (regPassword.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await api.post("/auth/register", {
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phoneNumber: regPhone.trim(),
      });

      const { accessToken, user: loggedUser } = res.data;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      // Redirect to client dashboard (registered users default to CLIENT)
      window.location.href = "/dashboard/client";
    } catch (err: any) {
      if (err.response?.data?.message) {
        const msg = err.response.data.message;
        setAuthError(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setAuthError("Registration failed. Please try again.");
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] text-[#2D3142] font-sans antialiased">
      {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
      <aside className="w-[72px] bg-white border-r border-[#E6E2DA] flex flex-col items-center py-6 gap-8 justify-between shrink-0 sticky top-0 h-screen hidden sm:flex">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Logo / Brand Icon */}
          <div className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm">
            <span className="font-serif font-semibold text-lg text-black">I</span>
          </div>

          {/* Sidebar Nav Icons */}
          <nav className="flex flex-col items-center gap-6 w-full">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-black bg-[#F5F2EB] transition-all group relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <span className="absolute left-14 bg-[#2D3142] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow z-50">Marketplace</span>
            </button>

            <button
              onClick={() => {
                if (isLoggedIn) {
                  window.location.href = "/profile";
                } else {
                  setAuthMode("login");
                  setIsAuthOpen(true);
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#7F8487] hover:text-black hover:bg-neutral-100 transition-all group relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="absolute left-14 bg-[#2D3142] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow z-50">My Profile</span>
            </button>

            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#7F8487] hover:text-black hover:bg-neutral-100 transition-all group relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span className="absolute left-14 bg-[#2D3142] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow z-50">Tickets</span>
            </button>

            <button
              onClick={() => {
                if (isLoggedIn) {
                  window.location.href = user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/client";
                } else {
                  setAuthMode("login");
                  setIsAuthOpen(true);
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#7F8487] hover:text-black hover:bg-neutral-100 transition-all group relative cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute left-14 bg-[#2D3142] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow z-50">My Purchases</span>
            </button>
          </nav>
        </div>

        {/* Bottom Settings Icon */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#7F8487] hover:text-black hover:bg-neutral-100 transition-all group relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="absolute left-14 bg-[#2D3142] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow z-50">Settings</span>
        </button>
      </aside>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── TOP HEADER ──────────────────────────────────────────────── */}
        <header className="h-20 bg-white border-b border-[#E6E2DA] px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm shrink-0">
              <span className="font-serif font-semibold text-sm text-black">I</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#2D3142] font-sans">MarketPlace</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide uppercase text-neutral-400">
            <a href="#templates" className="text-[#2D3142] hover:text-[#B89C72] transition-colors">Templates</a>
            <a href="#features" className="hover:text-[#B89C72] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#B89C72] transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Shopping Cart Area (Dashboard link) */}
            <button
              onClick={() => {
                if (isLoggedIn) {
                  window.location.href = user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/client";
                } else {
                  setAuthMode("login");
                  setIsAuthOpen(true);
                }
              }}
              className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm hover:bg-neutral-50 transition-colors relative group cursor-pointer"
              title="My Purchases"
            >
              <svg className="w-5 h-5 text-[#2D3142]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {isLoggedIn && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B89C72] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                  ✓
                </span>
              )}
              <span className="absolute top-12 right-0 bg-[#2D3142] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow z-50">
                {isLoggedIn ? "My Purchases" : "Login to view Purchases"}
              </span>
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="hidden md:inline text-xs text-[#7F8487] font-semibold bg-[#FAF9F6] border border-[#E6E2DA] rounded-full px-3 py-1">
                  🔑 {user?.role}: {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 h-9 text-xs font-semibold text-[#7F8487] hover:text-red-500 rounded-lg transition-all cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setIsAuthOpen(true);
                  }}
                  className="text-xs font-semibold tracking-wide uppercase text-neutral-600 hover:text-black transition-all cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                    setIsAuthOpen(true);
                  }}
                  className="px-5 h-9 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-lg transition-all shadow-sm flex items-center justify-center font-sans cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── HERO BANNER ─────────────────────────────────────────────── */}
        <section className="px-6 sm:px-10 pt-8 pb-4">
          <div className="max-w-7xl mx-auto rounded-[32px] bg-[#FAF8F5] border border-[#E9E4DC] p-12 sm:p-16 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[380px]">
            {/* Background organic blob decoration */}
            <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-[#F3ECE0] opacity-60 filter blur-2xl pointer-events-none"></div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#EFE6D9] opacity-65 filter blur-3xl pointer-events-none"></div>

            {/* Floating Invitation Card 1 (Left Upper - Botanical) */}
            <div className="hidden lg:flex absolute left-[8%] top-[12%] -rotate-12 w-28 h-36 bg-white border border-[#E5E0D5] rounded-xl shadow-lg p-2.5 flex-col justify-between hover:scale-105 transition-all duration-300 hover:rotate-[-6deg] z-10">
              <div className="w-full h-[75%] rounded bg-[#FAF9F6] overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80" alt="Botanical" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-12 h-1.5 bg-[#EBE7DF] rounded-full"></div>
                <div className="w-8 h-1 bg-[#FAF9F6] rounded-full"></div>
              </div>
            </div>

            {/* Floating Invitation Card 2 (Left Lower - Cake) */}
            <div className="hidden lg:flex absolute left-[16%] bottom-[12%] rotate-6 w-28 h-36 bg-white border border-[#E5E0D5] rounded-xl shadow-lg p-2.5 flex-col justify-between hover:scale-105 transition-all duration-300 hover:rotate-[12deg] z-10">
              <div className="w-full h-[75%] rounded bg-[#FAF9F6] overflow-hidden relative flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1530101121893-8072753b6647?w=200&q=80" alt="Cake" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-10 h-1.5 bg-[#EBE7DF] rounded-full"></div>
                <div className="w-6 h-1 bg-[#FAF9F6] rounded-full"></div>
              </div>
            </div>

            {/* Floating Invitation Card 3 (Right Upper - Balloons) */}
            <div className="hidden lg:flex absolute right-[18%] top-[12%] rotate-[10deg] w-28 h-36 bg-white border border-[#E5E0D5] rounded-xl shadow-lg p-2.5 flex-col justify-between hover:scale-105 transition-all duration-300 hover:rotate-[4deg] z-10">
              <div className="w-full h-[75%] rounded bg-[#FAF9F6] overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=200&q=80" alt="Balloons" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-14 h-1.5 bg-[#EBE7DF] rounded-full"></div>
                <div className="w-8 h-1 bg-[#FAF9F6] rounded-full"></div>
              </div>
            </div>

            {/* Floating Invitation Card 4 (Right Lower - Couple/People) */}
            <div className="hidden lg:flex absolute right-[8%] bottom-[12%] -rotate-8 w-28 h-36 bg-white border border-[#E5E0D5] rounded-xl shadow-lg p-2.5 flex-col justify-between hover:scale-105 transition-all duration-300 hover:rotate-[-15deg] z-10">
              <div className="w-full h-[75%] rounded bg-[#FAF9F6] overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80" alt="Couple" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-12 h-1.5 bg-[#EBE7DF] rounded-full"></div>
                <div className="w-8 h-1 bg-[#FAF9F6] rounded-full"></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl flex flex-col items-center gap-6 z-20">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-medium text-[#2D3142] leading-tight tracking-tight max-w-xl">
                Create and Share Beautiful <br />
                Event Invitations
              </h1>
              <a
                href="#templates"
                className="inline-flex items-center justify-center px-8 h-11 text-xs font-semibold text-[#5C4D37] bg-[#E8DCC4] hover:bg-[#DECFA7] rounded-xl transition-all shadow-sm font-sans"
              >
                Browse Templates
              </a>
            </div>
          </div>
        </section>

        {/* ── SEARCH BAR ──────────────────────────────────────────────── */}
        <section className="px-6 sm:px-10 py-4 sticky top-20 bg-[#FAF9F6] z-30">
          <div className="max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-[#7F8487]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E6E2DA] rounded-full text-xs shadow-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-[#7F8487] hover:text-[#2D3142]"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* ── TEMPLATES GRID ──────────────────────────────────────────── */}
        <section className="px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-[#F4F1EA] border-t-black animate-spin"></div>
              <p className="text-xs text-[#7F8487] font-medium">Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#7F8487] font-medium text-xs">No templates match your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        alt={template.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-all duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Template Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-sans font-semibold text-neutral-800 text-[13px] leading-tight group-hover:text-black transition-colors line-clamp-1">
                          {template.title}
                        </h3>
                        <span className="text-[11px] font-bold text-neutral-600 border border-neutral-300 px-1.5 py-0.5 rounded bg-white shrink-0">
                          {typeof template.price === 'number' ? `$${template.price}` : template.price}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction("View Details", template.title)}
                          className="flex-1 py-1.5 text-[11px] font-semibold border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            if (!isLoggedIn) {
                              setAuthMode("login");
                              setIsAuthOpen(true);
                              return;
                            }
                            handleAction("Request Purchase", template.title);
                          }}
                          className="flex-1 py-1.5 text-[11px] font-semibold text-white bg-black hover:bg-neutral-800 rounded-lg transition-colors shadow-sm"
                        >
                          Request Purchase
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ── HOW IT WORKS SECTION ───────────────────────────────────── */}
        <section id="features" className="px-6 sm:px-10 py-16 bg-white border-t border-b border-[#E6E2DA]">
          <div className="max-w-5xl mx-auto flex flex-col gap-10">
            <div className="text-center flex flex-col gap-1.5">
              <h2 className="text-2xl font-serif font-medium text-neutral-800">How It Works</h2>
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
                <h3 className="font-sans font-bold text-sm text-neutral-800">Select a Design</h3>
                <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">
                  Curate your design layout by browsing and selecting from our premium template gallery.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </div>
                <h3 className="font-sans font-bold text-sm text-neutral-800">Customize Online</h3>
                <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">
                  Customize details like date, coordinates, texts, and music instantly on your dashboard.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <h3 className="font-sans font-bold text-sm text-neutral-800">Download & Share</h3>
                <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">
                  Download your invitation image or share the interactive guest link for online RSVP tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS SECTION ───────────────────────────────────── */}
        <section id="pricing" className="px-6 sm:px-10 py-16 bg-white border-t border-[#E6E2DA]">
          <div className="max-w-7xl mx-auto flex flex-col gap-10 relative">
            <div className="text-center flex flex-col gap-1">
              <h2 className="text-[26px] font-serif font-medium text-neutral-800">Testimonials</h2>
            </div>

            <div className="relative w-full">
              {/* testimonial grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pr-12">
                {/* Review 1 */}
                <div className="bg-white border border-[#E9E4DC] p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all">
                  <p className="text-[12px] italic text-[#7F8487] leading-relaxed">
                    "The botanical templates are exceptionally elegant. The guest response tracker made coordinating RSVPs for our wedding completely stress-free."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#EBE7DF] overflow-hidden flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-neutral-600">AR</span>
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-[#2D3142]">Ahmed Al-Rashid</h4>
                      <span className="text-[10px] text-[#7F8487] block -mt-0.5">Wedding Host</span>
                    </div>
                  </div>
                </div>

                {/* Review 2 */}
                <div className="bg-white border border-[#E9E4DC] p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all">
                  <p className="text-[12px] italic text-[#7F8487] leading-relaxed">
                    "So beautiful and extremely simple to customize. Approved in minutes, editable fields work like magic. The audio music player option was a massive hit!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#EBE7DF] overflow-hidden flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-neutral-600">SA</span>
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-[#2D3142]">Sarah Al-Mansoori</h4>
                      <span className="text-[10px] text-[#7F8487] block -mt-0.5">Bridal Shower Host</span>
                    </div>
                  </div>
                </div>

                {/* Review 3 */}
                <div className="bg-white border border-[#E9E4DC] p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all">
                  <p className="text-[12px] italic text-[#7F8487] leading-relaxed">
                    "The guest RSVP count feature was incredibly helpful. I could see the exact counts and companion details live. Saved hours of phone calls!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#EBE7DF] overflow-hidden flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-neutral-600">KB</span>
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-[#2D3142]">Khalid Bashir</h4>
                      <span className="text-[10px] text-[#7F8487] block -mt-0.5">Anniversary Host</span>
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
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-xs mb-12">
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
                <a href="#" onClick={(e) => { e.preventDefault(); if(!isLoggedIn) { setAuthMode("login"); setIsAuthOpen(true); } }} className="hover:text-black transition-colors">About</a>
                <a href="#" onClick={(e) => { e.preventDefault(); if(!isLoggedIn) { setAuthMode("login"); setIsAuthOpen(true); } }} className="hover:text-black transition-colors">Account</a>
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

          <div className="max-w-7xl mx-auto pt-8 border-t border-[#E6E2DA] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-neutral-400 font-medium">
            <p>&copy; Copyright - 2023 MarketPlace. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>

      {/* ── AUTH MODAL (Login / Register Popup) ────────────────────── */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[32px] max-w-sm w-full p-8 shadow-2xl relative flex flex-col items-center">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setIsAuthOpen(false);
                setAuthError("");
              }}
              className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Decorative Floating Card (Cake) */}
            <div className="hidden sm:flex absolute left-[-28px] top-[30%] -rotate-12 w-14 h-14 bg-white border border-[#E9E4DC] rounded-xl shadow-lg p-1.5 items-center justify-center z-10">
              <span className="text-2xl select-none">🎂</span>
            </div>

            {/* Right Decorative Floating Card (Balloons & People) */}
            <div className="hidden sm:flex absolute right-[-24px] bottom-[15%] rotate-6 w-16 h-20 bg-white border border-[#E9E4DC] rounded-xl shadow-lg p-1.5 flex-col justify-between z-10">
              <div className="w-full h-[65%] rounded bg-[#FAF9F6] overflow-hidden flex items-center justify-center select-none text-xl">
                🎈
              </div>
              <div className="flex items-center justify-center select-none text-sm leading-none -mt-1 font-serif text-black">
                🧑‍🤝‍🧑
              </div>
            </div>

            {/* Tabs (Capsule style) */}
            <div className="bg-neutral-100 border border-neutral-200/60 rounded-xl p-1 flex w-full mb-6 mt-2">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  authMode === "login"
                    ? "bg-[#F5EDE1] text-black shadow-sm"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  authMode === "register"
                    ? "bg-[#F5EDE1] text-black shadow-sm"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Register
              </button>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="w-full mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                </svg>
                <span className="leading-tight">{authError}</span>
              </div>
            )}

            {/* Mode: Login */}
            {authMode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="w-full flex flex-col">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-serif font-medium text-neutral-800 mb-1">Welcome Back!</h2>
                  <p className="text-[11px] text-neutral-400">Access your account and continue designing</p>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Email Input */}
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={authSubmitting}
                    className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />

                  {/* Forgot Password Link Above Password */}
                  <div className="flex justify-end -mb-1 mt-1">
                    <button
                      type="button"
                      onClick={() => handleAction("Forgot Password", "Login Modal")}
                      className="text-[10px] text-neutral-500 hover:text-black transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Password Input */}
                  <div className="relative w-full">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={authSubmitting}
                      className="w-full bg-white border border-[#E6E2DA] rounded-xl pl-4 pr-10 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                    >
                      {showLoginPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm mt-5 mb-4 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            ) : (
              // Mode: Register
              <form onSubmit={handleRegisterSubmit} className="w-full flex flex-col">
                <div className="text-center mb-5">
                  <h2 className="text-2xl font-serif font-medium text-neutral-800 mb-1">Create Account</h2>
                  <p className="text-[11px] text-neutral-400">Join us to save and coordinate your event invitations</p>
                </div>

                <div className="flex flex-col gap-3">
                  {/* First Name & Last Name Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      disabled={authSubmitting}
                      className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      disabled={authSubmitting}
                      className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Email Input */}
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={authSubmitting}
                    className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />

                  {/* Phone Input */}
                  <input
                    type="tel"
                    placeholder="Phone Number (e.g. +966501234567)"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    disabled={authSubmitting}
                    className="w-full bg-white border border-[#E6E2DA] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />

                  {/* Password Input */}
                  <div className="relative w-full">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Password (Min. 8 characters)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      disabled={authSubmitting}
                      className="w-full bg-white border border-[#E6E2DA] rounded-xl pl-4 pr-10 py-2.5 text-xs outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                    >
                      {showRegPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm mt-5 mb-4 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
            )}

            {/* Divider: Or continue with */}
            <div className="w-full flex items-center gap-3 my-4 text-[10px] text-neutral-400 font-medium uppercase tracking-wider select-none">
              <div className="h-px bg-[#E6E2DA] flex-1"></div>
              <span>Or continue with</span>
              <div className="h-px bg-[#E6E2DA] flex-1"></div>
            </div>

            {/* Social Buttons Row 1: Google & Apple */}
            <div className="w-full flex gap-3 mb-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleAction("Continue with Google", "Auth Modal")}
                className="flex-1 flex items-center justify-center gap-2 border border-neutral-300 hover:bg-neutral-50 rounded-xl py-2.5 text-xs font-semibold text-neutral-700 bg-white transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.973 0 12 0 7.354 0 3.373 2.766 1.554 6.777l3.712 2.988z"
                  />
                  <path
                    fill="#34A853"
                    d="M16.04 15.345c-1.077.732-2.432 1.164-4.04 1.164-2.927 0-5.414-1.977-6.302-4.632l-3.737 2.877c1.868 3.714 5.714 6.246 10.04 6.246 2.923 0 5.613-.977 7.623-2.659l-3.586-2.996z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.273c0-.818-.073-1.609-.205-2.373H12v4.582h6.486c-.282 1.477-1.118 2.727-2.377 3.568l3.586 2.996c2.095-1.932 3.3-4.773 3.3-8.773z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.698 11.877c-.227-.677-.359-1.4-.359-2.155s.132-1.477.359-2.154L1.986 4.58C1.223 6.136.786 7.886.786 9.722c0 1.837.437 3.587 1.2 5.141l3.712-2.986z"
                  />
                </svg>
                <span>Google</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => handleAction("Continue with Apple", "Auth Modal")}
                className="flex-1 flex items-center justify-center gap-2 border border-neutral-300 hover:bg-neutral-50 rounded-xl py-2.5 text-xs font-semibold text-neutral-700 bg-white transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.97.08 2.15-.52 2.82-1.33" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Social Buttons Row 2: Facebook */}
            <button
              type="button"
              onClick={() => handleAction("Continue with Facebook", "Auth Modal")}
              className="w-full flex items-center justify-center gap-2 border border-neutral-300 hover:bg-neutral-50 rounded-xl py-2.5 text-xs font-semibold text-neutral-700 bg-white transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>

            {/* Footer switcher text */}
            <div className="text-center text-[11px] text-neutral-500 mt-6">
              {authMode === "login" ? (
                <span>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                    }}
                    className="font-bold text-black hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                    className="font-bold text-black hover:underline cursor-pointer"
                  >
                    Log in
                  </button>
                </span>
              )}
            </div>

          </div>
        </div>
      )}

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
    </div>
  );
}
