import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Profile } from "@/models/Profile";
import { toPublicProfile } from "@/models/public-profile";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await ctx.params;
    await connectDB();
    const doc = await Profile.findOne({ username: username.toLowerCase(), isVisible: true }).lean();
    if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ profile: toPublicProfile(doc as never) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
