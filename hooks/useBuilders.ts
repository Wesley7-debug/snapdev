"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { Builder } from "@/components/ui/types";

export function useBuilders(refLoc: RefObject<[number, number]>) {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [query, setQuery] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [dbDown, setDbDown] = useState(false);
  const filtersRef = useRef({ query, roles, statuses });
  filtersRef.current = { query, roles, statuses };

  const loadBuilders = useCallback(async () => {
    const f = filtersRef.current;
    const loc = refLoc.current ?? [0, 0];
    const params = new URLSearchParams({ lng: String(loc[0]), lat: String(loc[1]), limit: "120" });
    if (f.roles.length) params.set("roles", f.roles.join(","));
    if (f.statuses.length) params.set("statuses", f.statuses.join(","));
    if (f.query.trim()) params.set("q", f.query.trim());
    try {
      const res = await fetch(`/api/nearby?${params.toString()}`);
      const data = await res.json();
      setDbDown(!res.ok);
      if (res.ok) setBuilders(data.builders ?? []);
    } catch {
      setDbDown(true);
    }
  }, [refLoc]);

  useEffect(() => {
    loadBuilders();
  }, [loadBuilders]);

  useEffect(() => {
    const t = setTimeout(loadBuilders, 350);
    return () => clearTimeout(t);
  }, [query, roles, statuses, loadBuilders]);

  return { builders, query, setQuery, roles, setRoles, statuses, setStatuses, dbDown, loadBuilders };
}

export function toggleList(list: string[], v: string, setFn: (x: string[]) => void) {
  setFn(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
}
