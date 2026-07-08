"use client";

import { useEffect, useRef, useCallback } from "react";

interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Additional CSS classes for the modal panel */
  className?: string;
  /** Backdrop style variant */
  backdrop?: "dark" | "blur";
  /** Whether to show a close button */
  showCloseButton?: boolean;
  /** Accessible label for the modal */
  ariaLabel?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  className = "",
  backdrop = "blur",
  showCloseButton = true,
  ariaLabel,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap and ESC key handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      // Focus the modal panel
      requestAnimationFrame(() => {
        modalRef.current?.focus();
      });
    }

    return () => {
      document.body.style.overflow = "";
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const backdropClasses =
    backdrop === "blur"
      ? "bg-[#2D3142]/40 backdrop-blur-sm"
      : "bg-[#0B1528]/50";

  return (
    <div
      className={`fixed inset-0 ${backdropClasses} z-50 flex items-center justify-center p-4`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative outline-none ${className}`}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-black transition-colors cursor-pointer z-10"
            aria-label="Close dialog"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
