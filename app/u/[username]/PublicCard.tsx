import { avatarColor, initials } from "@/components/ui/Avatar";
import { statusColor } from "@/lib/geo";

interface P {
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
}

export default function PublicCard({ profile: p }: { profile: P }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
      <div className="bg-slate-900 px-6 pb-6 pt-8 text-center">
        {p.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatar} alt={p.name} className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-white/20" />
        ) : (
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black text-white ring-4 ring-white/20" style={{ background: avatarColor(p.name) }}>
            {initials(p.name)}
          </span>
        )}
        <h1 className="mt-3 text-[20px] font-extrabold text-white">{p.name}</h1>
        <p className="text-[13.5px] text-slate-300">{p.role} · @{p.username}</p>
        {p.status && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white">
            <span className="h-2 w-2 rounded-full" style={{ background: statusColor(p.status) }} />
            {p.status}
          </span>
        )}
      </div>
      <div className="space-y-3 px-6 py-5">
        {p.bio && <p className="text-[14px] leading-relaxed text-slate-600">{p.bio}</p>}
        {p.building && (
          <p className="text-[14px] text-slate-700">
            <span className="text-slate-400">Building </span>
            <span className="font-bold">{p.building}</span>
          </p>
        )}
        {p.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {p.techStack.map((t) => (
              <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-600">
                {t}
              </span>
            ))}
          </div>
        )}
        <Links p={p} />
        {(p.city || p.country) && (
          <p className="text-[13px] text-slate-400">
            📍 {[p.city, p.country].filter(Boolean).join(", ")} (approximate)
          </p>
        )}
      </div>
    </div>
  );
}

function Links({ p }: { p: P }) {
  const rows: { label: string; href: string }[] = [];
  if (p.xHandle) rows.push({ label: `𝕏 @${p.xHandle.replace(/^@/, "")}`, href: `https://x.com/${p.xHandle.replace(/^@/, "")}` });
  if (p.github) rows.push({ label: `GitHub · ${p.github.replace(/^@/, "")}`, href: `https://github.com/${p.github.replace(/^@/, "")}` });
  if (p.website) rows.push({ label: p.website.replace(/^https?:\/\//, ""), href: p.website.startsWith("http") ? p.website : `https://${p.website}` });
  if (!rows.length) return null;
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <a key={r.href} href={r.href} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-800 active:bg-slate-100">
          {r.label} ↗
        </a>
      ))}
    </div>
  );
}
