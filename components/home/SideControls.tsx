"use client";

interface Props {
  onLocate: () => void;
  canHide: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
  /** Explicit "Update my location" — requests permission, persists to MongoDB. */
  canUpdateLocation: boolean;
  updatingLocation: boolean;
  locationError: string | null;
  onUpdateLocation: () => void;
}

export default function SideControls({
  onLocate,
  canHide,
  isVisible,
  onToggleVisibility,
  canUpdateLocation,
  updatingLocation,
  locationError,
  onUpdateLocation,
}: Props) {
  return (
    <div className="absolute bottom-24 right-3 z-10 flex flex-col items-end gap-2 sm:bottom-8 sm:right-4">
      {locationError && (
        <p className="max-w-[220px] rounded-xl bg-slate-900/85 px-3 py-2 text-[12px] font-medium leading-snug text-white shadow-lg">
          {locationError}
        </p>
      )}
      <button
        onClick={onLocate}
        aria-label="Go to my saved location"
        title="Go to my saved location (no location request)"
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[18px] shadow-lg active:scale-95"
      >
        ◎
      </button>
      {canUpdateLocation && (
        <button
          onClick={onUpdateLocation}
          disabled={updatingLocation}
          aria-label="Update my location"
          title="Update my location (asks for location permission)"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[18px] shadow-lg active:scale-95 disabled:opacity-60"
        >
          {updatingLocation ? "…" : "📍"}
        </button>
      )}
      {canHide && (
        <button
          onClick={onToggleVisibility}
          aria-label="Toggle visibility"
          title={isVisible ? "Hide me from map" : "Show me on map"}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[18px] shadow-lg active:scale-95"
        >
          {isVisible ? "👁" : "🚫"}
        </button>
      )}
    </div>
  );
}
