"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";

// ── Types ────────────────────────────────────────────────────────────────

export interface CurrencyContextType {
  currency: string;
  rate: number;
  symbol: string;
  isLoading: boolean;
  permissionStatus: "prompt" | "granted" | "denied";
  requestLocationPermission: () => Promise<void>;
  setDefaultCurrency: () => void;
  formatPrice: (jodPrice: number | string) => string;
  availableRates: Record<string, number>;
  changeCurrencyManually: (currencyCode: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// ── Currency Config & Mappings ──────────────────────────────────────────

const FALLBACK_RATES: Record<string, number> = {
  JOD: 1.0,
  SAR: 5.29,
  AED: 5.18,
  QAR: 5.14,
  BHD: 0.53,
  KWD: 0.43,
  OMR: 0.54,
  EGP: 68.0,
  USD: 1.41,
  GBP: 1.11,
  EUR: 1.30,
};

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  JO: "JOD", // Jordan
  SA: "SAR", // Saudi Arabia
  AE: "AED", // UAE
  QA: "QAR", // Qatar
  BH: "BHD", // Bahrain
  KW: "KWD", // Kuwait
  OM: "OMR", // Oman
  EG: "EGP", // Egypt
  US: "USD", // USA
  GB: "GBP", // UK
  CA: "CAD", // Canada
  AU: "AUD", // Australia
  TR: "TRY", // Turkey
  // Europe
  FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR", GR: "EUR", AT: "EUR", FI: "EUR", IE: "EUR", PT: "EUR"
};

// Returns standard symbol or translated label
export const getCurrencySymbol = (code: string, lang: "ar" | "en"): string => {
  const isAr = lang === "ar";
  switch (code) {
    case "JOD": return isAr ? "د.أ" : "JOD";
    case "SAR": return isAr ? "ر.س" : "SAR";
    case "AED": return isAr ? "د.إ" : "AED";
    case "QAR": return isAr ? "ر.ق" : "QAR";
    case "BHD": return isAr ? "د.ب" : "BHD";
    case "KWD": return isAr ? "د.ك" : "KWD";
    case "OMR": return isAr ? "ر.ع." : "OMR";
    case "EGP": return isAr ? "ج.م" : "EGP";
    case "USD": return "$";
    case "GBP": return "£";
    case "EUR": return "€";
    default: return code;
  }
};

// ── Context Provider ──────────────────────────────────────────────────────

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();
  
  const [currency, setCurrency] = useState<string>("JOD");
  const [rate, setRate] = useState<number>(1.0);
  const [availableRates, setAvailableRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt");

  // Load configuration from local storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPermission = localStorage.getItem("currency_permission_status") as any;
    if (savedPermission) {
      setPermissionStatus(savedPermission);
    }

    const savedCurrency = localStorage.getItem("currency_code");
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }

    // Load cached exchange rates if available and valid
    const cachedRatesStr = localStorage.getItem("currency_rates_cache");
    const cachedTimestamp = localStorage.getItem("currency_rates_timestamp");
    const isCacheValid = cachedTimestamp && Date.now() - Number(cachedTimestamp) < 24 * 60 * 60 * 1000; // 24 hours validity

    if (cachedRatesStr && isCacheValid) {
      try {
        const parsed = JSON.parse(cachedRatesStr);
        setAvailableRates(parsed);
        if (savedCurrency && parsed[savedCurrency]) {
          setRate(parsed[savedCurrency]);
        }
        setIsLoading(false);
      } catch {
        fetchRates();
      }
    } else {
      fetchRates();
    }
  }, []);

  // Update conversion rate whenever active currency changes
  useEffect(() => {
    if (availableRates[currency]) {
      setRate(availableRates[currency]);
    }
  }, [currency, availableRates]);

  // Fetch rates relative to JOD base currency
  const fetchRates = async () => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/JOD");
      if (!res.ok) throw new Error("Rates API network error");
      const data = await res.json();
      
      if (data && data.rates) {
        const newRates = { ...FALLBACK_RATES, ...data.rates };
        setAvailableRates(newRates);
        localStorage.setItem("currency_rates_cache", JSON.stringify(newRates));
        localStorage.setItem("currency_rates_timestamp", String(Date.now()));
        
        const savedCurrency = localStorage.getItem("currency_code");
        if (savedCurrency && newRates[savedCurrency]) {
          setRate(newRates[savedCurrency]);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch live exchange rates, using fallback rates:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Request browser location and run geocoding lookup
  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setDefaultCurrency();
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        localStorage.setItem("currency_permission_status", "granted");
        setPermissionStatus("granted");

        try {
          // Query OSM reverse geocoder
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          );
          if (!geoRes.ok) throw new Error("Reverse geocoder error");
          
          const geoData = await geoRes.json();
          if (geoData && geoData.address && geoData.address.country_code) {
            const countryCode = geoData.address.country_code.toUpperCase();
            const localCurrency = COUNTRY_TO_CURRENCY[countryCode] || "JOD";
            
            setCurrency(localCurrency);
            localStorage.setItem("currency_code", localCurrency);
          } else {
            setDefaultCurrency();
          }
        } catch (err) {
          console.warn("Geolocation reverse geocoding failed, trying IP lookup:", err);
          // Try IP-based location lookup as a robust fallback
          try {
            const ipRes = await fetch("https://ipapi.co/json/");
            const ipData = await ipRes.json();
            if (ipData && ipData.country_code) {
              const localCurrency = COUNTRY_TO_CURRENCY[ipData.country_code] || "JOD";
              setCurrency(localCurrency);
              localStorage.setItem("currency_code", localCurrency);
            } else {
              setDefaultCurrency();
            }
          } catch {
            setDefaultCurrency();
          }
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.warn("Browser Geolocation permission denied or failed:", error);
        localStorage.setItem("currency_permission_status", "denied");
        setPermissionStatus("denied");
        setDefaultCurrency();
      },
      { timeout: 8000 }
    );
  };

  const setDefaultCurrency = () => {
    setCurrency("JOD");
    setRate(availableRates["JOD"] || 1.0);
    localStorage.setItem("currency_code", "JOD");
    localStorage.setItem("currency_permission_status", "denied");
    setPermissionStatus("denied");
    setIsLoading(false);
  };

  // Change currency manually via manual picker
  const changeCurrencyManually = (currencyCode: string) => {
    if (availableRates[currencyCode]) {
      setCurrency(currencyCode);
      localStorage.setItem("currency_code", currencyCode);
      // Skip location prompts in the future since they chose manually
      localStorage.setItem("currency_permission_status", "granted");
      setPermissionStatus("granted");
    }
  };

  // Format jodPrice dynamically
  const formatPrice = (jodPrice: number | string): string => {
    const rawVal = typeof jodPrice === "number" ? jodPrice : parseFloat(jodPrice || "0");
    if (isNaN(rawVal)) return "0.00 " + getCurrencySymbol(currency, lang);

    const converted = rawVal * rate;
    
    // Decimal precision: dinars usually have 2 or 3 decimals, others have 2
    const precision = (currency === "JOD" || currency === "BHD" || currency === "KWD" || currency === "OMR") ? 3 : 2;
    const formattedNum = converted.toLocaleString(lang === "ar" ? "en-US" : "en-US", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });

    const symbolStr = getCurrencySymbol(currency, lang);

    // Prefix vs Suffix formatting
    if (symbolStr === "$" || symbolStr === "£" || symbolStr === "€") {
      return lang === "ar"
        ? `${formattedNum} ${symbolStr}`
        : `${symbolStr}${formattedNum}`;
    }

    return lang === "ar"
      ? `${formattedNum} ${symbolStr}`
      : `${formattedNum} ${symbolStr}`;
  };

  const symbol = getCurrencySymbol(currency, lang);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        rate,
        symbol,
        isLoading,
        permissionStatus,
        requestLocationPermission,
        setDefaultCurrency,
        formatPrice,
        availableRates,
        changeCurrencyManually,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
