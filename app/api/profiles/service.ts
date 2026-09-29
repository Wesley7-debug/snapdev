import { Profile } from "@/models/Profile";
import { jitterPublicCoords, ROLES, STATUSES } from "@/lib/geo";
import { cleanStr, parseTechStack, validLngLat, type CreateInput } from "./validate";

/** Own-profile payload (includes private coords — only ever sent to self). */
export function toOwnProfile(doc: Record<string, unknown>) {
  const loc = doc.location as { city?: string; country?: string; coordinates?: number[] };
  const pub = doc.publicLocation as { coordinates?: number[] };
  return {
    username: doc.username,
    name: doc.name,
    avatar: (doc.avatar as string) ?? "",
    role: doc.role,
    bio: (doc.bio as string) ?? "",
    building: (doc.building as string) ?? "",
    techStack: (doc.techStack as string[]) ?? [],
    xHandle: doc.xHandle,
    github: (doc.github as string) ?? "",
    website: (doc.website as string) ?? "",
    status: (doc.status as string) ?? "",
    city: loc?.city ?? "",
    country: loc?.country ?? "",
    lng: loc?.coordinates?.[0],
    lat: loc?.coordinates?.[1],
    publicLng: pub?.coordinates?.[0],
    publicLat: pub?.coordinates?.[1],
    isVisible: doc.isVisible,
  };
}

export async function createProfile(v: CreateInput) {
  const clash = await Profile.findOne({
    $or: [{ anonymousId: v.anonymousId }, { username: v.username }],
  }).lean();
  if (clash) {
    const takenUser = (clash as { username?: string }).username === v.username;
    return { error: takenUser ? "username is taken" : "this device already has a profile" };
  }
  const [pubLng, pubLat] = jitterPublicCoords(v.lng, v.lat);
  const doc = await Profile.create({
    ...v,
    location: { type: "Point", coordinates: [v.lng, v.lat], city: v.city, country: v.country },
    publicLocation: { type: "Point", coordinates: [pubLng, pubLat] },
    isVisible: true,
  });
  return { doc, pubLng, pubLat };
}

const UPDATABLE = ["name", "avatar", "role", "bio", "building", "xHandle", "github", "website", "status", "city", "country", "isVisible"] as const;

export async function applyPatch(anonymousId: string, body: Record<string, unknown>) {
  const doc = await Profile.findOne({ anonymousId });
  if (!doc) return { error: "profile not found" };
  for (const key of UPDATABLE) {
    if (body[key] === undefined) continue;
    if (key === "isVisible") {
      doc.isVisible = Boolean(body.isVisible);
      continue;
    }
    const v = cleanStr(body[key], key === "bio" ? 280 : 200);
    if (key === "role" && v && !(ROLES as readonly string[]).includes(v)) continue;
    if (key === "status" && v && !(STATUSES as readonly string[]).includes(v)) continue;
    if (key === "city") doc.location.city = v;
    else if (key === "country") doc.location.country = v;
    else if (key === "xHandle" || key === "github") doc[key] = v.replace(/^@/, "");
    else (doc as unknown as Record<string, unknown>)[key] = v;
  }
  if (body.techStack !== undefined) doc.techStack = parseTechStack(body.techStack);
  const lng = Number(body.lng);
  const lat = Number(body.lat);
  if (body.lng !== undefined && body.lat !== undefined && validLngLat(lng, lat)) {
    doc.location.coordinates = [lng, lat];
    doc.publicLocation.coordinates = jitterPublicCoords(lng, lat);
  }
  await doc.save();
  return { ok: true };
}
