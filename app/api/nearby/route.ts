import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Profile } from "@/models/Profile";
import { toPublicProfile } from "@/models/public-profile";

/**
 * GET /api/nearby?lng=&lat=&roles=Developer,Founder&statuses=Hiring&q=sarah&limit=100
 * Returns ONLY obfuscated public coords + distance. Never exact location.
 */
export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    const lng = Number(p.get("lng"));
    const lat = Number(p.get("lat"));
    const hasRef = Number.isFinite(lng) && Number.isFinite(lat);
    const roles = (p.get("roles") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const statuses = (p.get("statuses") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    // Leading "@" stripped so "@ada" finds username "ada_builds".
    const q = (p.get("q") ?? "").trim().toLowerCase().replace(/^@/, "");
    const limit = Math.min(200, Math.max(1, Number(p.get("limit")) || 100));

    await connectDB();

    const filter: Record<string, unknown> = { isVisible: true };
    if (roles.length) filter.role = { $in: roles };
    if (statuses.length) filter.status = { $in: statuses };

    let docs;
    if (hasRef) {
      docs = await Profile.find({
        ...filter,
        publicLocation: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: 150_000,
          },
        },
      })
        .limit(limit)
        .lean();
    } else {
      docs = await Profile.find(filter).sort({ updatedAt: -1 }).limit(limit).lean();
    }

    let out = docs.map((d) =>
      toPublicProfile(d as never, hasRef ? lng : undefined, hasRef ? lat : undefined)
    );

    if (q) {
      out = out.filter((u) =>
        [u.name, u.username, u.building, u.role, u.city, ...(u.techStack ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return NextResponse.json({ builders: out, count: out.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "failed to load builders", builders: [] }, { status: 500 });
  }
}
