"use client";

import { PLACES } from "@/lib/geo";

interface Props {
  city: string;
  setCity: (v: string) => void;
  locNote: string;
  locLabel: string | null;
  lng: number;
  lat: number;
  geoBusy: boolean;
  onLocate: () => void;
  onPick: (label: string, city: string, lng: number, lat: number) => void;
}

export default function LocationStep({ city, setCity, locNote, locLabel, lng, lat, geoBusy, onLocate, onPick }: Props) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[12px] font-semibold text-slate-600">Location *</p>
      <button
        onClick={onLocate}
        disabled={geoBusy}
        className="mt-2 w-full rounded-xl bg-slate-900 py-2.5 text-[13.5px] font-semibold text-white active:scale-[0.98] disabled:opacity-60"
      >
        {geoBusy ? "Locating…" : "📍 Use my location"}
      </button>
      <p className="mt-2 text-[12px] leading-snug text-slate-500">{locNote}</p>
      {locLabel && (
        <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-200">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[16px] text-white">
            📍
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-bold text-emerald-900">Location set ✓</span>
            <span className="block truncate text-[13px] font-semibold text-emerald-800">{locLabel}</span>
            <span className="block text-[12px] font-medium tabular-nums text-emerald-700">
              ≈ {lat.toFixed(4)}, {lng.toFixed(4)} · people only see your area, never this exact spot
            </span>
          </span>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PLACES.map((pl) => (
          <button
            key={pl.label}
            onClick={() => onPick(pl.label, pl.city, pl.lng, pl.lat)}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-medium text-slate-600 active:scale-95"
          >
            {pl.label}
          </button>
        ))}
      </div>
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City / area"
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-slate-900"
      />
      <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-snug text-slate-500">
        <span>🔒</span> Your exact location is never shown. People only see your approximate area.
      </p>
    </div>
  );
}
