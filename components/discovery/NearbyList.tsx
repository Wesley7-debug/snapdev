"use client";

import type { Builder } from "../ui/types";
import { avatarColor, initials } from "../ui/Avatar";
import { formatDistance } from "@/lib/geo";

interface Props {
  builders: Builder[];
  onPick: (b: Builder) => void;
  onClose: () => void;
}

export default function NearbyList({ builders, onPick, onClose }: Props) {
  const sorted = [...builders].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  return (
    <div className="md-sheet pointer-events-auto w-full overflow-hidden rounded-3xl bg-white shadow-2xl sm:w-[340px]">
      <div className="flex items-center justify-between px-5 pb-1 pt-4">
        <p className="text-[15px] font-semibold text-slate-900">Builders nearby</p>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 active:scale-90"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="max-h-[38vh] overflow-y-auto px-2 pb-3">
        {sorted.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-500">
            Nobody matches right now. Try clearing filters.
          </p>
        )}
        {sorted.map((b) => (
          <button
            key={b.username}
            onClick={() => onPick(b)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
          >
            {b.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.avatar} alt={b.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold text-white"
                style={{ background: avatarColor(b.name) }}
              >
                {initials(b.name)}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold text-slate-900">
                {b.name} <span className="font-normal text-slate-400">· {b.role}</span>
              </span>
              <span className="block truncate text-[12px] text-slate-500">
                {b.building ? `Building ${b.building}` : b.bio}
              </span>
            </span>
            <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-400">
              {formatDistance(b.distanceKm).replace(" away", "")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
