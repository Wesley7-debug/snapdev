"use client";

import FilterBar from "@/components/discovery/FilterBar";
import { toggleList } from "@/hooks/useBuilders";

interface Props {
  query: string;
  setQuery: (v: string) => void;
  roles: string[];
  setRoles: (v: string[]) => void;
  statuses: string[];
  setStatuses: (v: string[]) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  dbDown: boolean;
}

export default function TopBar(p: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3 sm:p-4">
      <div className="mx-auto flex max-w-xl flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFFC00] shadow-lg active:scale-95">
            <span className="text-[19px] font-black leading-none text-black">
              m
            </span>
          </div>

          {p.searchOpen ? (
            <input
              autoFocus
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
              placeholder="Search name, project, stack…"
              className="md-pop pointer-events-auto h-11 w-full flex-1 rounded-full bg-white px-5 text-[14px] shadow-lg outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#FFFC00]"
            />
          ) : (
            <button
              onClick={() => p.setSearchOpen(true)}
              aria-label="Search"
              className="pointer-events-auto flex h-11 w-full flex-1 items-center gap-2 rounded-full bg-white px-5 shadow-lg active:scale-[0.98]"
            >
              <span className="text-[16px] text-slate-400">⌕</span>
              <span className="text-[14px] font-medium text-slate-400">
                Search the map…
              </span>
            </button>
          )}

          <button
            onClick={() => p.setSearchOpen(false)}
            aria-label="Close search"
            className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[16px] shadow-lg active:scale-95"
          >
            {p.searchOpen ? "✕" : "☰"}
          </button>
        </div>

        <div className="pointer-events-none">
          <FilterBar
            activeRoles={p.roles}
            activeStatuses={p.statuses}
            onToggleRole={(r) => toggleList(p.roles, r, p.setRoles)}
            onToggleStatus={(s) => toggleList(p.statuses, s, p.setStatuses)}
            onClear={() => {
              p.setRoles([]);
              p.setStatuses([]);
              p.setQuery("");
            }}
          />
        </div>

        {p.dbDown && (
          <p className="pointer-events-auto rounded-full bg-[#FFFC00] px-4 py-2.5 text-[12.5px] font-bold text-black shadow-lg">
            Can&apos;t reach the database — check <code>MONGODB_URI</code> in
            .env.local.
          </p>
        )}
      </div>
    </div>
  );
}
