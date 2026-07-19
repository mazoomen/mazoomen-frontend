"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import type { Template } from "@/types/template";
import PageLayout from "@/components/PageLayout";
import AuthModal from "@/components/AuthModal";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import {
  HeroBanner,
  SearchBar,
  TemplateGrid,
  HowItWorks,
  TestimonialsSection,
  CheckoutModal,
} from "./_components";
import type { TestimonialItem } from "./_components/TestimonialsSection";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Popup Modal Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Redesign filter and category states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"all" | "ready">("all");
  const [showEventTypesOverlay, setShowEventTypesOverlay] = useState(false);

  // Checkout modal template
  const [buyingTemplate, setBuyingTemplate] = useState<Template | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const res = await api.get<Template[]>("/templates");
        if (res.data && res.data.length > 0) {
          const apiTemplates = res.data
            .filter((t) => t.isActive)
            .map((t) => ({
              ...t,
              price: parseFloat(t.price.toString()),
            }));
          setTemplates(apiTemplates);
        } else {
          setTemplates([]);
        }
      } catch (err) {
        logger.error("Error fetching templates", err);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    }

    async function fetchTestimonials() {
      try {
        const res = await api.get<TestimonialItem[]>("/testimonials");
        setTestimonials(res.data || []);
      } catch (err) {
        logger.error("Error fetching testimonials", err);
      }
    }

    fetchTemplates();
    fetchTestimonials();
  }, []);

  const triggerLoginModal = () => {
    setAuthMode("login");
    setIsAuthOpen(true);
  };

  const triggerRegisterModal = () => {
    setAuthMode("register");
    setIsAuthOpen(true);
  };

  const filteredTemplates = templates.filter((template) => {
    // Search text query (check title & description in both Arabic and English)
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (template.title || "").toLowerCase().includes(q) ||
      ((template as any).titleEn || "").toLowerCase().includes(q) ||
      (template.description || "").toLowerCase().includes(q) ||
      ((template as any).descriptionEn || "").toLowerCase().includes(q);

    // Category selection
    const matchesCategory = selectedCategory
      ? (template.category || "").toLowerCase() === selectedCategory.toLowerCase()
      : true;

    // Tab selection: both 'all' and 'ready' show active templates
    const matchesTab = true;

    return template.isActive && matchesSearch && matchesCategory && matchesTab;
  });

  const handleExploreScroll = () => {
    const el = document.getElementById("templates");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PageLayout>
      <main className="flex-1 flex flex-col min-w-0">
        <HeroBanner
          onExploreClick={handleExploreScroll}
          onRegisterClick={triggerRegisterModal}
        />

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          showEventTypesOverlay={showEventTypesOverlay}
          setShowEventTypesOverlay={setShowEventTypesOverlay}
        />

        <TemplateGrid
          templates={filteredTemplates}
          loading={loading}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          selectedCategory={selectedCategory}
          isLoggedIn={isLoggedIn}
          onPurchaseClick={setBuyingTemplate}
          onLoginTrigger={triggerLoginModal}
        />

        <HowItWorks />

        <TestimonialsSection testimonials={testimonials} />
      </main>

      <Footer onOpenAuth={(mode) => {
        setAuthMode(mode);
        setIsAuthOpen(true);
      }} />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      <CheckoutModal
        buyingTemplate={buyingTemplate}
        onClose={() => setBuyingTemplate(null)}
      />
    </PageLayout>
  );
}
