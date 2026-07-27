"use client";

import React from "react";
import PhoneInputWithCountrySelect, { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useLanguage } from "../LanguageContext";

interface PhoneInputProps {
  /** Full E.164 phone string (e.g. +966501234567) */
  value: string;
  /** Callback returning updated full E.164 string */
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultCountryCode?: Country;
}

export default function PhoneInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
  defaultCountryCode = "SA",
}: PhoneInputProps) {
  const { lang } = useLanguage();

  return (
    <div className={`phone-input-container w-full ${className}`}>
      <PhoneInputWithCountrySelect
        international
        countryCallingCodeEditable={false}
        defaultCountry={defaultCountryCode}
        value={value || ""}
        onChange={(val) => onChange(val || "")}
        disabled={disabled}
        placeholder={
          placeholder ||
          (lang === "ar" ? "رقم الهاتف" : "Phone number")
        }
        className="custom-react-phone-input flex items-center w-full bg-white border border-[#E6E2DA] rounded-xl px-3.5 py-2.5 text-xs outline-none focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all"
      />
      <style jsx global>{`
        .custom-react-phone-input .PhoneInputCountry {
          margin-right: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        [dir="rtl"] .custom-react-phone-input .PhoneInputCountry {
          margin-right: 0;
          margin-left: 0.6rem;
        }
        .custom-react-phone-input .PhoneInputCountrySelect {
          background: transparent;
          border: none;
          font-size: 0.75rem;
          outline: none;
          cursor: pointer;
        }
        .custom-react-phone-input .PhoneInputInput {
          background: transparent;
          border: none;
          font-size: 0.75rem;
          outline: none;
          width: 100%;
          color: #1a1a1a;
          direction: ltr;
        }
        .custom-react-phone-input .PhoneInputCountryIcon {
          width: 1.35rem;
          height: 0.95rem;
          box-shadow: 0 0 1px rgba(0, 0, 0, 0.4);
          border-radius: 2px;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}
