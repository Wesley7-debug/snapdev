"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Builder } from "../ui/types";
import { renderMarkers } from "./render-markers";
import {
  MAP_DEFAULTS,
  configureMapLibreWorker,
  getMapStyle,
} from "./map-config";

export interface MapHandle {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  /** True when the point is currently inside the visible map bounds. */
  isInView: (lng: number, lat: number) => boolean;
}

export interface MapProps {
  builders: Builder[];
  center: [number, number];
  myPos: [number, number] | null;
  myAvatar?: string;
  myName?: string;
  /** Your profile is hidden — render your marker greyed out. */
  myDimmed?: boolean;
  showPlus: boolean;
  selectedUsername: string | null;
  onSelect: (b: Builder | null) => void;
  onPlus: () => void;
  /** Tapping your own avatar marker (opens your profile modal). */
  onMe?: () => void;
  onMove: (lng: number, lat: number) => void;
}

const MapView = forwardRef<MapHandle, MapProps>(function MapView(props, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const stateRef = useRef(props);
  stateRef.current = props;
  const [styleError, setStyleError] = useState(false);

  useImperativeHandle(ref, () => ({
    flyTo(lng, lat, zoom = 14) {
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom,
        duration: MAP_DEFAULTS.flyDuration,
        essential: true,
      });
    },
    isInView(lng, lat) {
      try {
        return mapRef.current?.getBounds().contains([lng, lat]) ?? true;
      } catch {
        return true;
      }
    },
  }));

  const render = () => {
    if (mapRef.current)
      renderMarkers(mapRef.current, markersRef, stateRef.current);
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    configureMapLibreWorker();
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyle(),
      center: stateRef.current.center,
      zoom: MAP_DEFAULTS.zoom,
      minZoom: MAP_DEFAULTS.minZoom,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left",
    );
    map.on("moveend", () => {
      const c = map.getCenter();
      stateRef.current.onMove(c.lng, c.lat);
      render();
    });
    map.on("move", render);
    map.on("click", () => stateRef.current.onSelect(null));
    map.on("load", render);
    map.on("error", () => setStyleError(true));
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastCenter = useRef("");
  useEffect(() => {
    const key = `${props.center[0].toFixed(4)},${props.center[1].toFixed(4)}`;
    if (key !== lastCenter.current && mapRef.current) {
      lastCenter.current = key;
      mapRef.current.flyTo({
        center: props.center,
        duration: 1200,
        essential: true,
      });
    }
  }, [props.center]);

  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.builders, props.myPos, props.showPlus, props.selectedUsername]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {styleError && (
        <p className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-[12px] font-medium text-white backdrop-blur">
          Map tiles are slow right now — markers still work.
        </p>
      )}
    </div>
  );
});

export default MapView;
