"use client";

import { useEffect } from "react";

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

/**
 * SnapMap-style centered modal.
 * Dark blurred backdrop, white rounded card, pops in.
 * Used for every bottom-left dock icon.
 */
export default function SnapModal({ title, subtitle, onClose, children, wide }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`md-pop relative max-h-[88dvh] w-full overflow-y-auto rounded-3xl bg-white shadow-2xl ${
          wide ? "sm:max-w-[480px]" : "sm:max-w-[400px]"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-white/95 px-5 pb-2 pt-4 backdrop-blur">
          <div className="min-w-0">
            <p className="truncate text-[16px] font-extrabold tracking-tight text-slate-900">
              {title}
            </p>
            {subtitle && (
              <p className="mt-0.5 truncate text-[13px] text-slate-500">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[15px] text-slate-600 transition active:scale-90"
          >
            ✕
          </button>
        </div>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}
