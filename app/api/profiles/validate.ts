import { ROLES, STATUSES } from "@/lib/geo";

export function cleanStr(v: unknown, max = 200): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export function cleanHandle(v: unknown): string {
  return cleanStr(v, 40).replace(/^@/, "");
}

export function parseTechStack(v: unknown): string[] {
  const list = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  return list.map((t) => cleanStr(t, 30)).filter(Boolean).slice(0, 12);
}

export interface CreateInput {
  anonymousId: string;
  name: string;
  username: string;
  role: string;
  xHandle: string;
  city: string;
  country: string;
  lng: number;
  lat: number;
  avatar: string;
  bio: string;
  building: string;
  techStack: string[];
  github: string;
  website: string;
  status: string;
}

export function validateCreate(body: Record<string, unknown>):
  | { ok: true; value: CreateInput }
  | { ok: false; error: string } {
  const anonymousId = cleanStr(body.anonymousId, 80);
  const name = cleanStr(body.name, 60);
  const username = cleanStr(body.username, 30).toLowerCase().replace(/^@/, "");
  const role = cleanStr(body.role, 30);
  const xHandle = cleanHandle(body.xHandle);
  const city = cleanStr(body.city, 80);
  const lng = Number(body.lng);
  const lat = Number(body.lat);
  if (!anonymousId) return { ok: false, error: "anonymousId required" };
  if (!name) return { ok: false, error: "name is required" };
  if (!/^[a-z0-9_]{2,30}$/.test(username))
    return { ok: false, error: "username: 2-30 chars, letters/numbers/_" };
  if (!(ROLES as readonly string[]).includes(role))
    return { ok: false, error: "pick a valid role" };
  if (!xHandle) return { ok: false, error: "X handle is required" };
  if (!city) return { ok: false, error: "location / city is required" };
  if (!validLngLat(lng, lat)) return { ok: false, error: "valid coordinates required" };
  const status = cleanStr(body.status, 40);
  return {
    ok: true,
    value: {
      anonymousId, name, username, role, xHandle, city, lng, lat,
      country: cleanStr(body.country, 80) || "Nigeria",
      avatar: cleanStr(body.avatar, 500),
      bio: cleanStr(body.bio, 280),
      building: cleanStr(body.building, 80),
      techStack: parseTechStack(body.techStack),
      github: cleanStr(body.github, 100).replace(/^@/, ""),
      website: cleanStr(body.website, 200),
      status: (STATUSES as readonly string[]).includes(status) ? status : "Building",
    },
  };
}

export function validLngLat(lng: number, lat: number): boolean {
  return Number.isFinite(lng) && Number.isFinite(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}
