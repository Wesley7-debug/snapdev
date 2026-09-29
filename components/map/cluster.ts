import type { Builder } from "../ui/types";

export type MarkerItem =
  | { kind: "plus"; lng: number; lat: number }
  | { kind: "me"; lng: number; lat: number }
  | { kind: "user"; b: Builder };

export function collectItems(builders: Builder[], myPos: [number, number] | null, showPlus: boolean): MarkerItem[] {
  const items: MarkerItem[] = [];
  if (showPlus && myPos) items.push({ kind: "plus", lng: myPos[0], lat: myPos[1] });
  else if (!showPlus && myPos) items.push({ kind: "me", lng: myPos[0], lat: myPos[1] });
  for (const b of builders) items.push({ kind: "user", b });
  return items;
}

export interface Pt {
  it: MarkerItem;
  i: number;
  x: number;
  y: number;
}

/** Greedy screen-space clustering. "+" and "me" never cluster — your own avatar always stays whole. */
export function greedyCluster(pts: Pt[], radius = 56): { clusters: Pt[][]; singles: Pt[] } {
  const taken = new Set<number>();
  const clusters: Pt[][] = [];
  const singles: Pt[] = [];
  const solo = (kind: string) => kind === "plus" || kind === "me";
  for (const pt of pts) {
    if (solo(pt.it.kind) || taken.has(pt.i)) {
      if (solo(pt.it.kind)) singles.push(pt);
      continue;
    }
    const near = pts.filter(
      (q) => !solo(q.it.kind) && !taken.has(q.i) && Math.hypot(q.x - pt.x, q.y - pt.y) < radius
    );
    if (near.length > 1) {
      near.forEach((q) => taken.add(q.i));
      clusters.push(near);
    } else {
      taken.add(pt.i);
      singles.push(pt);
    }
  }
  return { clusters, singles };
}

export function centroid(members: Pt[]): { x: number; y: number } {
  return {
    x: members.reduce((a, q) => a + q.x, 0) / members.length,
    y: members.reduce((a, q) => a + q.y, 0) / members.length,
  };
}
