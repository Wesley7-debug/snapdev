"use client";

import { useEffect, useState } from "react";
import { INITIAL, trimmed, validateForm, type FormState } from "./validate-form";
import { getOrCreateAnonymousId } from "@/lib/anonymous-id";
import { saveLocation } from "@/lib/client-location";

export function useOnboardingForm(defaultLng: number, defaultLat: number, onCreated: () => void) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [lng, setLng] = useState(defaultLng);
  const [lat, setLat] = useState(defaultLat);
  const [locNote, setLocNote] = useState("Using map center. For best results, share your location.");
  /** Human label of the explicitly chosen spot — shown back to the user. */
  const [locLabel, setLocLabel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLng(defaultLng);
    setLat(defaultLat);
  }, [defaultLng, defaultLat]);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function pickPlace(label: string, city: string, plng: number, plat: number) {
    setLng(plng);
    setLat(plat);
    setLocLabel(label);
    set("city", city);
    // Remember the user's selected place so future visits don't need a prompt.
    saveLocation(plng, plat, "place");
    setLocNote(`Set to ${label}. Only your approximate area will be shown.`);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported — pick a place below.");
      return;
    }
    setGeoBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoBusy(false);
        setLng(pos.coords.longitude);
        setLat(pos.coords.latitude);
        setLocLabel("Your current location");
        saveLocation(pos.coords.longitude, pos.coords.latitude, "gps");
        setLocNote("Location captured. Only your approximate area will ever be shown.");
      },
      () => {
        setGeoBusy(false);
        setError("Permission denied — no problem, just pick a place below.");
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  async function submit() {
    setError("");
    const err = validateForm(form);
    if (err) return setError(err);
    setBusy(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousId: getOrCreateAnonymousId(),
          ...trimmed(form),
          country: "Nigeria",
          lng,
          lat,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBusy(false);
        setError(data.error ?? "Something went wrong.");
        return;
      }
      // Cache the approved location locally; MongoDB holds the profile truth.
      saveLocation(lng, lat, "gps");
      setBusy(false);
      onCreated();
    } catch {
      setBusy(false);
      setError("Couldn't save — check your connection and try again.");
    }
  }

  return { form, set, lng, lat, locNote, locLabel, busy, geoBusy, error, pickPlace, useMyLocation, submit };
}
