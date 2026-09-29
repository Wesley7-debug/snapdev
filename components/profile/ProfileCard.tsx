"use client";

import type { Builder } from "../ui/types";
import { avatarColor, initials } from "../ui/Avatar";
import { formatDistance, statusColor } from "@/lib/geo";

interface Props {
  builder: Builder;
  onClose: () => void;
}

export default function ProfileCard({ builder: b, onClose }: Props) {
  return (
    <div className="w-full overflow-hidden bg-white">
      <div className="relative bg-slate-50 px-5 pb-4 pt-5">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow active:scale-90"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="flex items-center gap-3">
          {b.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.avatar} alt={b.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-white" />
          ) : (
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ring-2 ring-white"
              style={{ background: avatarColor(b.name) }}
            >
              {initials(b.name)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[16px] font-bold text-slate-900">{b.name}</p>
            <p className="truncate text-[13px] text-slate-500">
              {b.role} · @{b.username}
            </p>
          </div>
        </div>
        {b.building && (
          <p className="mt-3 text-[13.5px] text-slate-700">
            <span className="text-slate-400">Building </span>
            <span className="font-semibold">{b.building}</span>
          </p>
        )}
        {b.techStack && b.techStack.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {b.techStack.map((t) => (
              <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-600">
                {t}
              </span>
            ))}
          </div>
        )}
        {b.bio && (
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-600">{b.bio}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {b.status && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full" style={{ background: statusColor(b.status) }} />
              {b.status}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-600">
            📍 {formatDistance(b.distanceKm)}
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {b.xHandle && (
            <a
              href={`https://x.com/${b.xHandle.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-800 active:bg-slate-100"
            >
              𝕏 @{b.xHandle.replace(/^@/, "")} ↗
            </a>
          )}
          {b.github && (
            <a
              href={`https://github.com/${b.github.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-800 active:bg-slate-100"
            >
              GitHub · {b.github.replace(/^@/, "")} ↗
            </a>
          )}
          {b.website && (
            <a
              href={b.website.startsWith("http") ? b.website : `https://${b.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate rounded-xl bg-slate-50 px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-800 active:bg-slate-100"
            >
              {b.website.replace(/^https?:\/\//, "")} ↗
            </a>
          )}
        </div>
        {(b.city || b.country) && (
          <p className="mt-3 text-[13px] text-slate-400">
            📍 {[b.city, b.country].filter(Boolean).join(", ")} (approximate)
          </p>
        )}
      </div>
    </div>
  );
}
