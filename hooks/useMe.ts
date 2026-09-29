"use client";

import { useCallback, useEffect, useState } from "react";
import { getOrCreateAnonymousId } from "@/lib/anonymous-id";
import { saveLocation } from "@/lib/client-location";

/** Own profile as restored from MongoDB (source of truth). */
export interface Me {
  username: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
  building: string;
  techStack: string[];
  xHandle: string;
  github: string;
  website: string;
  status: string;
  city: string;
  country: string;
  /** Approximate PUBLIC coords — safe to render on the map. */
  publicLng: number;
  publicLat: number;
  isVisible: boolean;
}

function toMe(p: Record<string, unknown>): Me | null {
  if (!p || typeof p.username !== "string") return null;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  return {
    username: str(p.username),
    name: str(p.name),
    avatar: str(p.avatar),
    role: str(p.role),
    bio: str(p.bio),
    building: str(p.building),
    techStack: arr(p.techStack),
    xHandle: str(p.xHandle),
    github: str(p.github),
    website: str(p.website),
    status: str(p.status),
    city: str(p.city),
    country: str(p.country),
    publicLng: num(p.publicLng),
    publicLat: num(p.publicLat),
    isVisible: p.isVisible !== false,
  };
}

export function useMe(onChanged?: () => void) {
  const [anonId, setAnonId] = useState("");
  const [me, setMe] = useState<Me | null>(null);
  // True once we have asked MongoDB (hit or miss) — lets callers
  // distinguish "still loading" from "no profile, show + marker".
  const [meChecked, setMeChecked] = useState(false);

  useEffect(() => {
    setAnonId(getOrCreateAnonymousId());
  }, []);

  const loadMe = useCallback(async (id: string) => {
    if (!id) return null;
    try {
      const res = await fetch(`/api/profiles?anonymousId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.profile) {
        const parsed = toMe(data.profile as Record<string, unknown>);
        setMe(parsed);
        // Cache the approved location locally so future visits never
        // need a geolocation prompt just to center the map.
        if (
          parsed &&
          Number.isFinite(parsed.publicLng) &&
          Number.isFinite(parsed.publicLat)
        ) {
          saveLocation(parsed.publicLng, parsed.publicLat, "profile");
        }
        return parsed;
      }
      setMe(null);
      return null;
    } catch {
      /* offline — map still renders */
      return null;
    } finally {
      setMeChecked(true);
    }
  }, []);

  useEffect(() => {
    if (anonId) loadMe(anonId);
  }, [anonId, loadMe]);

  async function toggleVisibility() {
    if (!me) return;
    const next = !me.isVisible;
    setMe({ ...me, isVisible: next });
    try {
      await fetch("/api/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonymousId: anonId, isVisible: next }),
      });
      onChanged?.();
    } catch {
      setMe({ ...me, isVisible: !next });
    }
  }

  /**
   * Explicit "Update my location": persists new approved coords to
   * MongoDB (server re-jitters the public coords) then refreshes local
   * state. Only called from a user gesture — never automatically.
   */
  async function updateLocation(lng: number, lat: number): Promise<Me | null> {
    if (!me || !anonId) return null;
    const res = await fetch("/api/profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonymousId: anonId, lng, lat }),
    });
    if (!res.ok) throw new Error("failed to update location");
    const refreshed = await loadMe(anonId);
    onChanged?.();
    return refreshed;
  }

  return { anonId, me, meChecked, loadMe, toggleVisibility, updateLocation };
}
