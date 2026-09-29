"use client";

import { useEffect } from "react";

interface Props {
  onClose: () => void;
  children: React.ReactNode;
  label?: string;
  /** sm = 400px, md = 480px, lg = 700px column on desktop; always full width on mobile. */
  size?: "sm" | "md" | "lg";
}

/**
 * Bottom drawer: edge-to-edge sheet that slides up from the bottom
 * (full width on mobile, centered max-width column on desktop).
 * Backdrop click + Escape close it.
 */
export default function Drawer({ onClose, children, label, size = "sm" }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={label ?? "Details"}
    >
      <div
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`md-sheet relative max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl ${
          size === "lg" ? "sm:max-w-[700px]" : size === "md" ? "sm:max-w-[480px]" : "sm:max-w-[400px]"
        }`}
      >
        <div className="sticky top-0 z-10 bg-white/95 pt-2.5 backdrop-blur">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-200" />
        </div>
        {children}
      </div>
    </div>
  );
}
