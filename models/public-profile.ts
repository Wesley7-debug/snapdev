import type { IProfile } from "./Profile";
import { haversineKm } from "@/lib/geo";

/** Serialize for PUBLIC consumption — never includes exact coords. */
export function toPublicProfile(
  doc: IProfile & { _id: unknown },
  refLng?: number,
  refLat?: number
) {
  const [lng, lat] = doc.publicLocation?.coordinates ?? [0, 0];
  const hasRef =
    refLng !== undefined &&
    refLat !== undefined &&
    Number.isFinite(refLng) &&
    Number.isFinite(refLat);
  return {
    username: doc.username,
    name: doc.name,
    avatar: doc.avatar ?? "",
    role: doc.role,
    bio: doc.bio ?? "",
    building: doc.building ?? "",
    techStack: doc.techStack ?? [],
    xHandle: doc.xHandle,
    github: doc.github ?? "",
    website: doc.website ?? "",
    status: doc.status ?? "",
    city: doc.location?.city ?? "",
    country: doc.location?.country ?? "",
    lng,
    lat,
    distanceKm: hasRef ? haversineKm(refLng!, refLat!, lng, lat) : undefined,
    createdAt: doc.createdAt,
  };
}
