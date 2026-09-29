"use client";

import { useEffect, useRef, useState } from "react";
import { ROLES, STATUSES } from "@/lib/geo";
import type { FormState } from "./validate-form";

const INPUT = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[14px] outline-none focus:border-slate-900";
const LABEL = "mb-1 block text-[12px] font-semibold text-slate-600";

function Text(props: { label: string; value: string; ph: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className={LABEL}>{props.label}</span>
      <input value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={props.ph} className={INPUT} />
    </label>
  );
}

export default function ProfileFields({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  // Live username check — one username per user, enforced uniquely server-side.
  // Format validity is derived (no state); server result arrives in async callbacks only.
  const usernameValue = form.username.trim().toLowerCase();
  const usernameValid = /^[a-z0-9_]{2,30}$/.test(usernameValue);
  const [userCheck, setUserCheck] = useState<"idle" | "checking" | "free" | "taken">("idle");
  const reqId = useRef(0);
  useEffect(() => {
    if (!usernameValue || !usernameValid) return;
    const id = ++reqId.current;
    const t = window.setTimeout(async () => {
      if (id === reqId.current) setUserCheck("checking");
      try {
        const res = await fetch(`/api/profiles/check?username=${encodeURIComponent(usernameValue)}`);
        const data = await res.json();
        if (id === reqId.current) setUserCheck(data.taken ? "taken" : "free");
      } catch {
        if (id === reqId.current) setUserCheck("idle");
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [usernameValue, usernameValid]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Text label="Name *" value={form.name} ph="Adaeze Nwosu" onChange={(v) => set("name", v)} />
        <Text label="Username *" value={form.username} ph="ada_builds" onChange={(v) => { set("username", v.replace(/\s/g, "")); setUserCheck("idle"); }} />
      </div>
      {userCheck === "free" && usernameValid && (
        <p className="-mt-1 text-[12px] font-semibold text-emerald-600">✓ @{usernameValue} is available</p>
      )}
      {userCheck === "taken" && (
        <p className="-mt-1 text-[12px] font-semibold text-rose-600">✕ That username is taken — try another</p>
      )}
      {userCheck === "checking" && (
        <p className="-mt-1 text-[12px] font-medium text-slate-400">Checking username…</p>
      )}
      {!usernameValid && form.username.trim() && (
        <p className="-mt-1 text-[12px] font-medium text-slate-400">2–30 chars: letters, numbers, _ only</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={LABEL}>Role *</span>
          <select value={form.role} onChange={(e) => set("role", e.target.value)} className={INPUT}>
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={LABEL}>Status <span className="font-normal text-slate-400">(optional)</span></span>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={INPUT}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <Text label="X handle *" value={form.xHandle} ph="@ada_builds" onChange={(v) => set("xHandle", v)} />
      <Text label="What are you building? (optional)" value={form.building} ph="FinTrack — expense tracking" onChange={(v) => set("building", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Text label="GitHub (optional)" value={form.github} ph="adabuilds" onChange={(v) => set("github", v)} />
        <Text label="Website (optional)" value={form.website} ph="https://…" onChange={(v) => set("website", v)} />
      </div>
      <label className="block">
        <span className={LABEL}>Bio <span className="font-normal text-slate-400">(optional)</span></span>
        <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Full-stack dev who likes hackathons…" rows={2} className={`${INPUT} resize-none`} />
      </label>
    </>
  );
}
