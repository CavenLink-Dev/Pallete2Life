/**
 * Free/Pro entitlement, tracked locally in the browser.
 * Palette data lives elsewhere (see Builder). This file only tracks:
 *   – whether the viewer is Pro,
 *   – how many free preview switches they've used,
 *   – which previews they've already visited (so switching back doesn't re-charge).
 *
 * Nothing here talks to a server. When accounts/subscriptions ship the
 * `isPro` boolean will be sourced from the account instead of local state.
 */

const KEY = "pallet-preview:ent:v1"

export const FREE_PREVIEW_LIMIT = 5

export type Entitlement = {
  isPro: boolean
  /** how many DIFFERENT previews the user has switched to (Free tier only) */
  freeSwitchesUsed: number
  /** the set of "group/sub" preview keys the user has already visited */
  seen: string[]
}

const DEFAULT: Entitlement = { isPro: false, freeSwitchesUsed: 0, seen: [] }

export function loadEntitlement(): Entitlement {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT
    const p = JSON.parse(raw) as Partial<Entitlement>
    return {
      isPro: !!p.isPro,
      freeSwitchesUsed: Number(p.freeSwitchesUsed) || 0,
      seen: Array.isArray(p.seen) ? p.seen.filter((x) => typeof x === "string") : [],
    }
  } catch {
    return DEFAULT
  }
}

export function saveEntitlement(e: Entitlement) {
  try {
    localStorage.setItem(KEY, JSON.stringify(e))
  } catch {
    /* storage unavailable — ignore */
  }
}

export function previewKey(group: string, sub: string): string {
  return `${group}/${sub}`
}

/** How many free previews the viewer has left. Pro users always see Infinity. */
export function freeRemaining(e: Entitlement): number {
  if (e.isPro) return Infinity
  return Math.max(0, FREE_PREVIEW_LIMIT - e.freeSwitchesUsed)
}

/** True when switching to this preview should trigger the paywall. */
export function needsPaywall(e: Entitlement, key: string): boolean {
  if (e.isPro) return false
  if (e.seen.includes(key)) return false
  return e.freeSwitchesUsed >= FREE_PREVIEW_LIMIT
}

/** Record a successful switch to `key`. Consumes one free preview only if new. */
export function recordSwitch(e: Entitlement, key: string): Entitlement {
  if (e.seen.includes(key)) return e
  return {
    ...e,
    seen: [...e.seen, key],
    freeSwitchesUsed: e.isPro ? e.freeSwitchesUsed : e.freeSwitchesUsed + 1,
  }
}
