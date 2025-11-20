"use client";

import { useEffect, useState } from "react";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "confirm" | "alert";
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
};

export function Dialog({
  isOpen,
  onClose,
  title,
  message,
  type = "alert",
  onConfirm,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
}: DialogProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setIsMounted(true);
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      requestAnimationFrame(() => {
        setIsAnimating(false);
        document.body.style.overflow = "";
      });
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6 shadow-2xl transition-all duration-300 ${
            isAnimating
              ? "scale-100 translate-y-0"
              : "scale-95 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="pr-8">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm text-white/70">{message}</p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {type === "confirm" && (
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={type === "confirm" ? handleConfirm : onClose}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                type === "confirm"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                  : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {type === "confirm" ? confirmText : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

