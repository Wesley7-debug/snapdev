/**
 * Snapdev map configuration — engine + basemap provider in one place.
 *
 * Engine: MapLibre GL JS (open source, no token, no credit card).
 * Basemap provider: CARTO free vector basemaps (no API key required).
 *
 * To change the basemap provider later (e.g. Stadia, Jawg, self-hosted
 * tiles), only this module needs to change: return a different MapLibre
 * `style` URL/object from `getMapStyle()`. Nothing in MapView,
 * render-markers, or page.tsx depends on CARTO specifics.
 *
 * Env overrides (all optional):
 * - NEXT_PUBLIC_MAP_STYLE: full style URL or inline style JSON string.
 *   Takes precedence over everything below.
 * - NEXT_PUBLIC_CARTO_BASEMAP: "voyager" (default) | "positron" | "dark-matter".
 */

import * as maplibregl from "maplibre-gl";

export type CartoBasemap = "voyager" | "positron" | "dark-matter";

const CARTO_STYLES: Record<CartoBasemap, string> = {
  voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  positron: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  "dark-matter":
    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

// Voyager is Snapdev's default: warm and detailed enough to make builder
// discovery feel alive, while staying light like the previous map.
// Positron is the quieter alternative (set NEXT_PUBLIC_CARTO_BASEMAP=positron).
const DEFAULT_BASEMAP: CartoBasemap = "voyager";

function configuredBasemap(): CartoBasemap {
  const raw = (process.env.NEXT_PUBLIC_CARTO_BASEMAP ?? "")
    .trim()
    .toLowerCase();
  if (raw === "positron" || raw === "dark-matter" || raw === "voyager")
    return raw;
  return DEFAULT_BASEMAP;
}

/** Resolve the MapLibre `style` — URL string or inline style object. */
export function getMapStyle(): string {
  const override = (process.env.NEXT_PUBLIC_MAP_STYLE ?? "").trim();
  if (override) return override;
  return CARTO_STYLES[configuredBasemap()];
}

export function getBasemapName(): CartoBasemap {
  if ((process.env.NEXT_PUBLIC_MAP_STYLE ?? "").trim())
    return configuredBasemap();
  return configuredBasemap();
}

/**
 * Point MapLibre at the self-hosted worker bundle.
 *
 * MapLibre spawns a separate Web Worker (maplibre-gl-worker.mjs) to parse
 * tiles off the main thread. Under Next.js/Turbopack the default
 * `import.meta.url`-based worker URL resolves to a non-existent chunk, so the
 * worker fails to load and no tiles render. We ship the worker (and its
 * shared chunk) in /public and point MapLibre there instead.
 */
export function configureMapLibreWorker() {
  maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
}

/** Shared camera defaults so zoom/feel stay consistent if style changes. */
export const MAP_DEFAULTS = {
  zoom: 12,
  minZoom: 2,
  flyDuration: 1400,
} as const;
