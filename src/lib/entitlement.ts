/**
 * Free/Pro entitlement, tracked locally in the browser.
 *
 * Flow (when payments are enabled):
 *  1. Fresh user → first design is free to generate, edit, and preview.
 *  2. Pressing Export shows a $0.99 one-time paywall.
 *  3. After payment → account/profile creation UI → firstFlowComplete.
 *  4. Further Generate Design / Quick Design requires Pro ($14.99/mo).
 *
 * When payments are disabled (default), purchase CTAs show Early Access /
 * Notify Me instead of mock checkout. See PAYMENTS_ENABLED.
 *
 * Stripe: swap mockPayFirstExport / mockCreateAccount / mockSubscribePro for
 * API calls inside this module only; overlays stay presentational.
 */

import { hasCompletedFlow, markFlowCompleted } from "./generateFlowStore"

const KEY = "pallet-preview:ent:v3"
const OLD_KEY = "pallet-preview:ent:v2"

/** Set VITE_PAYMENTS_ENABLED=true when Stripe checkout is live. */
export const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === "true"

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

export const PRICING = {
  FIRST_EXPORT_CENTS: 99,
  PRO_MONTHLY_CENTS: 1499,
  firstExport: {
    amountUsd: 0.99,
    label: formatUsd(99),
    cadence: "one-time" as const,
    summary: `${formatUsd(99)} USD · one-time`,
  },
  pro: {
    amountUsd: 14.99,
    label: formatUsd(1499),
    cadence: "monthly" as const,
    summary: `${formatUsd(1499)} USD / month · recurring`,
  },
} as const

export type PlanId = "free" | "firstExport" | "pro"

export type FeatureId =
  | "generateFirstDesign"
  | "paletteEditing"
  | "copyColorValues"
  | "templatePreviewsFirstDesign"
  | "brandAssets"
  | "fullScreen"
  | "quickDesign"
  | "exportFirstDesign"
  | "exportCode"
  | "unlimitedGenerateQuickDesign"
  | "unlimitedExports"
  | "typographyExport"
  | "secondOpinion"
  | "premiumTemplates"
  | "savedProjects"

/** Minimum plan required to access a feature (marketing + gating source of truth). */
export const FEATURE_MIN_PLAN: Record<FeatureId, PlanId> = {
  generateFirstDesign: "free",
  paletteEditing: "free",
  copyColorValues: "free",
  templatePreviewsFirstDesign: "free",
  brandAssets: "free",
  fullScreen: "free",
  quickDesign: "free",
  exportFirstDesign: "firstExport",
  exportCode: "pro",
  unlimitedGenerateQuickDesign: "pro",
  unlimitedExports: "pro",
  typographyExport: "pro",
  secondOpinion: "pro",
  premiumTemplates: "pro",
  savedProjects: "pro",
}

/** User-facing labels for pricing and paywall copy. */
export const FEATURE_LABELS: Record<FeatureId, string> = {
  generateFirstDesign: "Generate your first full design",
  paletteEditing: "Unlimited palette editing and randomisation",
  copyColorValues: "Copy HEX, RGB and HSL values",
  templatePreviewsFirstDesign: "Unlimited template previews (first design)",
  brandAssets: "Brand assets (logo and app icon upload)",
  fullScreen: "Full screen preview",
  quickDesign: "Quick Design access",
  exportFirstDesign: "Export your first design (palette, swatches, project file)",
  exportCode: "Export code formats (CSS, JSON, design tokens, Tailwind)",
  unlimitedGenerateQuickDesign: "Unlimited Generate Design and Quick Design",
  unlimitedExports: "Unlimited exports (CSS, JSON, design tokens, project files)",
  typographyExport: "Typography export",
  secondOpinion: "Second Opinion (accessibility and contrast analysis)",
  premiumTemplates: "Premium and future templates",
  savedProjects: "Saved projects and all editing tools",
}

export const PLAN_FEATURES: Record<PlanId, FeatureId[]> = {
  free: [
    "generateFirstDesign",
    "paletteEditing",
    "copyColorValues",
    "templatePreviewsFirstDesign",
    "brandAssets",
    "fullScreen",
    "quickDesign",
  ],
  firstExport: ["exportFirstDesign"],
  pro: [
    "unlimitedGenerateQuickDesign",
    "unlimitedExports",
    "typographyExport",
    "secondOpinion",
    "premiumTemplates",
    "savedProjects",
  ],
}

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

/** Generate-flow completion and entitlement.firstFlowComplete stay in sync. */
export function isFirstFlowComplete(e: Entitlement): boolean {
  return e.firstFlowComplete || hasCompletedFlow()
}

/** Mark the onboarding generate flow complete in both stores. */
export function completeFirstFlowInStore(e?: Entitlement): Entitlement {
  markFlowCompleted()
  const current = e ?? loadEntitlement()
  const next = { ...current, firstFlowComplete: true }
  saveEntitlement(next)
  return next
}

export function loadEntitlement(): Entitlement {
  try {
    const raw = localStorage.getItem(KEY)
    const base = !raw
      ? migrateV2()
      : (() => {
          const p = JSON.parse(raw) as Partial<Entitlement>
          return {
            isPro: !!p.isPro,
            firstExportPaid: !!p.firstExportPaid,
            firstExportDesignId: typeof p.firstExportDesignId === "string" ? p.firstExportDesignId : null,
            firstFlowComplete: !!p.firstFlowComplete,
            account: p.account && typeof p.account.name === "string" && typeof p.account.email === "string" ? p.account : null,
          } satisfies Entitlement
        })()
    if (hasCompletedFlow() && !base.firstFlowComplete) {
      return { ...base, firstFlowComplete: true }
    }
    return base
  } catch {
    return hasCompletedFlow() ? { ...DEFAULT, firstFlowComplete: true } : DEFAULT
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
  return e.isPro || !isFirstFlowComplete(e)
}

/** True when the user can export a given design. */
export function canExport(e: Entitlement, designId: string): boolean {
  if (!PAYMENTS_ENABLED) return false
  return e.isPro || (e.firstExportPaid && e.firstExportDesignId === designId)
}

/** True when the first Export click should show the $0.99 paywall. */
export function needsExportPaywall(e: Entitlement): boolean {
  if (!PAYMENTS_ENABLED) return false
  return !e.isPro && !e.firstExportPaid && !isFirstFlowComplete(e)
}

/** True when account setup should be shown (after $0.99, before export). */
export function needsAccountSetup(e: Entitlement): boolean {
  if (!PAYMENTS_ENABLED) return false
  return e.firstExportPaid && !e.account
}

/** True when the user has exhausted the free tier and must subscribe. */
export function needsPro(e: Entitlement): boolean {
  if (!PAYMENTS_ENABLED) return false
  return isFirstFlowComplete(e) && !e.isPro
}

/** True when export is blocked because checkout is not live yet. */
export function needsExportEarlyAccess(e: Entitlement, designId: string): boolean {
  if (PAYMENTS_ENABLED) return false
  if (e.isPro || (e.firstExportPaid && e.firstExportDesignId === designId)) return false
  return true
}

/** True when Pro upsell applies but checkout is not live yet. */
export function needsProEarlyAccess(e: Entitlement): boolean {
  if (PAYMENTS_ENABLED) return false
  return isFirstFlowComplete(e) && !e.isPro
}

/** Runtime feature access — mirrors actual product behaviour. */
export function canUseFeature(e: Entitlement, feature: FeatureId, designId?: string): boolean {
  switch (feature) {
    case "generateFirstDesign":
    case "paletteEditing":
    case "copyColorValues":
    case "templatePreviewsFirstDesign":
    case "brandAssets":
    case "fullScreen":
    case "quickDesign":
      return true
    case "exportFirstDesign":
      return designId ? canExport(e, designId) : e.isPro || e.firstExportPaid
    case "exportCode":
      if (!PAYMENTS_ENABLED) return false
      if (e.isPro) return true
      return designId ? canExport(e, designId) : e.firstExportPaid
    case "unlimitedGenerateQuickDesign":
      return canUseWorkspace(e)
    case "unlimitedExports":
    case "typographyExport":
    case "premiumTemplates":
    case "savedProjects":
      return e.isPro
    case "secondOpinion":
      return e.isPro
    default:
      return false
  }
}

export function mockPayFirstExport(e: Entitlement, designId: string): Entitlement {
  if (!PAYMENTS_ENABLED) return e
  return { ...e, firstExportPaid: true, firstExportDesignId: designId }
}

export function mockCreateAccount(e: Entitlement, profile: Account): Entitlement {
  if (!PAYMENTS_ENABLED) return e
  markFlowCompleted()
  return { ...e, account: profile, firstFlowComplete: true }
}

export function mockSubscribePro(e: Entitlement): Entitlement {
  if (!PAYMENTS_ENABLED) return e
  return { ...e, isPro: true }
}
