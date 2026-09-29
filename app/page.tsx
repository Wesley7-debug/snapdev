"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Builder } from "@/components/ui/types";
import type { MapHandle } from "@/components/map/MapView";
import OnboardingSheet from "@/components/onboarding/OnboardingSheet";
import SnapTopBar from "@/components/home/SnapTopBar";
import SnapDock, { type DockId } from "@/components/home/SnapDock";
import SnapModal from "@/components/home/SnapModal";
import Drawer from "@/components/home/Drawer";
import FilterBar from "@/components/discovery/FilterBar";
import PublicCard from "@/app/u/[username]/PublicCard";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { avatarColor, initials } from "@/components/ui/Avatar";
import { formatDistance, matchPlaces, type Place } from "@/lib/geo";
import { useMe } from "@/hooks/useMe";
import { useBuilders, toggleList } from "@/hooks/useBuilders";
import { useMapCenter } from "@/hooks/useMapCenter";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

type ModalId = "nearby" | "filters" | "me" | "myPublic" | "edit" | "info";

type PublicPerson = Pick<
  Builder,
  | "username" | "name" | "avatar" | "role" | "bio" | "building"
  | "techStack" | "xHandle" | "github" | "website" | "status" | "city" | "country"
>;

/** Shape the full-profile card needs — shared by you + other builders. */
function toPublicProps(x: PublicPerson) {
  return { ...x };
}

/** Name/username-first ranking for live search follow. */
function matchScore(x: Builder, q: string): number {
  const name = x.name.toLowerCase();
  const un = x.username.toLowerCase();
  if (name.startsWith(q) || un.startsWith(q)) return 0;
  if (name.includes(q) || un.includes(q)) return 1;
  if ((x.building ?? "").toLowerCase().includes(q)) return 2;
  return 3;
}

export default function Home() {
  const { center, refLoc, locate, centerOn, requestLocation, locating, onMove } = useMapCenter();
  const [selected, setSelected] = useState<Builder | null>(null);
  const [modal, setModal] = useState<ModalId | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<MapHandle>(null);
  const b = useBuilders(refLoc);
  const { anonId, me, meChecked, loadMe, toggleVisibility, updateLocation } = useMe(b.loadBuilders);

  // Restore returning users: once MongoDB returns their profile, center the
  // map on their approximate PUBLIC coords (never exact) — no geolocation
  // prompt, no onboarding replay.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (me && !restoredRef.current) {
      restoredRef.current = true;
      if (Number.isFinite(me.publicLng) && Number.isFinite(me.publicLat)) {
        centerOn(me.publicLng, me.publicLat, (lng, lat, z) =>
          mapRef.current?.flyTo(lng, lat, z)
        );
      }
    }
  }, [me, centerOn]);

  // Returning profile -> avatar marker; new visitor -> "+" marker at the
  // saved (or default) location. Never force onboarding again.
  const myPos: [number, number] | null = me
    ? [me.publicLng, me.publicLat]
    : meChecked
      ? center
      : null;
  const visible = me ? b.builders.filter((x) => x.username !== me.username) : b.builders;
  const sorted = [...visible].sort((x, y) => (x.distanceKm ?? 9999) - (y.distanceKm ?? 9999));

  function pickBuilder(builder: Builder) {
    setModal(null);
    setSelected(builder);
    mapRef.current?.flyTo(builder.lng, builder.lat, 14);
  }

  // Location search: typing "Lagos" suggests places; picking one flies
  // the map there and filters to that city so you see developers there.
  const placeMatches = matchPlaces(b.query);
  const placeTimer = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (placeTimer.current) window.clearTimeout(placeTimer.current);
    };
  }, []);

  function handlePickPlace(pl: Place) {
    setModal(null);
    setSelected(null);
    mapRef.current?.flyTo(pl.lng, pl.lat, 12);
    b.setQuery(pl.city);
    // Reload once the map has arrived — the debounced query reload
    // would otherwise fetch around the previous center.
    if (placeTimer.current) window.clearTimeout(placeTimer.current);
    placeTimer.current = window.setTimeout(() => b.loadBuilders(), 1500);
  }

  // Live user search: as you type ("w" → "wa"…), debounce, then glide
  // the map to the best match — scrolling through results until one is
  // in view. Only moves when the top match is off-screen, so it never
  // fights manual panning. Never opens a drawer on its own.
  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
  });
  useEffect(() => {
    const q = b.query.trim().toLowerCase().replace(/^@/, "");
    if (q.length < 1) return;
    const t = window.setTimeout(() => {
      const list = visibleRef.current;
      if (!list.length || !mapRef.current) return;
      const ranked = [...list].sort(
        (x, y) => matchScore(x, q) - matchScore(y, q) || (x.distanceKm ?? 9999) - (y.distanceKm ?? 9999)
      );
      const top = ranked[0];
      if (top && !mapRef.current.isInView(top.lng, top.lat)) {
        mapRef.current.flyTo(top.lng, top.lat, 13);
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [b.query]);

  const [shuffling, setShuffling] = useState(false);

  /** Explore: jump to a random builder anywhere in the world + open them. */
  async function handleShuffle() {
    setLocationError(null);
    setShuffling(true);
    try {
      const loc = refLoc.current ?? [0, 0];
      const res = await fetch(`/api/nearby?lng=${loc[0]}&lat=${loc[1]}&limit=200`);
      const data = await res.json();
      const pool: Builder[] = (data.builders ?? []).filter(
        (x: Builder) => !me || x.username !== me.username
      );
      if (!pool.length) {
        setLocationError("No builders on the map yet — be the first to join!");
        return;
      }
      pickBuilder(pool[Math.floor(Math.random() * pool.length)]);
    } catch {
      setLocationError("Couldn't explore right now — check your connection.");
    } finally {
      setShuffling(false);
    }
  }

  function handleDock(id: DockId) {
    setLocationError(null);
    switch (id) {
      case "nearby":
        setSelected(null);
        setModal("nearby");
        break;
      case "filters":
        setModal("filters");
        break;
      case "add":
        // Pencil when you have a profile → edit modal preloaded with your info.
        if (me) {
          setSelected(null);
          setModal("edit");
        } else setShowOnboarding(true);
        break;
      case "shuffle":
        handleShuffle();
        break;
      case "locate":
        // Take the user to THEIR location: profile coords when known,
        // otherwise the last saved spot. No permission prompt.
        if (me && Number.isFinite(me.publicLng) && Number.isFinite(me.publicLat)) {
          mapRef.current?.flyTo(me.publicLng, me.publicLat, 14);
        } else {
          locate((lng, lat, z) => mapRef.current?.flyTo(lng, lat, z), b.loadBuilders);
        }
        break;
      case "me":
        if (me) {
          setSelected(null);
          setModal("me");
        } else {
          setShowOnboarding(true);
        }
        break;
      case "info":
        setModal("info");
        break;
    }
  }

  function handleUpdateLocation() {
    setLocationError(null);
    requestLocation(
      (lng, lat, z) => mapRef.current?.flyTo(lng, lat, z),
      async (lng, lat) => {
        try {
          if (me) {
            await updateLocation(lng, lat);
            b.loadBuilders();
          } else {
            b.loadBuilders();
          }
        } catch {
          setLocationError("Couldn't save your new location — try again.");
        }
      },
      (msg) => setLocationError(msg)
    );
  }

  const filterCount = b.roles.length + b.statuses.length;
  const dockActive: DockId | null = selected
    ? "nearby"
    : modal === "nearby"
      ? "nearby"
      : modal === "filters"
        ? "filters"
        : modal === "me" || modal === "myPublic"
          ? "me"
          : modal === "edit"
            ? "add"
            : modal === "info"
              ? "info"
              : null;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#e8efec]">
      <div className="absolute inset-0">
        <MapView
          ref={mapRef}
          builders={visible}
          center={center}
          myPos={myPos}
          myAvatar={me?.avatar}
          myName={me?.name}
          myDimmed={me ? !me.isVisible : false}
          showPlus={!me}
          selectedUsername={selected?.username ?? null}
          onSelect={( picked ) => {
            if (picked) pickBuilder(picked);
            else setSelected(null);
          }}
          onPlus={() => setShowOnboarding(true)}
          onMe={() => {
            setSelected(null);
            setModal("me");
          }}
          onMove={onMove}
        />
      </div>

      <SnapTopBar
        query={b.query}
        setQuery={b.setQuery}
        resultCount={visible.length}
        dbDown={b.dbDown}
        placeMatches={placeMatches}
        onPickPlace={handlePickPlace}
      />

      {/* SnapMap-style bottom-left icon line — every icon opens a modal
          (locate flies the map instead). */}
      <SnapDock
        active={dockActive}
        onPick={handleDock}
        nearbyCount={visible.length}
        hasMe={!!me}
        meHidden={me ? !me.isVisible : false}
        locating={locating}
        shuffling={shuffling}
      />

      {locationError && (
        <p className="absolute bottom-24 right-3 z-30 max-w-[260px] rounded-2xl bg-slate-900/90 px-3.5 py-2.5 text-[12.5px] font-medium leading-snug text-white shadow-xl sm:right-4">
          {locationError}
        </p>
      )}

      {/* ---- Modals ---- */}

      {modal === "nearby" && !selected && (
        <SnapModal
          title="Builders nearby"
          subtitle={`${visible.length} in view · tap anyone to open their card`}
          onClose={() => setModal(null)}
          wide
        >
          <div className="max-h-[55dvh] overflow-y-auto pb-1">
            {sorted.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                Nobody matches right now. Try clearing filters.
              </p>
            )}
            {sorted.map((item) => (
              <button
                key={item.username}
                onClick={() => pickBuilder(item)}
                className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                {item.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                    style={{ background: avatarColor(item.name) }}
                  >
                    {initials(item.name)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-slate-900">
                    {item.name} <span className="font-normal text-slate-400">· {item.role}</span>
                  </span>
                  <span className="block truncate text-[12px] text-slate-500">
                    {item.building ? `Building ${item.building}` : item.bio}
                  </span>
                </span>
                <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-400">
                  {formatDistance(item.distanceKm).replace(" away", "")}
                </span>
              </button>
            ))}
          </div>
        </SnapModal>
      )}

      {modal === "filters" && (
        <SnapModal
          title="Search & filters"
          subtitle={
            filterCount > 0 ? `${filterCount} filter${filterCount === 1 ? "" : "s"} on` : "Find your people"
          }
          onClose={() => setModal(null)}
          wide
        >
          <input
            value={b.query}
            onChange={(e) => b.setQuery(e.target.value)}
            placeholder="Search name, project, stack…"
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-[14px] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900"
          />
          <div className="mt-3">
            <FilterBar
              activeRoles={b.roles}
              activeStatuses={b.statuses}
              onToggleRole={(r) => toggleList(b.roles, r, b.setRoles)}
              onToggleStatus={(s) => toggleList(b.statuses, s, b.setStatuses)}
              onClear={() => {
                b.setRoles([]);
                b.setStatuses([]);
                b.setQuery("");
              }}
            />
          </div>
          <p className="mt-3 rounded-2xl bg-slate-50 px-3.5 py-2.5 text-[13px] font-medium text-slate-600">
            {visible.length} builder{visible.length === 1 ? "" : "s"} match right now.
          </p>
          <button
            onClick={() => setModal("nearby")}
            className="mt-3 w-full rounded-2xl bg-slate-900 py-3 text-[14px] font-bold text-white active:scale-[0.98]"
          >
            Show results
          </button>
        </SnapModal>
      )}

      {modal === "me" && me && (
        <SnapModal title="My profile" subtitle={`@${me.username} · visible to the map`} onClose={() => setModal(null)}>
          <div className="flex items-center gap-3">
            {me.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatar} alt={me.name} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ background: avatarColor(me.name || "me") }}
              >
                {initials(me.name || "me")}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-[16px] font-bold text-slate-900">{me.name}</p>
              <p className="truncate text-[13px] text-slate-500">{me.role}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <button
              onClick={handleUpdateLocation}
              disabled={locating}
              className="w-full rounded-2xl bg-slate-100 py-3 text-[14px] font-bold text-slate-900 active:scale-[0.98] disabled:opacity-60"
            >
              {locating ? "Updating location…" : "📍 Update my location"}
            </button>
            <button
              onClick={toggleVisibility}
              className="w-full rounded-2xl bg-slate-100 py-3 text-[14px] font-bold text-slate-900 active:scale-[0.98]"
            >
              {me.isVisible ? "👁 Hide me from the map" : "🚫 Show me on the map"}
            </button>
            <button
              onClick={() => setModal("myPublic")}
              className="w-full rounded-2xl bg-slate-900 py-3 text-[14px] font-bold text-white active:scale-[0.98]"
            >
              View my public profile
            </button>
          </div>
        </SnapModal>
      )}

      {/* Your public profile as everyone else sees it — drawer, no routing */}
      {modal === "myPublic" && me && (
        <Drawer onClose={() => setModal(null)} label="My public profile" size="lg">
          <div className="px-4 pb-5 pt-1">
            <PublicCard profile={toPublicProps(me)} />
          </div>
        </Drawer>
      )}

      {/* Edit your profile — preloaded with your info */}
      {modal === "edit" && me && (
        <EditProfileModal
          me={me}
          anonId={anonId}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            loadMe(anonId);
            b.loadBuilders();
          }}
        />
      )}

      {modal === "info" && (
        <SnapModal title="About snapdev" subtitle="Snap Map for builders" onClose={() => setModal(null)}>
          <div className="space-y-3 text-[13.5px] leading-relaxed text-slate-600">
            <p>
              <span className="font-bold text-slate-900">snapdev</span> shows who&apos;s building
              around you — developers, founders, designers — on a live map.
            </p>
            <ul className="space-y-2">
              <li>＋ <b className="text-slate-800">Add</b> — join the map in 30 seconds, then ✏️ edit anytime.</li>
              <li>🎲 <b className="text-slate-800">Explore</b> — jump to a random builder anywhere in the world.</li>
              <li>📍 <b className="text-slate-800">Nearby</b> — browse builders in view.</li>
              <li>🎛 <b className="text-slate-800">Filters</b> — narrow by role or status.</li>
              <li>◎ <b className="text-slate-800">Locate</b> — jump back to your spot.</li>
              <li>☺ <b className="text-slate-800">Me</b> — manage visibility & location.</li>
            </ul>
            <p className="rounded-2xl bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-900">
              Privacy first: only an approximate public location is ever shown — never your exact
              spot.
            </p>
            <p className="pt-1 text-center text-[13px] font-medium text-slate-500">
              Built by SlyCodez ·{" "}
              <a
                href="https://x.com/slycodez"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900"
              >
                𝕏 @slycodez
              </a>
            </p>
          </div>
        </SnapModal>
      )}

      {/* Selected builder — full profile straight in the drawer, no mini card */}
      {selected && (
        <Drawer onClose={() => setSelected(null)} label={`${selected.name}'s profile`} size="lg">
          <div className="px-4 pb-5 pt-1">
            <PublicCard profile={toPublicProps(selected)} />
          </div>
        </Drawer>
      )}

      {showOnboarding && (
        <OnboardingSheet
          defaultLng={refLoc.current[0]}
          defaultLat={refLoc.current[1]}
          onClose={() => setShowOnboarding(false)}
          onCreated={() => {
            setShowOnboarding(false);
            loadMe(anonId);
            b.loadBuilders();
          }}
        />
      )}
    </div>
  );
}
