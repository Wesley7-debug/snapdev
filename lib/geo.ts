export const ROLES = [
  "Developer",
  "Founder",
  "Designer",
  "Product",
  "Student",
  "AI Engineer",
  "Other",
] as const;

export const STATUSES = [
  "Building",
  "Looking to collaborate",
  "Looking for cofounder",
  "Hiring",
  "Open to opportunities",
  "Just exploring",
] as const;

export type Role = (typeof ROLES)[number];
export type Status = (typeof STATUSES)[number];

/** Status -> dot color */
export const STATUS_COLORS: Record<string, string> = {
  Building: "#22c55e",
  "Looking to collaborate": "#3b82f6",
  "Looking for cofounder": "#f59e0b",
  Hiring: "#a855f7",
  "Open to opportunities": "#14b8a6",
  "Just exploring": "#94a3b8",
};

export function statusColor(status?: string): string {
  if (!status) return "#94a3b8";
  return STATUS_COLORS[status] ?? "#94a3b8";
}

/**
 * Jitter a coordinate pair so the public location is approximate.
 * Offsets by ~300-800m in a random direction.
 */
export function jitterPublicCoords(lng: number, lat: number): [number, number] {
  const angle = Math.random() * Math.PI * 2;
  // ~0.003 - 0.007 degrees ≈ 330m - 780m
  const dist = 0.003 + Math.random() * 0.004;
  const dLng = (Math.cos(angle) * dist) / Math.max(0.3, Math.cos((lat * Math.PI) / 180));
  const dLat = Math.sin(angle) * dist;
  return [lng + dLng, lat + dLat];
}

export function haversineKm(aLng: number, aLat: number, bLng: number, bLat: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const a =
    s1 * s1 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function formatDistance(km?: number): string {
  if (km === undefined || km === null || Number.isNaN(km)) return "nearby";
  if (km < 1) return `~${Math.max(100, Math.round(km * 1000 / 100) * 100)} m away`;
  if (km < 10) return `~${km.toFixed(1)} km away`;
  return `~${Math.round(km)} km away`;
}

/** Port Harcourt fallback center */
export const DEFAULT_CENTER: [number, number] = [6.9999, 4.7766];

export interface Place {
  label: string;
  city: string;
  country: string;
  lng: number;
  lat: number;
}

/** Selectable/searchable places (approximate centers) */
export const PLACES: Place[] = [
  { label: "GRA, Port Harcourt", city: "Port Harcourt", country: "Nigeria", lng: 7.003, lat: 4.815 },
  { label: "Uniport / Choba", city: "Port Harcourt", country: "Nigeria", lng: 6.914, lat: 4.9 },
  { label: "Eliozu", city: "Port Harcourt", country: "Nigeria", lng: 7.03, lat: 4.85 },
  { label: "Woji / Trans Amadi", city: "Port Harcourt", country: "Nigeria", lng: 7.035, lat: 4.805 },
  { label: "D-Line", city: "Port Harcourt", country: "Nigeria", lng: 6.995, lat: 4.79 },
  { label: "Ikeja, Lagos", city: "Lagos", country: "Nigeria", lng: 3.352, lat: 6.602 },
  { label: "Lekki, Lagos", city: "Lagos", country: "Nigeria", lng: 3.478, lat: 6.448 },
  { label: "Yaba, Lagos", city: "Lagos", country: "Nigeria", lng: 3.379, lat: 6.51 },
  { label: "Victoria Island, Lagos", city: "Lagos", country: "Nigeria", lng: 3.422, lat: 6.428 },
  { label: "Wuse, Abuja", city: "Abuja", country: "Nigeria", lng: 7.482, lat: 9.064 },
  { label: "Garki, Abuja", city: "Abuja", country: "Nigeria", lng: 7.485, lat: 9.026 },
  { label: "Maitama, Abuja", city: "Abuja", country: "Nigeria", lng: 7.448, lat: 9.082 },
  { label: "Bodija, Ibadan", city: "Ibadan", country: "Nigeria", lng: 3.914, lat: 7.429 },
  { label: "Fagge, Kano", city: "Kano", country: "Nigeria", lng: 8.516, lat: 12.002 },
  { label: "GRA, Enugu", city: "Enugu", country: "Nigeria", lng: 7.511, lat: 6.458 },
  { label: "GRA, Benin City", city: "Benin City", country: "Nigeria", lng: 5.615, lat: 6.333 },
  { label: "Ikenegbu, Owerri", city: "Owerri", country: "Nigeria", lng: 7.03, lat: 5.48 },
  { label: "Osongama, Uyo", city: "Uyo", country: "Nigeria", lng: 7.91, lat: 5.03 },
  { label: "Marian, Calabar", city: "Calabar", country: "Nigeria", lng: 8.33, lat: 4.95 },
  { label: "Rayfield, Jos", city: "Jos", country: "Nigeria", lng: 8.89, lat: 9.93 },
  { label: "Barnawa, Kaduna", city: "Kaduna", country: "Nigeria", lng: 7.44, lat: 10.52 },
  { label: "Tanke, Ilorin", city: "Ilorin", country: "Nigeria", lng: 4.55, lat: 8.5 },
  { label: "Kuto, Abeokuta", city: "Abeokuta", country: "Nigeria", lng: 3.35, lat: 7.15 },
  { label: "Effurun, Warri", city: "Warri", country: "Nigeria", lng: 5.75, lat: 5.52 },
  { label: "Awka, Anambra", city: "Awka", country: "Nigeria", lng: 7.08, lat: 6.21 },
  { label: "Onitsha, Anambra", city: "Onitsha", country: "Nigeria", lng: 6.78, lat: 6.17 },
];

/**
 * Match a search string against known places (for "Lagos"-style
 * location search). City-exact matches rank first.
 */
export function matchPlaces(query: string, limit = 6): Place[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const scored: { p: Place; rank: number }[] = [];
  for (const p of PLACES) {
    const label = p.label.toLowerCase();
    const city = p.city.toLowerCase();
    if (city === q) scored.push({ p, rank: 0 });
    else if (label.startsWith(q) || city.startsWith(q)) scored.push({ p, rank: 1 });
    else if (label.includes(q) || city.includes(q)) scored.push({ p, rank: 2 });
  }
  return scored
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map((s) => s.p);
}
