import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Profile } from "@/models/Profile";
import { validateCreate } from "./validate";
import { applyPatch, createProfile, toOwnProfile } from "./service";

export async function GET(req: NextRequest) {
  // Owner-only lookup: the anonymousId is a device-held reclaim token, NOT
  // secure auth. This is the only endpoint that returns the owner's private
  // coords, and only to the holder. Public endpoints (/api/nearby,
  // /api/users/[username]) use toPublicProfile() and never expose them.
  try {
    const anon = req.nextUrl.searchParams.get("anonymousId");
    if (!anon) return NextResponse.json({ error: "anonymousId required" }, { status: 400 });
    await connectDB();
    const doc = await Profile.findOne({ anonymousId: anon }).lean();
    if (!doc) return NextResponse.json({ profile: null });
    return NextResponse.json({ profile: toOwnProfile(doc as never) });
  } catch {
    return NextResponse.json({ error: "failed to load profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = validateCreate(await req.json());
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    await connectDB();
    const out = await createProfile(parsed.value);
    if ("error" in out) return NextResponse.json({ error: out.error }, { status: 409 });
    const { doc, pubLng, pubLat } = out;
    return NextResponse.json({
      profile: {
        username: doc.username,
        name: doc.name,
        avatar: doc.avatar,
        role: doc.role,
        publicLng: pubLng,
        publicLat: pubLat,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "failed to create profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const anon = typeof body.anonymousId === "string" ? body.anonymousId : "";
    if (!anon) return NextResponse.json({ error: "anonymousId required" }, { status: 400 });
    await connectDB();
    const out = await applyPatch(anon, body);
    if ("error" in out) return NextResponse.json({ error: out.error }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed to update profile" }, { status: 500 });
  }
}
