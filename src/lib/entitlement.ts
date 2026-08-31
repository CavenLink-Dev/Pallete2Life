/**
 * Free/Pro entitlement, tracked locally in the browser.
 *
 * Flow:
 *  1. Fresh user → first design is free to generate, edit, and preview.
 *  2. Pressing Export shows a $0.99 one-time paywall.
 *  3. After payment → account/profile creation UI → firstFlowComplete.
 *  4. Further Generate Design / Quick Design requires Pro ($14.99/mo).
 *
 * Nothing here talks to a server. When Stripe/auth ship, the mock helpers
 * below will be replaced by real API calls.
 */

const KEY = "pallet-preview:ent:v3"
const OLD_KEY = "pallet-preview:ent:v2"

export type Account = { name: string; email: string }

export type Entitlement = {
  isPro: boolean
  firstExportPaid: boolean
  firstExportDesignId: string | null
  firstFlowComplete: boolean
  account: Account | null
}

const DEFAULT: Entitlement = {
  isPro: false,
  firstExportPaid: false,
  firstExportDesignId: null,
  firstFlowComplete: false,
  account: null,
}

function migrateV2(): Entitlement {
  try {
    const raw = localStorage.getItem(OLD_KEY)
    if (!raw) return DEFAULT
    const v2 = JSON.parse(raw) as { isPro?: boolean }
    localStorage.removeItem(OLD_KEY)
    return { ...DEFAULT, isPro: !!v2.isPro }
  } catch {
    return DEFAULT
  }
}

export function loadEntitlement(): Entitlement {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return migrateV2()
    const p = JSON.parse(raw) as Partial<Entitlement>
    return {
      isPro: !!p.isPro,
      firstExportPaid: !!p.firstExportPaid,
      firstExportDesignId: typeof p.firstExportDesignId === "string" ? p.firstExportDesignId : null,
      firstFlowComplete: !!p.firstFlowComplete,
      account: p.account && typeof p.account.name === "string" && typeof p.account.email === "string" ? p.account : null,
    }
  } catch {
    return DEFAULT
  }
}

export function saveEntitlement(e: Entitlement) {
  try {
    localStorage.setItem(KEY, JSON.stringify(e))
  } catch {
    /* storage unavailable */
  }
}

/** True when the user can open the Builder or Quick Design workspace. */
export function canUseWorkspace(e: Entitlement): boolean {
  return e.isPro || !e.firstFlowComplete
}

/** True when the user can export a given design. */
export function canExport(e: Entitlement, designId: string): boolean {
  return e.isPro || (e.firstExportPaid && e.firstExportDesignId === designId)
}

/** True when the first Export click should show the $0.99 paywall. */
export function needsExportPaywall(e: Entitlement): boolean {
  return !e.isPro && !e.firstExportPaid && !e.firstFlowComplete
}

/** True when account setup should be shown (after $0.99, before export). */
export function needsAccountSetup(e: Entitlement): boolean {
  return e.firstExportPaid && !e.account
}

/** True when the user has exhausted the free tier and must subscribe. */
export function needsPro(e: Entitlement): boolean {
  return e.firstFlowComplete && !e.isPro
}

export function mockPayFirstExport(e: Entitlement, designId: string): Entitlement {
  return { ...e, firstExportPaid: true, firstExportDesignId: designId }
}

export function mockCreateAccount(e: Entitlement, profile: Account): Entitlement {
  return { ...e, account: profile, firstFlowComplete: true }
}

export function mockSubscribePro(e: Entitlement): Entitlement {
  return { ...e, isPro: true }
}
