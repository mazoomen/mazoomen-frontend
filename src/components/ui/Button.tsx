"use client";

import React from "react";
import Spinner from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "gold" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[#0B1528] border border-[#1E2E4A] hover:bg-[#1A2D4C] text-[#E5C38B]",
  secondary: "border border-[#1E2E4A] text-[#0B1528] bg-white/40 hover:bg-[#0B1528]/5",
  gold: "bg-[#E5C38B] hover:bg-[#D4B27A] text-black border border-[#D4B27A]/30",
  danger: "bg-red-600 hover:bg-red-700 text-white border border-red-700/30",
  outline: "border border-[#E6E2DA] bg-white hover:bg-neutral-50 text-neutral-700",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[10px] font-semibold rounded-lg h-8",
  md: "px-5 py-2.5 text-xs font-semibold rounded-xl h-10",
  lg: "px-6 py-3 text-sm font-semibold rounded-xl h-12",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className="!gap-0" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
