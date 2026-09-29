"use client";

import { useState } from "react";
import type { Place } from "@/lib/geo";

interface Props {
  query: string;
  setQuery: (v: string) => void;
  resultCount: number;
  dbDown: boolean;
  placeMatches: Place[];
  onPickPlace: (p: Place) => void;
}

/**
 * SnapMap-style top bar: small logo pill on the left,
 * big centered search pill (with place suggestions), count pill right.
 */
export default function SnapTopBar({ query, setQuery, resultCount, dbDown, placeMatches, onPickPlace }: Props) {
  const [focused, setFocused] = useState(false);
  const showPlaces = focused && query.trim().length >= 2 && placeMatches.length > 0;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
      <div className="mx-auto flex max-w-2xl items-start gap-2">
        <div className="pointer-events-auto flex shrink-0 items-center gap-2 rounded-full bg-white/95 py-2 pl-3 pr-4 shadow-lg backdrop-blur">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFFC00] text-[15px] font-black text-slate-900 ring-1 ring-slate-900/10">
            s
          </span>
          <span className="hidden text-[15px] font-extrabold tracking-tight text-slate-900 min-[400px]:inline">
            snapdev
          </span>
        </div>

        <div className="pointer-events-auto relative min-w-0 flex-1">
          <div className="flex items-center gap-2 rounded-full bg-white/95 py-2.5 pl-4 pr-3 shadow-lg backdrop-blur">
            <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] shrink-0 text-slate-400" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => window.setTimeout(() => setFocused(false), 150)}
              placeholder="Search name, project, place…"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[12px] text-slate-500 active:scale-90"
              >
                ✕
              </button>
            )}
          </div>
          {showPlaces && (
            <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-white/98 shadow-xl backdrop-blur">
              <p className="px-4 pb-0.5 pt-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Places
              </p>
              {placeMatches.map((pl) => (
                <button
                  key={pl.label}
                  onClick={() => {
                    setFocused(false);
                    (document.activeElement as HTMLElement | null)?.blur?.();
                    onPickPlace(pl);
                  }}
                  className="flex min-h-[48px] w-full items-center gap-3 px-4 py-2 text-left active:bg-slate-100"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[15px]">
                    📍
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold text-slate-900">
                      {pl.label}
                    </span>
                    <span className="block truncate text-[12px] text-slate-500">
                      See builders in {pl.city} →
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900/85 py-2.5 pl-3.5 pr-4 text-white shadow-lg backdrop-blur"
          title="Builders in view"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[13px] font-bold tabular-nums">{resultCount}</span>
        </div>
      </div>
      {dbDown && (
        <p className="pointer-events-auto mx-auto mt-2 max-w-2xl rounded-2xl bg-amber-50 px-4 py-2.5 text-[12.5px] font-medium text-amber-800 shadow">
          Can&apos;t reach the database — check <code>MONGODB_URI</code> in .env.local.
        </p>
      )}
    </div>
  );
}
