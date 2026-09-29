"use client";

import type { Builder } from "@/components/ui/types";
import NearbyList from "@/components/discovery/NearbyList";
import ProfileCard from "@/components/profile/ProfileCard";

interface Props {
  builders: Builder[];
  selected: Builder | null;
  showNearby: boolean;
  onToggleNearby: () => void;
  onCloseSelected: () => void;
  onPick: (b: Builder) => void;
}

export default function BottomUI({ builders, selected, showNearby, onToggleNearby, onCloseSelected, onPick }: Props) {
  return (
    <>
      {!selected && !showNearby && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 flex justify-center sm:bottom-8 sm:justify-start sm:pl-4">
          <p className="rounded-full bg-slate-900/70 px-3.5 py-1.5 text-[12px] font-medium text-white backdrop-blur">
            Find who&apos;s building around you
          </p>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center sm:justify-start sm:pl-4">
        <button
          onClick={onToggleNearby}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-white py-2.5 pl-4 pr-5 shadow-xl active:scale-95"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[13.5px] font-bold text-slate-900">
            {builders.length} builder{builders.length === 1 ? "" : "s"} nearby
          </span>
        </button>
      </div>
      {(selected || showNearby) && (
        <div className="absolute inset-x-0 bottom-16 z-20 flex justify-center px-3 sm:bottom-8 sm:justify-start sm:pl-4 sm:pr-0">
          {selected ? (
            <ProfileCard builder={selected} onClose={onCloseSelected} />
          ) : (
            <NearbyList builders={builders} onClose={onToggleNearby} onPick={onPick} />
          )}
        </div>
      )}
    </>
  );
}
