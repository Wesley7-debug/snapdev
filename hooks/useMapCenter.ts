"use client";

import { useRef, useState } from "react";
import { DEFAULT_CENTER } from "@/lib/geo";
import { loadSavedLocation, saveLocation } from "@/lib/client-location";

/**
 * Map center state WITHOUT automatic geolocation prompts.
 *
 * - Initial center comes from the locally persisted approved location
 *   (saved during onboarding or via "Update my location"), else DEFAULT_CENTER.
 * - Browser geolocation is ONLY requested from explicit user gestures via
 *   requestLocation(). Never on mount, never on every visit.
 * - Callers persist meaningful updates with saveCenter(); plain map pans
 *   (onMove) only update the in-memory ref used for nearby queries.
 */

function initialCenter(): [number, number] {
  const saved = loadSavedLocation();
  if (saved) return [saved.lng, saved.lat];
  return DEFAULT_CENTER;
}

export function useMapCenter() {
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const refLoc = useRef<[number, number]>(initialCenter());
  const [locating, setLocating] = useState(false);

  /** Fly to the current known location. No permission prompt. */
  function locate(flyTo: (lng: number, lat: number, zoom?: number) => void, onDone?: () => void) {
    const [lng, lat] = refLoc.current;
    setCenter([lng, lat]);
    flyTo(lng, lat, 13);
    onDone?.();
  }

  /** Center the map on an externally restored location (e.g. profile public coords). */
  function centerOn(lng: number, lat: number, flyTo?: (lng: number, lat: number, zoom?: number) => void) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
    refLoc.current = [lng, lat];
    setCenter([lng, lat]);
    if (flyTo) flyTo(lng, lat, 13);
  }

  /**
   * Explicit "Update my location" — the ONLY path that triggers a browser
   * permission prompt. Persists the approved coords locally; callers also
   * persist to MongoDB when the user has a profile.
   */
  function requestLocation(
    flyTo: (lng: number, lat: number, zoom?: number) => void,
    onDone?: (lng: number, lat: number) => void,
    onError?: (message: string) => void
  ) {
    if (!navigator.geolocation) {
      onError?.("Geolocation isn't supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const c: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        refLoc.current = c;
        setCenter(c);
        saveLocation(c[0], c[1], "gps");
        flyTo(c[0], c[1], 13);
        onDone?.(c[0], c[1]);
      },
      () => {
        setLocating(false);
        onError?.("Location permission was denied — your saved location is unchanged.");
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  function onMove(lng: number, lat: number) {
    refLoc.current = [lng, lat];
  }

  return { center, refLoc, locate, centerOn, requestLocation, locating, onMove };
}
