import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Profile } from "@/models/Profile";
import { toPublicProfile } from "@/models/public-profile";
import PublicCard from "./PublicCard";

export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let profile = null;
  try {
    await connectDB();
    const doc = await Profile.findOne({ username: username.toLowerCase(), isVisible: true }).lean();
    if (doc) profile = toPublicProfile(doc as never);
  } catch {
    /* db not configured — show friendly state below */
  }
  if (!profile) notFound();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#eef2f5] px-4 pb-10 pt-6">
      <Link href="/" className="mb-4 inline-flex w-fit items-center gap-2 text-[13.5px] font-semibold text-slate-600">
        ← <span className="font-extrabold text-slate-900">markdev</span> map
      </Link>
      <PublicCard profile={profile} />
      <p className="mt-6 text-center text-[12.5px] text-slate-400">
        markdev — find who&apos;s building around you.
      </p>
    </div>
  );
}
