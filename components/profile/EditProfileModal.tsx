"use client";

import { useState } from "react";
import SnapModal from "@/components/home/SnapModal";
import { ROLES, STATUSES } from "@/lib/geo";
import type { Me } from "@/hooks/useMe";

interface Props {
  me: Me;
  anonId: string;
  onClose: () => void;
  onSaved: () => void;
}

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[14px] outline-none focus:border-slate-900";
const LABEL = "mb-1 block text-[12px] font-semibold text-slate-600";

/**
 * Edit-your-profile modal. Preloaded with your current info —
 * username is shown read-only (one username per user, never changes).
 */
export default function EditProfileModal({ me, anonId, onClose, onSaved }: Props) {
  const [name, setName] = useState(me.name);
  const [role, setRole] = useState(me.role);
  const [status, setStatus] = useState(me.status);
  const [xHandle, setXHandle] = useState(me.xHandle);
  const [building, setBuilding] = useState(me.building);
  const [github, setGithub] = useState(me.github);
  const [website, setWebsite] = useState(me.website);
  const [bio, setBio] = useState(me.bio);
  const [city, setCity] = useState(me.city);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setError("");
    if (!name.trim()) return setError("Please add your name.");
    if (!xHandle.trim()) return setError("X handle is required.");
    if (!city.trim()) return setError("Please add your city / area.");
    setBusy(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousId: anonId,
          name: name.trim(),
          role,
          status,
          xHandle: xHandle.trim().replace(/^@/, ""),
          building: building.trim(),
          github: github.trim().replace(/^@/, ""),
          website: website.trim(),
          bio: bio.trim(),
          city: city.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBusy(false);
        setError((data as { error?: string }).error ?? "Couldn't save — try again.");
        return;
      }
      setBusy(false);
      onSaved();
    } catch {
      setBusy(false);
      setError("Couldn't save — check your connection and try again.");
    }
  }

  return (
    <SnapModal title="Edit profile" subtitle={`@${me.username} · username can't be changed`} onClose={onClose} wide>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={LABEL}>Name *</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
          </label>
          <label className="block">
            <span className={LABEL}>Username</span>
            <input value={`@${me.username}`} disabled className={`${INPUT} opacity-60`} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={LABEL}>Role *</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={INPUT}>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={LABEL}>Status <span className="font-normal text-slate-400">(optional)</span></span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={INPUT}>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className={LABEL}>X handle *</span>
          <input value={xHandle} onChange={(e) => setXHandle(e.target.value)} className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>What are you building? <span className="font-normal text-slate-400">(optional)</span></span>
          <input value={building} onChange={(e) => setBuilding(e.target.value)} className={INPUT} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={LABEL}>GitHub <span className="font-normal text-slate-400">(optional)</span></span>
            <input value={github} onChange={(e) => setGithub(e.target.value)} className={INPUT} />
          </label>
          <label className="block">
            <span className={LABEL}>Website <span className="font-normal text-slate-400">(optional)</span></span>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} className={INPUT} />
          </label>
        </div>
        <label className="block">
          <span className={LABEL}>Bio <span className="font-normal text-slate-400">(optional)</span></span>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className={`${INPUT} resize-none`} />
        </label>
        <label className="block">
          <span className={LABEL}>City / area *</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} className={INPUT} />
        </label>
        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13px] font-medium text-rose-700">{error}</p>
        )}
        <button
          onClick={save}
          disabled={busy}
          className="w-full rounded-2xl bg-slate-900 py-3 text-[14px] font-bold text-white active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </SnapModal>
  );
}
