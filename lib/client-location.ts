"use client";

/**
 * Lightweight client-side store for the user's approved/selected location.
 *
 * This exists so we NEVER request browser geolocation permission on every
 * visit. Flow:
 *  - Onboarding (or an explicit "Update my location" action) captures an
 *    approved location -> saveLocation().
 *  - On future visits, useMapCenter initializes the map from here (or from
 *    the profile's approximate public coords) with zero permission prompts.
 *
 * MongoDB remains the source of truth for the profile's location; this is
 * only a local convenience cache of what the user already approved.
 */

export const LOCATION_KEY = "snapdev_location";
// Pre-rebrand key — read as fallback so returning users keep their spot.
const LEGACY_LOCATION_KEY = "markdev_location";

export type LocationSource = "gps" | "place" | "profile" | "map";

export interface SavedLocation {
  lng: number;
  lat: number;
  source: LocationSource;
  updatedAt: number;
}

export function validLngLat(lng: number, lat: number): boolean {
  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

export function loadSavedLocation(): SavedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCATION_KEY) ?? window.localStorage.getItem(LEGACY_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedLocation>;
    const lng = Number(parsed.lng);
    const lat = Number(parsed.lat);
    if (!validLngLat(lng, lat)) return null;
    return {
      lng,
      lat,
      source: parsed.source ?? "map",
      updatedAt: Number(parsed.updatedAt) || 0,
    };
  } catch {
    return null;
  }
}

export function saveLocation(lng: number, lat: number, source: LocationSource = "gps"): void {
  if (typeof window === "undefined") return;
  if (!validLngLat(lng, lat)) return;
  try {
    const payload: SavedLocation = { lng, lat, source, updatedAt: Date.now() };
    window.localStorage.setItem(LOCATION_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}
