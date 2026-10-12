"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface WatchDemoModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export function WatchDemoModal({
  open,
  onClose,
  title = "Product Demo",
}: WatchDemoModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#7141F8] px-6 py-4">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video placeholder */}
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-5 bg-[#1D2939] px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7141F8]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              Demo video coming soon
            </p>
            <p className="mt-1 text-xs text-[#98A2B3]">
              The video link will be added here when available
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end bg-[#F9FAFB] px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#7141F8] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#8760f8]"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
