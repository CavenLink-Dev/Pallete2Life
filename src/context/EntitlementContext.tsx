import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  canExport,
  canUseFeature,
  canUseWorkspace,
  loadEntitlement,
  mockCreateAccount,
  mockPayFirstExport,
  mockSubscribePro,
  needsAccountSetup,
  needsExportEarlyAccess,
  needsExportPaywall,
  needsPro,
  needsProEarlyAccess,
  saveEntitlement,
  type Account,
  type Entitlement,
  type FeatureId,
} from "../lib/entitlement"

type EntitlementContextValue = {
  entitlement: Entitlement
  setEntitlement: (next: Entitlement | ((current: Entitlement) => Entitlement)) => void
  payFirstExport: (designId: string) => void
  createAccount: (profile: Account) => void
  subscribePro: () => void
  canUseFeature: (feature: FeatureId, designId?: string) => boolean
  canExportDesign: (designId: string) => boolean
  canUseWorkspace: () => boolean
  needsExportPaywall: () => boolean
  needsAccountSetup: () => boolean
  needsPro: () => boolean
  needsExportEarlyAccess: (designId: string) => boolean
  needsProEarlyAccess: () => boolean
}

const EntitlementContext = createContext<EntitlementContextValue | null>(null)

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [entitlement, setEntitlementState] = useState<Entitlement>(loadEntitlement)

  const setEntitlement = useCallback((next: Entitlement | ((current: Entitlement) => Entitlement)) => {
    setEntitlementState((current) => {
      const resolved = typeof next === "function" ? next(current) : next
      saveEntitlement(resolved)
      return resolved
    })
  }, [])

  useEffect(() => {
    const synced = loadEntitlement()
    setEntitlementState(synced)
    saveEntitlement(synced)
  }, [])

  const value = useMemo<EntitlementContextValue>(() => ({
    entitlement,
    setEntitlement,
    payFirstExport: (designId) => setEntitlement((e) => mockPayFirstExport(e, designId)),
    createAccount: (profile) => setEntitlement((e) => mockCreateAccount(e, profile)),
    subscribePro: () => setEntitlement((e) => mockSubscribePro(e)),
    canUseFeature: (feature, designId) => canUseFeature(entitlement, feature, designId),
    canExportDesign: (designId) => canExport(entitlement, designId),
    needsExportPaywall: () => needsExportPaywall(entitlement),
    needsAccountSetup: () => needsAccountSetup(entitlement),
    needsPro: () => needsPro(entitlement),
    needsExportEarlyAccess: (designId) => needsExportEarlyAccess(entitlement, designId),
    needsProEarlyAccess: () => needsProEarlyAccess(entitlement),
    canUseWorkspace: () => canUseWorkspace(entitlement),
  }), [entitlement, setEntitlement])

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>
}

export function useEntitlement() {
  const ctx = useContext(EntitlementContext)
  if (!ctx) throw new Error("useEntitlement must be used within EntitlementProvider")
  return ctx
}
