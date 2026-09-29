import * as maplibregl from "maplibre-gl";
import { statusColor } from "@/lib/geo";
import { buildAvatarEl, buildClusterEl, buildPlusEl } from "./marker-el";
import { centroid, collectItems, greedyCluster } from "./cluster";
import type { MapProps } from "./MapView";

export function renderMarkers(
  map: maplibregl.Map,
  markers: { current: maplibregl.Marker[] },
  s: MapProps,
) {
  if (!map.loaded()) return;
  markers.current.forEach((m) => m.remove());
  markers.current = [];
  const push = (m: maplibregl.Marker) => markers.current.push(m);
  const items = collectItems(s.builders, s.myPos, s.showPlus);
  const pts = items.map((it, i) => {
    const lng = it.kind === "user" ? it.b.lng : it.lng;
    const lat = it.kind === "user" ? it.b.lat : it.lat;
    const p = map.project(new maplibregl.LngLat(lng, lat));
    return { it, i, x: p.x, y: p.y };
  });
  const { clusters, singles } = greedyCluster(pts);
  for (const members of clusters) {
    const c = centroid(members);
    const ll = map.unproject(new maplibregl.Point(c.x, c.y));
    const d = buildClusterEl(members.length);
    d.addEventListener("click", (e) => {
      e.stopPropagation();
      map.flyTo({
        center: ll,
        zoom: Math.min((map.getZoom() ?? 12) + 2.5, 16),
        duration: 700,
      });
    });
    push(
      new maplibregl.Marker({ element: d, anchor: "center" })
        .setLngLat(ll)
        .addTo(map),
    );
  }
  for (const pt of singles) pushSingle(map, push, s, pt.it);
}

function pushSingle(
  map: maplibregl.Map,
  push: (m: maplibregl.Marker) => void,
  s: MapProps,
  it: ReturnType<typeof collectItems>[number],
) {
  if (it.kind === "plus") {
    const d = buildPlusEl();
    d.addEventListener("click", (e) => {
      e.stopPropagation();
      s.onPlus();
    });
    return push(
      new maplibregl.Marker({ element: d, anchor: "center" })
        .setLngLat([it.lng, it.lat])
        .addTo(map),
    );
  }
  if (it.kind === "me") {
    const d = buildAvatarEl(
      s.myAvatar ?? "",
      s.myName ?? "You",
      "#0ea5e9",
      true,
      s.myDimmed ?? false,
    );
    d.addEventListener("click", (e) => {
      e.stopPropagation();
      s.onMe?.();
    });
    return push(
      new maplibregl.Marker({ element: d, anchor: "bottom" })
        .setLngLat([it.lng, it.lat])
        .addTo(map),
    );
  }
  const b = it.b;
  const d = buildAvatarEl(
    b.avatar,
    b.name,
    statusColor(b.status),
    s.selectedUsername === b.username,
  );
  d.addEventListener("click", (e) => {
    e.stopPropagation();
    s.onSelect(b);
    map.flyTo({ center: [b.lng, b.lat], duration: 900, essential: true });
  });
  push(
    new maplibregl.Marker({ element: d, anchor: "bottom" })
      .setLngLat([b.lng, b.lat])
      .addTo(map),
  );
}
