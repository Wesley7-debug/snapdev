"use client";

export type DockId = "nearby" | "filters" | "add" | "locate" | "me" | "info";

interface DockItem {
  id: DockId;
  label: string;
  badge?: string | number;
  active?: boolean;
}

interface Props {
  active: DockId | null;
  onPick: (id: DockId) => void;
  nearbyCount: number;
  hasMe: boolean;
  meHidden: boolean;
  locating: boolean;
}

function Icon({ id, hasMe }: { id: DockId; hasMe: boolean }) {
  const cls = "h-[22px] w-[22px] sm:h-[26px] sm:w-[26px]";
  switch (id) {
    case "nearby":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path
            d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2.6" fill="currentColor" />
        </svg>
      );
    case "filters":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path
            d="M4 7h10M18 7h2M4 17h4M12 17h8M4 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="7" r="2.2" fill="#fff" stroke="currentColor" strokeWidth="2" />
          <circle cx="10" cy="17" r="2.2" fill="#fff" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "add":
      // No profile yet → plus. Already have one → pencil (opens edit modal).
      if (hasMe) {
        return (
          <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
            <path
              d="M4 20l4-1L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M13.5 6.5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case "locate":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
          <path
            d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "me":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <circle cx="9" cy="10" r="1.4" fill="currentColor" />
          <circle cx="15" cy="10" r="1.4" fill="currentColor" />
          <path
            d="M8 14.5c1 1.4 2.4 2 4 2s3-0.6 4-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "info":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 11v5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="12" cy="8" r="1.4" fill="currentColor" />
        </svg>
      );
  }
}

const ORDER: DockItem[] = [
  { id: "add", label: "Add me to the map" },
  { id: "nearby", label: "Nearby builders" },
  { id: "filters", label: "Search & filters" },
  { id: "locate", label: "Go to my location" },
  { id: "me", label: "My profile" },
  { id: "info", label: "About" },
];

/**
 * SnapMap-style bottom-right dock: icons stacked vertically,
 * each in its own circle (bigger on desktop).
 * Every icon opens a modal/drawer (except locate, which flies the map).
 */
export default function SnapDock({ active, onPick, nearbyCount, hasMe, meHidden, locating }: Props) {
  return (
    <div className="absolute bottom-5 right-3 z-20 flex flex-col items-end sm:bottom-6 sm:right-4">
      <div
        role="toolbar"
        aria-label="Map actions"
        className="flex flex-col items-center gap-2 sm:gap-2.5"
      >
        {ORDER.map((item) => {
          const isActive = active === item.id;
          const disabled = item.id === "me" && !hasMe;
          const label = item.id === "add" && hasMe ? "Edit my profile" : item.label;
          const tint =
            item.id === "add" && hasMe
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
              : item.id === "me" && meHidden
                ? "bg-white/95 text-slate-400 hover:bg-white"
                : "bg-white/95 text-slate-700 hover:bg-white";
          return (
            <button
              key={item.id}
              title={label}
              aria-label={label}
              disabled={disabled}
              onClick={() => onPick(item.id)}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full shadow-xl ring-1 ring-slate-900/10 backdrop-blur transition-all active:scale-90 sm:h-14 sm:w-14 ${
                isActive ? "bg-slate-900 text-white" : `${tint} disabled:opacity-35`
              }`}
            >
              {item.id === "locate" && locating ? (
                <span className="h-[22px] w-[22px] animate-spin rounded-full border-[2.5px] border-slate-300 border-t-slate-900 sm:h-[26px] sm:w-[26px]" />
              ) : (
                <Icon id={item.id} hasMe={hasMe} />
              )}
              {item.id === "nearby" && nearbyCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10.5px] font-extrabold tabular-nums text-white ring-2 ring-white">
                  {nearbyCount > 99 ? "99+" : nearbyCount}
                </span>
              )}
              {item.id === "add" && !hasMe && (
                <span className="absolute -right-0.5 -top-0.5 h-[12px] w-[12px] rounded-full bg-amber-400 ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 hidden rounded-full bg-slate-900/70 px-3 py-1 text-[11.5px] font-medium text-white backdrop-blur sm:inline-block">
        Find who&apos;s building around you
      </p>
    </div>
  );
}
