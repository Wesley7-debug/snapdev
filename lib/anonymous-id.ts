"use client";

/**
 * Persistent anonymous identity for Snapdev.
 *
 * There is intentionally NO authentication here: no login, signup,
 * passwords, or session tokens. This is just a random identifier that
 * lets a returning browser reclaim the single profile it created.
 *
 * - Generated once (cryptographically random UUID) on first visit.
 * - Stored in BOTH localStorage and a long-lived cookie so a cleared
 *   storage in one place can be recovered from the other.
 * - Sent as `anonymousId` with profile create/fetch/update calls.
 * - MongoDB is the source of truth for profile data; the browser only
 *   keeps this identifier (plus lightweight client state like map center).
 * - If both stores are cleared, the visitor is simply a new anonymous
 *   user. This is NOT secure authentication — anyone with the ID can
 *   claim the profile.
 */

export const ANON_ID_KEY = "snapdev_anon_id";
export const ANON_ID_COOKIE = "snapdev_anon_id";
// Pre-rebrand keys — read as fallback so returning users keep their
// profile, then healed forward to the new keys on next read.
const LEGACY_ANON_ID_KEY = "markdev_anon_id";
// 5 years — effectively "forever" for this use case.
const COOKIE_MAX_AGE = 5 * 365 * 24 * 60 * 60;

function generateId(): string {
  try {
    const c = globalThis.crypto as Crypto | undefined;
    if (c && "randomUUID" in c && typeof c.randomUUID === "function") {
      return c.randomUUID();
    }
    if (c && "getRandomValues" in c && typeof c.getRandomValues === "function") {
      const bytes = c.getRandomValues(new Uint8Array(16));
      // RFC 4122 v4
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b: number) => b.toString(16).padStart(2, "0")).join("");
      return (
        `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-` +
        `${hex.slice(16, 20)}-${hex.slice(20)}`
      );
    }
  } catch {
    /* fall through to insecure fallback */
  }
  // Last resort (non-crypto). Still unique enough to avoid collisions,
  // but callers must not treat this as unguessable.
  return `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const parts = document.cookie.split(";");
    for (const part of parts) {
      const [k, ...rest] = part.trim().split("=");
      if (k === ANON_ID_COOKIE || k === LEGACY_ANON_ID_KEY) {
        const v = decodeURIComponent(rest.join("="));
        if (v) return v;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeCookie(id: string) {
  if (typeof document === "undefined") return;
  try {
    const secure = typeof location !== "undefined" && location.protocol === "https:" ? ";Secure" : "";
    document.cookie =
      `${ANON_ID_COOKIE}=${encodeURIComponent(id)}` +
      `;Path=/;Max-Age=${COOKIE_MAX_AGE};SameSite=Lax${secure}`;
  } catch {
    /* ignore */
  }
}

function readLocal(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ANON_ID_KEY) ?? window.localStorage.getItem(LEGACY_ANON_ID_KEY);
  } catch {
    return null;
  }
}

function writeLocal(id: string) {
  try {
    window.localStorage.setItem(ANON_ID_KEY, id);
  } catch {
    /* ignore (private mode etc.) */
  }
}

/** Read the existing anonymous ID without creating one. Checks localStorage first, then cookie. */
export function getAnonymousId(): string | null {
  if (typeof window === "undefined") return null;
  const fromLocal = readLocal();
  if (fromLocal) {
    // Heal the cookie if it was cleared but localStorage survived.
    writeCookie(fromLocal);
    return fromLocal;
  }
  const fromCookie = readCookie();
  if (fromCookie) {
    // Heal localStorage if it was cleared but the cookie survived.
    writeLocal(fromCookie);
    return fromCookie;
  }
  return null;
}

/**
 * Get the persistent anonymous ID, generating + persisting (localStorage
 * + cookie) on first visit. Never returns "" in the browser.
 */
export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "";
  const existing = getAnonymousId();
  if (existing) return existing;
  const id = generateId();
  writeLocal(id);
  writeCookie(id);
  return id;
}
