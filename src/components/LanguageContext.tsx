"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language } from "@/i18n/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("ar");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("lang") as Language;
    if (stored === "en" || stored === "ar") {
      setLangState(stored);
    } else {
      localStorage.setItem("lang", "ar");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  }, [lang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const t = (key: string): string => {
    const term = translations[key];
    if (!term) return key;
    return term[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
