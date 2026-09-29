"use client";

import { ROLES, STATUSES } from "@/lib/geo";

interface Props {
  activeRoles: string[];
  activeStatuses: string[];
  onToggleRole: (r: string) => void;
  onToggleStatus: (s: string) => void;
  onClear: () => void;
}

const QUICK: { label: string; kind: "role" | "status"; value: string }[] = [
  { label: "Developers", kind: "role", value: "Developer" },
  { label: "Founders", kind: "role", value: "Founder" },
  { label: "Designers", kind: "role", value: "Designer" },
  { label: "AI Engineers", kind: "role", value: "AI Engineer" },
  { label: "Students", kind: "role", value: "Student" },
  { label: "Hiring", kind: "status", value: "Hiring" },
  { label: "Cofounder", kind: "status", value: "Looking for cofounder" },
  { label: "Collab", kind: "status", value: "Looking to collaborate" },
];

export default function FilterBar({ activeRoles, activeStatuses, onToggleRole, onToggleStatus, onClear }: Props) {
  const anyActive = activeRoles.length + activeStatuses.length > 0;
  return (
    <div className="pointer-events-auto flex w-full items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {QUICK.map((q) => {
        const active =
          q.kind === "role" ? activeRoles.includes(q.value) : activeStatuses.includes(q.value);
        return (
          <button
            key={q.label}
            onClick={() => (q.kind === "role" ? onToggleRole(q.value) : onToggleStatus(q.value))}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium shadow-md backdrop-blur transition-all active:scale-95 ${
              active
                ? "bg-slate-900 text-white"
                : "bg-white/95 text-slate-700 hover:bg-white"
            }`}
          >
            {q.label}
          </button>
        );
      })}
      {anyActive && (
        <button
          onClick={onClear}
          className="shrink-0 rounded-full bg-white/95 px-3.5 py-2 text-[13px] font-semibold text-rose-600 shadow-md active:scale-95"
        >
          Clear
        </button>
      )}
      <span className="hidden">{ROLES.length}{STATUSES.length}</span>
    </div>
  );
}
