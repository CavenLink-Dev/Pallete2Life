/**
 * Free/Pro entitlement, tracked locally in the browser.
 * Free tier: 5 live previews per DAY (resets at local midnight). Re-opening a
 * preview you've already viewed today is free; each new one costs a preview.
 * Pro: unlimited.
 *
 * Nothing here talks to a server. When accounts/subscriptions ship the
 * `isPro` boolean will be sourced from the account instead of local state.
 */

const KEY = "pallet-preview:ent:v2"

/** Free previews allowed per day before the paywall appears. */
export const FREE_DAILY_PREVIEWS = 5

export type Entitlement = {
  isPro: boolean
  /** local calendar day (YYYY-MM-DD) the counter below applies to */
  day: string
  /** preview keys already opened today — each distinct one costs a preview */
  seenToday: string[]
}

function today(): string {
  return new Date().toLocaleDateString("en-CA") // YYYY-MM-DD, local time
}

const DEFAULT: Entitlement = { isPro: false, day: today(), seenToday: [] }

/** Roll the counter over to a fresh day if the stored day has passed. */
function normalise(e: Entitlement): Entitlement {
  const d = today()
  return e.day === d ? e : { ...e, day: d, seenToday: [] }
}

export function loadEntitlement(): Entitlement {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT
    const p = JSON.parse(raw) as Partial<Entitlement>
    return normalise({
      isPro: !!p.isPro,
      day: typeof p.day === "string" ? p.day : today(),
      seenToday: Array.isArray(p.seenToday) ? p.seenToday.filter((x) => typeof x === "string") : [],
    })
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

export function previewKey(group: string, sub: string, template?: string): string {
  return template ? `${group}/${sub}/${template}` : `${group}/${sub}`
}

/** How many free previews the viewer has left today. Pro users see Infinity. */
export function freeRemaining(e: Entitlement): number {
  if (e.isPro) return Infinity
  return Math.max(0, FREE_DAILY_PREVIEWS - normalise(e).seenToday.length)
}

/** True when opening this preview should trigger the paywall. */
export function needsPaywall(e: Entitlement, key: string): boolean {
  if (e.isPro) return false
  const n = normalise(e)
  if (n.seenToday.includes(key)) return false
  return n.seenToday.length >= FREE_DAILY_PREVIEWS
}

/** Record a preview open. Consumes one of today's previews only if new. */
export function recordSwitch(e: Entitlement, key: string): Entitlement {
  const n = normalise(e)
  if (n.isPro || n.seenToday.includes(key)) return n
  return { ...n, seenToday: [...n.seenToday, key] }
}
