import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Profile } from "@/models/Profile";

/**
 * GET /api/profiles/check?username=ada_builds
 * Live username-availability check for onboarding.
 * Usernames are unique (one per user) — enforced here, at creation (409),
 * and by a unique DB index.
 */
export async function GET(req: NextRequest) {
  const username = (req.nextUrl.searchParams.get("username") ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
  if (!/^[a-z0-9_]{2,30}$/.test(username)) {
    return NextResponse.json({ taken: false, valid: false });
  }
  try {
    await connectDB();
    const doc = await Profile.findOne({ username }).select("_id").lean();
    return NextResponse.json({ taken: !!doc, valid: true });
  } catch {
    return NextResponse.json({ taken: false, valid: true });
  }
}
