import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  BRAND,
  createSwatch,
  normalizeHex,
  pruneBindingsForSwatch,
  randomHex,
  refreshPaletteAutoNames,
  readableOn,
  updateSwatchHex,
  type Swatch,
} from "../lib/color"
import { createDefaultPalette, writeHashPalette } from "../lib/paletteStore"
import {
  applyQuickRoleToBindings,
  QUICK_ROLE_OPTIONS,
  type QuickPreviewKind,
  type QuickRole,
  quickRolesFromBindings,
} from "../lib/quickRoleBridge"
import { DEFAULT_BRAND, loadWorkspace, saveWorkspaceProject } from "../lib/workspaceStore"
import PublicFooter from "../components/PublicFooter"
import PublicHeader from "../components/PublicHeader"
import PaywallOverlay from "../components/PaywallOverlay"
import BrandUpload from "../components/BrandUpload"
import ConfirmDialog from "../components/ConfirmDialog"
import type { Brand } from "../components/PreviewCtx"
import { useToast } from "../components/Toast"
import { loadEntitlement, mockSubscribePro, needsPro, PAYMENTS_ENABLED, saveEntitlement, type Entitlement } from "../lib/entitlement"
import {
  LiveChangePreview,
  type LiveRoleColors,
} from "../components/LiveChangePreviews"
import { createTokenSystem } from "../lib/tokenSystem"
import { ACCESSIBILITY_STATUS_LABEL, evaluateAccessibility, type AccessibilityCheck, worstAccessibilityStatus } from "../lib/accessibility"
import { createHistoryState } from "../lib/workspaceHistory"

const MAX_COLOURS = 8
const MIN_COLOURS = 2

const PREVIEW_OPTIONS: { key: QuickPreviewKind; label: string }[] = [
  { key: "website", label: "Basic Website" },
  { key: "app", label: "Basic App" },
  { key: "components", label: "Basic Components" },
]

type QuickDesignSnapshot = {
  palette: Swatch[]
  roleBindings: Record<string, string>
  unassignedRoleSwatchIds: string[]
  brand: Brand
  preview: QuickPreviewKind
}

function projectSnapshot(project: ReturnType<typeof loadWorkspace>["project"]): QuickDesignSnapshot {
  return {
    palette: project.palette,
    roleBindings: project.roleBindings,
    unassignedRoleSwatchIds: project.unassignedRoleSwatchIds,
    brand: project.brand,
    preview: project.preferences.quickPreview,
  }
}

/* #QuickDesignPage /quick-design - quick colour testing with three previews. */
export default function QuickDesign() {
  const toast = useToast()
  const [initial] = useState(() => loadWorkspace())
  const historyRef = useRef(createHistoryState(projectSnapshot(initial.project)))
  // Trigger a render after mutating the history ref so Undo/Redo state stays in sync.
  const [forceHistory, setForceHistory] = useState(0)
  const [palette, setPalette] = useState<Swatch[]>(() => historyRef.current.snapshot.palette)
  const [roleBindings, setRoleBindings] = useState(() => historyRef.current.snapshot.roleBindings)
  const [unassignedRoleSwatchIds, setUnassignedRoleSwatchIds] = useState(() => historyRef.current.snapshot.unassignedRoleSwatchIds)
  const [brand, setBrandState] = useState<Brand>(() => historyRef.current.snapshot.brand)
  const [brandOpen, setBrandOpen] = useState(false)
  const [preview, setPreview] = useState<QuickPreviewKind>(() => historyRef.current.snapshot.preview)
  const [confirmReset, setConfirmReset] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Swatch | null>(null)
  const [entitlement, setEntitlement] = useState<Entitlement>(loadEntitlement)
  const [paywallOpen, setPaywallOpen] = useState(() => needsPro(loadEntitlement()))
  const roleSelectRefs = useRef<Partial<Record<QuickRole, HTMLSelectElement | null>>>({})

  const applySnapshot = useCallback((snapshot: QuickDesignSnapshot) => {
    setPalette(snapshot.palette)
    setRoleBindings(snapshot.roleBindings)
    setUnassignedRoleSwatchIds(snapshot.unassignedRoleSwatchIds)
    setBrandState(snapshot.brand)
    setPreview(snapshot.preview)
  }, [])

  const commit = useCallback((updater: (snapshot: QuickDesignSnapshot) => QuickDesignSnapshot) => {
    const next = updater(historyRef.current.snapshot)
    historyRef.current = historyRef.current.pushSnapshot(next)
    applySnapshot(next)
    setForceHistory((tick) => tick + 1)
  }, [applySnapshot])

  const roles = useMemo(
    () => quickRolesFromBindings(roleBindings, palette),
    [roleBindings, palette],
  )

  useEffect(() => { saveEntitlement(entitlement) }, [entitlement])

  useEffect(() => {
    const current = loadWorkspace().project
    saveWorkspaceProject({
      ...current,
      palette,
      brand,
      roleBindings,
      unassignedRoleSwatchIds,
      preferences: { ...current.preferences, quickPreview: preview },
    })
    writeHashPalette(palette)
  }, [palette, brand, roleBindings, unassignedRoleSwatchIds, preview])

  const undo = useCallback(() => {
    historyRef.current = historyRef.current.undo()
    applySnapshot(historyRef.current.snapshot)
    setForceHistory((tick) => tick + 1)
  }, [applySnapshot])

  const redo = useCallback(() => {
    historyRef.current = historyRef.current.redo()
    applySnapshot(historyRef.current.snapshot)
    setForceHistory((tick) => tick + 1)
  }, [applySnapshot])

  const canUndo = useMemo(() => historyRef.current.canUndo, [forceHistory])
  const canRedo = useMemo(() => historyRef.current.canRedo, [forceHistory])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null
      if (
        target?.matches("input, select, textarea")
        || !!target?.closest("[contenteditable='true']")
      ) {
        return
      }

      const modifier = event.metaKey || event.ctrlKey
      if (modifier && !event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault()
        undo()
      } else if (modifier && ((event.shiftKey && event.key.toLowerCase() === "z") || event.key.toLowerCase() === "y")) {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [redo, undo])

  const paletteById = useMemo(() => new Map(palette.map((swatch) => [swatch.id, swatch])), [palette])
  const liveRoleColors = useMemo(() => Object.fromEntries(
    QUICK_ROLE_OPTIONS.map(({ key }) => [key, paletteById.get(roles[key])?.hex ?? palette[0]?.hex ?? "#FFFFFF"]),
  ) as LiveRoleColors, [palette, paletteById, roles])
  const accessibilityChecks = useMemo(() => evaluateAccessibility({
    brand: liveRoleColors.button,
    accent: liveRoleColors.button,
    secondary: liveRoleColors.accent,
    tertiary: liveRoleColors.accent,
    ink: liveRoleColors.text,
    inkSoft: liveRoleColors.text,
    inkFaint: liveRoleColors.border,
    paper: liveRoleColors.background,
    surface: liveRoleColors.surface,
    border: liveRoleColors.border,
    onBrand: readableOn(liveRoleColors.button),
    onInk: readableOn(liveRoleColors.text),
  }, createTokenSystem(palette)), [liveRoleColors, palette])

  const changeColour = useCallback((id: string, value: string) => {
    const hex = normalizeHex(value)
    commit((snapshot) => ({
      ...snapshot,
      palette: refreshPaletteAutoNames(
        snapshot.palette.map((swatch) => swatch.id === id ? updateSwatchHex(swatch, hex) : swatch),
      ),
    }))
  }, [commit])

  const renameColour = useCallback((id: string, value: string) => {
    commit((snapshot) => ({
      ...snapshot,
      palette: refreshPaletteAutoNames(snapshot.palette.map((swatch, index) => {
        if (swatch.id !== id) return swatch
        const name = value.trim() || `Colour ${index + 1}`
        return { ...swatch, name, autoNamed: false }
      })),
    }))
  }, [commit])

  const randomise = () => {
    if (!palette.some((swatch) => !swatch.locked)) {
      toast.push("Unlock a colour to randomise", "error")
      return
    }
    commit((snapshot) => ({
      ...snapshot,
      palette: refreshPaletteAutoNames(snapshot.palette.map((swatch) => (
        swatch.locked ? swatch : updateSwatchHex(swatch, randomHex())
      ))),
    }))
  }

  const addColour = () => {
    if (palette.length >= MAX_COLOURS) {
      toast.push("Quick Design supports up to 8 colours", "error")
      return
    }
    commit((snapshot) => ({
      ...snapshot,
      palette: refreshPaletteAutoNames([
        ...snapshot.palette,
        createSwatch(randomHex(), snapshot.palette.length),
      ]),
    }))
  }

  const confirmDeleteColour = useCallback(() => {
    if (!pendingDelete) return
    commit((snapshot) => {
      if (snapshot.palette.length <= MIN_COLOURS) return snapshot
      const { roleBindings: nextBindings, unassignedRoleSwatchIds: nextUnassigned } = pruneBindingsForSwatch(
        pendingDelete.id,
        snapshot.roleBindings,
        snapshot.unassignedRoleSwatchIds,
      )
      return {
        ...snapshot,
        palette: refreshPaletteAutoNames(snapshot.palette.filter((swatch) => swatch.id !== pendingDelete.id)),
        roleBindings: nextBindings,
        unassignedRoleSwatchIds: nextUnassigned,
      }
    })
    setPendingDelete(null)
  }, [commit, pendingDelete])

  const setQuickRole = useCallback((quickRole: QuickRole, swatchId: string) => {
    commit((snapshot) => {
      const result = applyQuickRoleToBindings(
        quickRole,
        swatchId,
        snapshot.roleBindings,
        snapshot.unassignedRoleSwatchIds,
      )
      return { ...snapshot, ...result }
    })
  }, [commit])

  const setBrand = useCallback((next: Brand) => {
    commit((snapshot) => ({ ...snapshot, brand: next }))
  }, [commit])

  const setPreviewKind = useCallback((next: QuickPreviewKind) => {
    commit((snapshot) => ({ ...snapshot, preview: next }))
  }, [commit])

  const toggleLock = useCallback((id: string) => {
    commit((snapshot) => ({
      ...snapshot,
      palette: snapshot.palette.map((swatch) => swatch.id === id ? { ...swatch, locked: !swatch.locked } : swatch),
    }))
  }, [commit])

  const reset = useCallback(() => {
    commit((snapshot) => ({
      ...snapshot,
      palette: createDefaultPalette(),
      roleBindings: {},
      unassignedRoleSwatchIds: [],
      brand: { ...DEFAULT_BRAND },
      preview: "website",
    }))
    setConfirmReset(false)
  }, [commit])

  const focusRole = useCallback((role: QuickRole) => {
    roleSelectRefs.current[role]?.focus()
  }, [])

  return (
    <div className="flex min-h-full flex-col bg-offwhite text-charcoal">
      <PublicHeader />
      <main className="flex-1">
        <section className="border-b border-softgrey bg-white px-4 py-8 sm:px-6 sm:py-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-[30px] font-bold leading-tight sm:text-[38px]" style={{ fontFamily: "var(--font-display)" }}>
                  Quick Design
                </h1>
                <p className="mt-2 text-sm text-charcoal/55">Quick Design <span aria-hidden>·</span> Changes save automatically</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="Undo"
                  aria-keyshortcuts="Meta+Z Control+Z"
                  title="Undo"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-softgrey bg-white text-charcoal/70 hover:border-charcoal/30 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
                >
                  <UndoIcon />
                </button>
                <button
                  type="button"
                  onClick={redo}
                  disabled={!canRedo}
                  aria-label="Redo"
                  aria-keyshortcuts="Meta+Shift+Z Control+Shift+Z Control+Y"
                  title="Redo"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-softgrey bg-white text-charcoal/70 hover:border-charcoal/30 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
                >
                  <RedoIcon />
                </button>
                <button type="button" onClick={randomise} className="inline-flex h-11 items-center gap-2 rounded-lg border border-softgrey bg-white px-3.5 text-sm font-semibold hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">
                  <ShuffleIcon /> Randomise
                </button>
                <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex h-11 items-center gap-2 rounded-lg border border-softgrey bg-white px-3.5 text-sm font-semibold hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">
                  <ResetIcon /> Reset
                </button>
                <button type="button" onClick={addColour} disabled={palette.length >= MAX_COLOURS} className="inline-flex h-11 items-center gap-2 rounded-lg bg-charcoal px-3.5 text-sm font-semibold text-white hover:bg-[#263542] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">
                  <PlusIcon /> Add colour
                </button>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8">
              {palette.map((swatch, index) => (
                <PaletteColour
                  key={swatch.id}
                  index={index}
                  swatch={swatch}
                  canRemove={palette.length > MIN_COLOURS}
                  onChange={changeColour}
                  onRename={renameColour}
                  onLock={toggleLock}
                  onRemove={() => setPendingDelete(swatch)}
                />
              ))}
            </div>

            <div className="mt-8 grid gap-8 border-t border-softgrey pt-7 lg:grid-cols-[1fr_280px]">
              <div>
                <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>Visual roles</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {QUICK_ROLE_OPTIONS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 rounded-lg border border-softgrey bg-offwhite px-3 py-2.5">
                      <span className="h-7 w-7 shrink-0 rounded-md border border-black/10" style={{ background: liveRoleColors[key] }} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-semibold text-charcoal/50">{label}</span>
                        <select
                          value={roles[key]}
                          onChange={(event) => setQuickRole(key, event.target.value)}
                          ref={(node) => { roleSelectRefs.current[key] = node }}
                          className="block w-full appearance-none bg-transparent text-sm font-semibold outline-none"
                          aria-label={`${label} colour`}
                        >
                          {palette.map((swatch) => <option key={swatch.id} value={swatch.id}>{swatch.name} ({swatch.hex})</option>)}
                        </select>
                      </span>
                      <ChevronIcon />
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-softgrey pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>Brand</h2>
                <div className="mt-3 flex items-center gap-3">
                  <BrandThumb brand={brand} accent={liveRoleColors.accent} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{brand.name || "Company name"}</p>
                    <p className="text-xs text-charcoal/45">Logo and app icon</p>
                  </div>
                  <button type="button" onClick={() => setBrandOpen(true)} className="inline-flex h-11 items-center rounded-lg border border-softgrey bg-white px-3 text-xs font-semibold hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">
                    Edit
                  </button>
                </div>
              </div>
            </div>
            <LiveAccessibilitySummary checks={accessibilityChecks} onAdjustRole={focusRole} />
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[24px] font-bold sm:text-[28px]" style={{ fontFamily: "var(--font-display)" }}>Live preview</h2>
                <p className="mt-1 text-sm text-charcoal/50">Switch between website, app, and component previews</p>
              </div>
              <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-softgrey bg-white" role="tablist" aria-label="Live preview options">
                {PREVIEW_OPTIONS.map((option) => {
                  const active = preview === option.key
                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setPreviewKind(option.key)}
                      className="min-h-11 border-l border-softgrey px-3 py-2 text-xs font-semibold first:border-l-0 sm:px-4 sm:text-sm"
                      style={active ? { background: BRAND.charcoal, color: BRAND.white } : { color: BRAND.medgrey }}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-lg border border-softgrey bg-white shadow-sm" role="tabpanel">
              <LiveChangePreview kind={preview} colours={liveRoleColors} brand={brand} />
              <LiveAccessibilityBadge checks={accessibilityChecks} />
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />

      {brandOpen && <BrandUpload brand={brand} onChange={setBrand} onClose={() => setBrandOpen(false)} />}

      <ConfirmDialog
        open={confirmReset}
        title="Reset your palette?"
        body="Your Quick Design colours, roles, brand, and preview will return to the defaults. You can undo this change."
        confirmLabel="Reset palette"
        destructive
        onConfirm={reset}
        onCancel={() => setConfirmReset(false)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete colour?"
        body="This colour will be removed from Quick Design. You can undo this change."
        confirmLabel="Delete colour"
        destructive
        onConfirm={confirmDeleteColour}
        onCancel={() => setPendingDelete(null)}
      />

      <PaywallOverlay
        open={paywallOpen}
        reason="Quick Design requires a Pro subscription after your first design flow."
        onUnlock={() => {
          if (!PAYMENTS_ENABLED) return
          setEntitlement((e) => mockSubscribePro(e))
          setPaywallOpen(false)
          toast.push("Pro unlocked", "success")
        }}
        onLater={() => setPaywallOpen(false)}
      />
    </div>
  )
}

function accessibilityQuickRole(check: AccessibilityCheck): QuickRole | null {
  switch (check.id) {
    case "normal-text":
    case "large-text":
      return "text"
    case "button":
      return "button"
    case "border":
      return "border"
    case "focus":
      return "accent"
    default:
      return null
  }
}

function quickRoleLabel(role: QuickRole): string {
  return QUICK_ROLE_OPTIONS.find((option) => option.key === role)?.label ?? role
}

function LiveAccessibilitySummary({
  checks,
  onAdjustRole,
}: {
  checks: ReturnType<typeof evaluateAccessibility>
  onAdjustRole: (role: QuickRole) => void
}) {
  const flagged = checks.filter((check) => check.status !== "good")

  return (
    <div className="mt-6 border-t border-softgrey pt-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase text-charcoal/45">Accessibility</span>
        {checks.map((check) => (
          <span
            key={check.id}
            className={`rounded-[6px] px-2 py-1 text-[10.5px] font-semibold ${check.status === "good" ? "bg-[#ecfdf3] text-[#067647]" : check.status === "review" ? "bg-[#fff7ed] text-[#9a3412]" : "bg-[#fef2f2] text-[#b42318]"}`}
            title={check.status === "good" ? check.value : `${check.value}. ${check.suggestion}`}
          >
            {check.label}: {ACCESSIBILITY_STATUS_LABEL[check.status]}
          </span>
        ))}
      </div>
      {flagged.length > 0 && (
        <div className="mt-3 grid gap-2">
          {flagged.map((check) => {
            const role = accessibilityQuickRole(check)
            const roleLabel = role ? quickRoleLabel(role) : null

            return (
              <div key={check.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-offwhite px-3 py-2 text-[12px] text-charcoal/70">
                <span className="font-semibold text-charcoal">{check.label}:</span>
                <span className="min-w-0 flex-1">{check.suggestion}</span>
                {role && (
                  <button
                    type="button"
                    onClick={() => onAdjustRole(role)}
                    aria-label={`Adjust role for ${roleLabel}`}
                    className="min-h-11 rounded-md border border-softgrey bg-white px-2.5 py-1 text-[11px] font-semibold text-charcoal hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
                  >
                    Adjust role
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LiveAccessibilityBadge({ checks }: { checks: ReturnType<typeof evaluateAccessibility> }) {
  const status = worstAccessibilityStatus(checks)
  return <span className={`pointer-events-none absolute bottom-3 left-3 rounded-[6px] border px-2.5 py-1.5 text-[10.5px] font-semibold shadow-sm ${status === "good" ? "border-[#a7e0c2] bg-[#ecfdf3] text-[#067647]" : status === "review" ? "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]" : "border-[#fecaca] bg-[#fef2f2] text-[#b42318]"}`}>Accessibility: {ACCESSIBILITY_STATUS_LABEL[status]}</span>
}

function PaletteColour({
  index,
  swatch,
  canRemove,
  onChange,
  onRename,
  onLock,
  onRemove,
}: {
  index: number
  swatch: Swatch
  canRemove: boolean
  onChange: (id: string, value: string) => void
  onRename: (id: string, value: string) => void
  onLock: (id: string) => void
  onRemove: () => void
}) {
  const [draft, setDraft] = useState(swatch.hex)
  const [nameDraft, setNameDraft] = useState(swatch.name)

  useEffect(() => setDraft(swatch.hex), [swatch.hex])
  useEffect(() => setNameDraft(swatch.name), [swatch.name])

  const commitDraft = () => {
    const hex = normalizeHex(draft)
    setDraft(hex)
    onChange(swatch.id, hex)
  }

  const commitName = () => {
    const next = nameDraft.trim() || `Colour ${index + 1}`
    setNameDraft(next)
    onRename(swatch.id, next)
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-softgrey bg-white">
      <label className="relative block h-16 cursor-pointer border-b border-softgrey" style={{ background: swatch.hex }} title={`Edit ${swatch.name}`}>
        <input type="color" value={swatch.hex} onChange={(event) => onChange(swatch.id, event.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={`Edit ${swatch.name}`} />
      </label>
      <div className="space-y-1.5 px-2 py-2">
        <input
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
          onBlur={commitName}
          onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur() }}
          className="w-full min-w-0 truncate bg-transparent text-xs font-semibold outline-none"
          aria-label="Colour name"
        />
        <div className="flex items-center gap-1.5">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur() }}
            className="min-w-0 flex-1 bg-transparent font-mono text-xs font-semibold uppercase outline-none"
            aria-label="Hex colour"
          />
          <button type="button" onClick={() => onLock(swatch.id)} className="rounded p-1 text-charcoal/50 hover:bg-offwhite hover:text-charcoal" aria-label={swatch.locked ? `Unlock ${swatch.name}` : `Lock ${swatch.name}`} title={swatch.locked ? "Unlock colour" : "Lock colour"}>
            {swatch.locked ? <LockedIcon /> : <UnlockedIcon />}
          </button>
          <button type="button" onClick={onRemove} disabled={!canRemove} className="rounded p-1 text-charcoal/50 hover:bg-offwhite hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-25" aria-label={`Delete ${swatch.name}`} title="Delete colour">
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

function BrandThumb({ brand, accent }: { brand: Brand; accent: string }) {
  if (brand.symbol) return <img src={brand.symbol} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: accent }} aria-hidden>
      {(brand.name || "P").trim().charAt(0).toUpperCase()}
    </span>
  )
}

const ShuffleIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
const UndoIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 6 6v1" /></svg>
const RedoIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H10a6 6 0 0 0-6 6v1" /></svg>
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
const ResetIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
const ChevronIcon = () => <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-charcoal/35"><path d="m6 9 6 6 6-6" /></svg>
const LockedIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
const UnlockedIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.6-1.7" /></svg>
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" /></svg>
