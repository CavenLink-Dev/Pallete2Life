import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { applyRoleChange, createSwatch, deriveTheme, hslToHex, pruneBindingsForSwatch, randomHex, randomiseUnlockedHex, refreshPaletteAutoNames, updateSwatchHex, type RoleBindings, type Swatch } from "../lib/color"
import { DEFAULT_BUTTON_PROPS, paletteToTrio } from "../components/ButtonPreview"
import { GROUPS, PreviewRenderer, type GroupKey, type PreviewRendererHandle } from "../components/Previews"
import { PreviewProvider, ScopeProvider, type Brand, type PreviewCtxValue } from "../components/PreviewCtx"
import BrandUpload from "../components/BrandUpload"
import ChangeTemplatePanel from "../components/ChangeTemplatePanel"
import ConfirmDialog from "../components/ConfirmDialog"
import AccountSetupOverlay from "../components/AccountSetupOverlay"
import ExportPanel, { type ImportedProject } from "../components/ExportPanel"
import ExportPaywallOverlay from "../components/ExportPaywallOverlay"
import CustomisePanel from "../components/CustomisePanel"
import OnboardingCard, { markOnboardingStep } from "../components/OnboardingCard"
import PaletteRail from "../components/PaletteRail"
import PaywallOverlay from "../components/PaywallOverlay"
import SecondOpinionPanel from "../components/SecondOpinionPanel"
import { useToast } from "../components/Toast"
import { useEntitlement } from "../context/EntitlementContext"
import { PAYMENTS_ENABLED } from "../lib/entitlement"
import { evaluateAccessibility } from "../lib/accessibility"
import { createDefaultPalette, mergeHashPalette, readHashPalette, writeHashPalette } from "../lib/paletteStore"
import { createHistoryState, type WorkspaceSnapshot } from "../lib/workspaceHistory"
import { loadWorkspace, saveWorkspaceProject } from "../lib/workspaceStore"
import { useNav, useRoute } from "../lib/router"
import { useDialogFocus } from "../lib/useDialogFocus"
import ErrorBoundary from "../components/ErrorBoundary"
import { pickCuratedPalette } from "../lib/curatedPalettes"
import { ELEMENT_DEFAULTS, randomTypographyTokens, randomButtonTokens, type ElementOverrides, type InspectorSelection } from "../lib/designTokens"
import { createTokenSystem, semanticColour, semanticKeyForRole } from "../lib/tokenSystem"
import { templateAssetById } from "../lib/templateAssets"
import { publicTemplateGroups } from "../lib/templateCatalog"
import { readGenerateResult } from "../lib/generateFlowStore"
type Selection = { group: GroupKey; sub: string }
type TemplateDraft = { group: GroupKey; sub: string; templateId: string }

const PICKER_GROUPS = publicTemplateGroups

const WEBSITE_ROLE_LABELS = ["Page Background", "Secondary Background", "Brand Primary", "Secondary", "Tertiary", "Accent", "Heading Text", "Body Text", "Surface", "Border"]
const APPLICATION_ROLE_LABELS = ["App Background", "Secondary Background", "Brand Primary", "Secondary", "Tertiary", "Accent", "Heading Text", "Body Text", "Surface", "Border"]

function projectSnapshot(project: {
  palette: Swatch[]
  selection: Selection
  templateByType: Record<string, string>
  elementOverrides: ElementOverrides
  roleBindings: RoleBindings
  unassignedRoleSwatchIds: string[]
  brand: Brand
}): WorkspaceSnapshot {
  return {
    palette: project.palette,
    selection: project.selection,
    templateByType: project.templateByType,
    elementOverrides: project.elementOverrides,
    roleBindings: project.roleBindings,
    unassignedRoleSwatchIds: project.unassignedRoleSwatchIds,
    brand: project.brand,
  }
}

export default function Builder() {
  const nav = useNav()
  const [, navigate] = useRoute()
  const toast = useToast()
  const previewRef = useRef<PreviewRendererHandle | null>(null)
  const canvasRef = useRef<HTMLElement | null>(null)
  const moreMenuRef = useRef<HTMLDivElement | null>(null)
  const randomiseCount = useRef(0)
  const recentCurated = useRef<number[]>([])

  const [initial] = useState(() => loadWorkspace())
  const historyRef = useRef(createHistoryState(projectSnapshot(initial.project)))
  const quickPreviewRef = useRef(initial.project.preferences.quickPreview)
  const [forceHistory, setForceHistory] = useState(0)

  const [palette, setPalette] = useState<Swatch[]>(() => initial.project.palette)
  const [selection, setSelection] = useState<Selection>(() => initial.project.selection)
  const [templateByType, setTemplateByType] = useState<Record<string, string>>(() => initial.project.templateByType)
  const [brand, setBrandState] = useState<Brand>(() => initial.project.brand)
  const [selectedElement, setSelectedElement] = useState<InspectorSelection | null>(null)
  const [elementOverrides, setElementOverrides] = useState<ElementOverrides>(() => initial.project.elementOverrides)
  const [roleBindings, setRoleBindings] = useState<RoleBindings>(() => initial.project.roleBindings)
  const [unassignedRoleSwatchIds, setUnassignedRoleSwatchIds] = useState<string[]>(() => initial.project.unassignedRoleSwatchIds)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [templateDraft, setTemplateDraft] = useState<TemplateDraft | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const [paletteSheetOpen, setPaletteSheetOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(() => initial.project.preferences.paletteOpen)
  const [customiseOpen, setCustomiseOpen] = useState(() => initial.project.preferences.customiseOpen)
  const [fullscreen, setFullscreen] = useState(false)
  const fullscreenRestoreRef = useRef<{ paletteOpen: boolean; customiseOpen: boolean; zoom: number } | null>(null)
  const restoreZoomRef = useRef<number | null>(null)
  const [brandOpen, setBrandOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportPaywallOpen, setExportPaywallOpen] = useState(false)
  const [accountSetupOpen, setAccountSetupOpen] = useState(false)
  const [secondOpinionOpen, setSecondOpinionOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const {
    payFirstExport,
    createAccount,
    subscribePro,
    canUseFeature: canUseEntitlementFeature,
    canExportDesign,
    needsExportPaywall: needsExportPaywallGate,
    needsAccountSetup: needsAccountSetupGate,
    needsPro: needsProGate,
    needsExportEarlyAccess,
    canUseWorkspace,
  } = useEntitlement()
  const [paywall, setPaywall] = useState<{ open: boolean; reason?: string }>({ open: false })
  const [designId] = useState<string>(() => initial.project.designId)

  const applySnapshot = useCallback((snap: WorkspaceSnapshot) => {
    setPalette(snap.palette)
    setSelection(snap.selection as Selection)
    setTemplateByType(snap.templateByType)
    setElementOverrides(snap.elementOverrides)
    setRoleBindings(snap.roleBindings)
    setUnassignedRoleSwatchIds(snap.unassignedRoleSwatchIds)
    setBrandState(snap.brand)
  }, [])

  const commit = useCallback((updater: (snap: WorkspaceSnapshot) => WorkspaceSnapshot) => {
    const next = updater(historyRef.current.snapshot)
    historyRef.current = historyRef.current.pushSnapshot(next)
    applySnapshot(next)
    setForceHistory((tick) => tick + 1)
  }, [applySnapshot])

  const setBrand = useCallback((next: Brand) => {
    commit((snap) => ({ ...snap, brand: next }))
  }, [commit])

  useEffect(() => {
    if (import.meta.env.DEV && initial.recovered) {
      console.info("[HueSet] Workspace recovered from invalid data:", initial.issues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (needsProGate()) setPaywall({ open: true, reason: "Your free first design is complete. Subscribe to Pro for unlimited access." })
  }, [needsProGate])

  useEffect(() => { writeHashPalette(palette) }, [palette])

  useEffect(() => {
    saveWorkspaceProject({
      schemaVersion: 2,
      palette,
      selection,
      templateByType,
      brand,
      designId,
      elementOverrides,
      roleBindings,
      unassignedRoleSwatchIds,
      preferences: { paletteOpen, customiseOpen, quickPreview: quickPreviewRef.current },
    })
  }, [palette, selection, templateByType, brand, designId, elementOverrides, roleBindings, unassignedRoleSwatchIds, paletteOpen, customiseOpen])

  useEffect(() => {
    const result = readGenerateResult()
    if (!result) return
    commit((snap) => ({
      ...snap,
      selection: { group: result.group, sub: result.sub },
      templateByType: { ...snap.templateByType, [`${result.group}/${result.sub}`]: result.templateId },
    }))
  }, [commit])

  useEffect(() => {
    const onHashChange = () => {
      const hashPalette = readHashPalette()
      if (!hashPalette) return
      historyRef.current.withSkipHistory(() => {
        const snap = historyRef.current.snapshot
        const nextPalette = mergeHashPalette(snap.palette, hashPalette)
        if (nextPalette.map((swatch) => swatch.hex).join() === snap.palette.map((swatch) => swatch.hex).join()) return
        const updated = { ...snap, palette: nextPalette }
        historyRef.current = historyRef.current.pushSnapshot(updated)
        applySnapshot(updated)
        setForceHistory((tick) => tick + 1)
      })
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [applySnapshot])

  useEffect(() => {
    if (!moreOpen) return
    const close = (event: PointerEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) setMoreOpen(false)
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [moreOpen])

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
    const onFullscreenChange = () => {
      const active = document.fullscreenElement === canvasRef.current
      setFullscreen(active)
      if (!active && fullscreenRestoreRef.current) {
        restoreZoomRef.current = fullscreenRestoreRef.current.zoom
        setPaletteOpen(fullscreenRestoreRef.current.paletteOpen)
        setCustomiseOpen(fullscreenRestoreRef.current.customiseOpen)
        const zoom = fullscreenRestoreRef.current.zoom
        fullscreenRestoreRef.current = null
        requestAnimationFrame(() => previewRef.current?.setZoom(zoom))
      }
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (document.fullscreenElement) return
        setPaletteSheetOpen(false)
        setTemplateOpen(false)
        setTemplateDraft(null)
        setMoreOpen(false)
        return
      }
      const target = event.target as HTMLElement | null
      if (target?.matches("input, textarea, [contenteditable='true']")) return
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

  const currentGroup = GROUPS.find((group) => group.key === selection.group) ?? GROUPS[0]
  const currentType = currentGroup.subs.find((type) => type.key === selection.sub) ?? currentGroup.subs[0]
  const selectionKey = `${currentGroup.key}/${currentType.key}`
  const templateId = templateByType[selectionKey] ?? currentType.templates[0]?.key ?? ""
  const templateAsset = templateAssetById.get(templateId)
  const templateName = templateAsset?.name ?? `${currentType.templates.find((item) => item.key === templateId)?.label ?? "Default"} ${currentType.label}`

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (restoreZoomRef.current != null) {
        previewRef.current?.setZoom(restoreZoomRef.current)
        restoreZoomRef.current = null
        return
      }
      previewRef.current?.fitToScreen()
    })
    return () => cancelAnimationFrame(frame)
  }, [templateId, selectionKey, paletteOpen, customiseOpen])
  const roleLabels = selection.group === "application" ? APPLICATION_ROLE_LABELS : WEBSITE_ROLE_LABELS
  const unassignedRoleSwatchIdSet = useMemo(() => new Set(unassignedRoleSwatchIds), [unassignedRoleSwatchIds])
  const activeRoleLabels = useMemo(() => roleLabels.map((label, index) => {
    const swatchId = palette[index]?.id
    return swatchId && unassignedRoleSwatchIdSet.has(swatchId) ? null : label
  }), [palette, roleLabels, unassignedRoleSwatchIdSet])
  const theme = useMemo(() => deriveTheme(palette, activeRoleLabels, roleBindings), [palette, activeRoleLabels, roleBindings])
  const trio = useMemo(() => paletteToTrio(palette), [palette])
  const tokenSystem = useMemo(() => createTokenSystem(palette), [palette])
  const accessibilityChecks = useMemo(() => evaluateAccessibility(theme, tokenSystem), [theme, tokenSystem])

  const selectElement = useCallback((el: InspectorSelection) => {
    setSelectedElement(el)
    if (!customiseOpen) setCustomiseOpen(true)
    markOnboardingStep("edit")
  }, [customiseOpen])

  const clearSelection = useCallback(() => setSelectedElement(null), [])

  const handleElementChange = useCallback((key: string, value: string | boolean) => {
    if (!selectedElement) return
    const elementId = selectedElement.id
    commit((snap) => {
      const prev = snap.elementOverrides[elementId] ?? {}
      return {
        ...snap,
        elementOverrides: { ...snap.elementOverrides, [elementId]: { ...prev, [key]: value } },
      }
    })
  }, [commit, selectedElement])

  const reorderPalette = useCallback((activeId: string, overId: string) => {
    commit((snap) => {
      const from = snap.palette.findIndex((s) => s.id === activeId)
      const to = snap.palette.findIndex((s) => s.id === overId)
      if (from === -1 || to === -1 || from === to) return snap
      const next = [...snap.palette]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return { ...snap, palette: next }
    })
  }, [commit])

  const paletteRoleOptions = useMemo(() => {
    if (selection.group === "application") {
      return APPLICATION_ROLE_LABELS
    }
    return WEBSITE_ROLE_LABELS
  }, [selection.group])

  const handleRoleChange = useCallback((role: string, swatchId: string) => {
    commit((snap) => {
      const result = applyRoleChange(role, swatchId, snap.roleBindings, snap.unassignedRoleSwatchIds, paletteRoleOptions)
      return { ...snap, ...result }
    })
  }, [commit, paletteRoleOptions])

  const currentElementValues = useMemo(() => {
    if (!selectedElement) return null
    const override = elementOverrides[selectedElement.id]
    return { ...ELEMENT_DEFAULTS[selectedElement.kind], ...override }
  }, [selectedElement, elementOverrides])

  const previewContext = useMemo<PreviewCtxValue>(() => ({
    editMode: true,
    assignments: {},
    roleColor: (roleName) => {
      const boundId = roleBindings[roleName]
      return boundId ? palette.find((swatch) => swatch.id === boundId)?.hex : undefined
    },
    tokenColor: (role) => {
      const key = semanticKeyForRole(role)
      return key ? semanticColour(tokenSystem, palette, key, theme.accent) : theme.accent
    },
    brand,
    buttonStyle: "flat",
    buttonProps: DEFAULT_BUTTON_PROPS,
    trio,
    selectedElement,
    elementOverrides,
    tokenSystem,
    selectElement,
  }), [brand, elementOverrides, palette, roleBindings, selectedElement, selectElement, theme.accent, tokenSystem, trio])

  const openTemplatePanel = useCallback(() => {
    setTemplateDraft({
      group: selection.group,
      sub: currentType.key,
      templateId,
    })
    setTemplateOpen(true)
    setMoreOpen(false)
  }, [selection.group, currentType.key, templateId])

  const cancelTemplateDraft = useCallback(() => {
    setTemplateDraft(null)
    setTemplateOpen(false)
  }, [])

  const draftState = templateDraft ?? { group: selection.group, sub: currentType.key, templateId }
  const draftGroup = PICKER_GROUPS.find((group) => group.key === draftState.group) ?? PICKER_GROUPS[0]
  const draftType = draftGroup.subs.find((type) => type.key === draftState.sub) ?? draftGroup.subs[0]
  const draftTemplateId = draftState.templateId || draftType.templates[0]?.key || ""
  const draftVariantLabel = draftType.templates.find((item) => item.key === draftTemplateId)?.label ?? draftType.templates[0]?.label ?? "Default"
  const templateDraftDirty = templateDraft !== null && (
    templateDraft.group !== selection.group
    || templateDraft.sub !== currentType.key
    || templateDraft.templateId !== templateId
  )

  const applyTemplateDraft = useCallback(() => {
    if (!templateDraft) return
    if (!canUseWorkspace()) {
      setPaywall({ open: true, reason: "Your free first design is complete. Subscribe to Pro for unlimited access." })
      return
    }
    const pickerGroup = PICKER_GROUPS.find((group) => group.key === templateDraft.group)
    const pickerType = pickerGroup?.subs.find((type) => type.key === templateDraft.sub)
    const nextTemplateId = templateDraft.templateId || pickerType?.templates[0]?.key || templateId
    commit((snap) => ({
      ...snap,
      selection: { group: templateDraft.group, sub: templateDraft.sub },
      templateByType: { ...snap.templateByType, [`${templateDraft.group}/${templateDraft.sub}`]: nextTemplateId },
    }))
    markOnboardingStep("template")
    cancelTemplateDraft()
  }, [cancelTemplateDraft, commit, canUseWorkspace, templateDraft, templateId])

  const openBrandAssets = useCallback(() => {
    if (!canUseEntitlementFeature("brandAssets")) {
      setPaywall({ open: true, reason: "Brand assets require a Pro subscription." })
      return
    }
    setBrandOpen(true)
    setMoreOpen(false)
  }, [canUseEntitlementFeature])

  const openSecondOpinion = useCallback(() => {
    setSecondOpinionOpen(true)
    setMoreOpen(false)
  }, [])

  const changeColour = (id: string, hex: string) => {
    commit((snap) => ({
      ...snap,
      palette: snap.palette.map((swatch) => swatch.id === id ? updateSwatchHex(swatch, hex) : swatch),
    }))
    markOnboardingStep("pick")
  }
  const renameColour = (id: string, name: string) => commit((snap) => ({
    ...snap,
    palette: snap.palette.map((swatch) => swatch.id === id ? { ...swatch, name, autoNamed: false } : swatch),
  }))
  const toggleLock = (id: string) => commit((snap) => ({
    ...snap,
    palette: snap.palette.map((swatch) => swatch.id === id ? { ...swatch, locked: !swatch.locked } : swatch),
  }))
  const addColour = () => {
    commit((snap) => ({
      ...snap,
      palette: [...snap.palette, createSwatch(randomHex(), snap.palette.length)],
    }))
    markOnboardingStep("pick")
  }
  const removeColour = (id: string) => commit((snap) => {
    if (snap.palette.length <= 1) return snap
    const { roleBindings: nextBindings, unassignedRoleSwatchIds: nextUnassigned } = pruneBindingsForSwatch(id, snap.roleBindings, snap.unassignedRoleSwatchIds)
    return {
      ...snap,
      palette: snap.palette.filter((swatch) => swatch.id !== id),
      roleBindings: nextBindings,
      unassignedRoleSwatchIds: nextUnassigned,
    }
  })

  const coherentElementOverrides = (prev: ElementOverrides): ElementOverrides => {
    const typo = randomTypographyTokens()
    const btn = randomButtonTokens()
    const next = { ...prev }
    for (const [id, ov] of Object.entries(next)) {
      if (id.startsWith("text-") || id.includes("/text")) {
        next[id] = { ...ov, ...typo }
      } else if (id.startsWith("button-") || id.includes("/button")) {
        next[id] = { ...ov, ...btn }
      }
    }
    return next
  }

  const smartRandomise = (current: Swatch[]) => {
    const hue = Math.floor(Math.random() * 360)
    const dark = Math.random() < 0.35
    const roles = [
      { s: dark ? 15 : 20, l: dark ? 12 : 96 },
      { s: dark ? 12 : 12, l: dark ? 18 : 100 },
      { s: 65, l: 52 },
      { s: dark ? 5 : 12, l: dark ? 92 : 15 },
      { s: dark ? 10 : 8, l: dark ? 65 : 42 },
    ]
    return current.map((swatch, index) => randomiseUnlockedHex(
      swatch,
      hslToHex((hue + Math.max(0, index - roles.length + 1) * 43) % 360, roles[index]?.s ?? 55, roles[index]?.l ?? 55),
    ))
  }

  const randomise = () => {
    if (!palette.some((swatch) => !swatch.locked)) {
      toast.push("Unlock a colour before randomising", "error")
      return
    }
    randomiseCount.current += 1
    markOnboardingStep("pick")
    if (randomiseCount.current % 3 === 0) {
      const locks = palette.flatMap((swatch, index) => swatch.locked && index < 5 ? [{ idx: index, hex: swatch.hex }] : [])
      const curated = pickCuratedPalette(locks, recentCurated.current)
      if (curated) {
        recentCurated.current = [curated.index, ...recentCurated.current].slice(0, 20)
        commit((snap) => ({
          ...snap,
          palette: refreshPaletteAutoNames(snap.palette.map((swatch, index) => randomiseUnlockedHex(swatch, curated.palette[index] ?? randomHex()))),
        }))
        return
      }
    }
    commit((snap) => ({
      ...snap,
      palette: refreshPaletteAutoNames(smartRandomise(snap.palette)),
      elementOverrides: coherentElementOverrides(snap.elementOverrides),
    }))
  }

  const reset = () => {
    commit((snap) => ({
      ...snap,
      palette: createDefaultPalette(),
      roleBindings: {},
      unassignedRoleSwatchIds: [],
      elementOverrides: {},
    }))
    setConfirmReset(false)
    toast.push("Palette reset", "success")
  }

  const toggleFullscreen = async () => {
    if (!canUseEntitlementFeature("fullScreen")) {
      setPaywall({ open: true, reason: "Full screen preview requires a Pro subscription." })
      return
    }
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }
      fullscreenRestoreRef.current = { paletteOpen, customiseOpen, zoom: previewRef.current?.getZoom() ?? 1 }
      setPaletteOpen(false)
      setCustomiseOpen(false)
      await canvasRef.current?.requestFullscreen()
    } catch {
      fullscreenRestoreRef.current = null
      toast.push("Full screen is not available in this browser", "error")
    }
  }

  const handleExport = () => {
    if (needsExportPaywallGate()) {
      setExportPaywallOpen(true)
      return
    }
    if (needsAccountSetupGate()) {
      setAccountSetupOpen(true)
      return
    }
    if (canExportDesign(designId)) {
      setExportOpen(true)
      return
    }
    if (needsProGate()) {
      setPaywall({ open: true, reason: "Export requires a Pro subscription after your first design." })
      return
    }
    if (needsExportEarlyAccess(designId)) {
      setExportPaywallOpen(true)
      return
    }
    setExportPaywallOpen(true)
  }

  const reopenProject = (project: ImportedProject) => {
    commit((snap) => {
      let next: WorkspaceSnapshot = { ...snap, palette: project.palette }
      const id = project.project?.templateId
      const asset = id ? templateAssetById.get(id) : undefined
      if (asset) {
        const group = asset.category.toLowerCase() as GroupKey
        const type = GROUPS.find((item) => item.key === group)?.subs.find((item) => item.templates.some((template) => template.key === id))
        if (type) {
          next = {
            ...next,
            selection: { group, sub: type.key },
            templateByType: { ...next.templateByType, [`${group}/${type.key}`]: id! },
          }
        }
      }
      return next
    })
  }

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-offwhite text-charcoal">
      {paletteOpen && (
        <PaletteRail
          className="hidden w-[240px] shrink-0 border-r border-softgrey lg:flex"
          palette={palette}
          onAdd={addColour}
          onChange={changeColour}
          onRename={renameColour}
          onRemove={removeColour}
          onToggleLock={toggleLock}
          onReorder={reorderPalette}
          roleBindings={roleBindings}
          roleOptions={paletteRoleOptions}
          defaultRoleByIndex={paletteRoleOptions}
          unassignedRoleSwatchIds={unassignedRoleSwatchIds}
          onRoleChange={handleRoleChange}
          onClose={() => setPaletteOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 overflow-x-auto border-b border-softgrey bg-white px-2 sm:px-3">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <a href="/" onClick={nav("/")} className="grid h-11 w-11 shrink-0 place-items-center rounded-[7px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta" aria-label="HueSet home" title="HueSet home">
              <img src="/app-icon-64.png" alt="" width={24} height={24} className="h-6 w-6 rounded-[6px]" />
            </a>
            <ToolbarButton className="lg:hidden" label="Open palette" onClick={() => { setPaletteSheetOpen(true); setCustomiseOpen(false) }}><PaletteIcon /></ToolbarButton>
            <ToolbarButton className="hidden lg:grid" label={paletteOpen ? "Hide palette" : "Show palette"} pressed={paletteOpen} onClick={() => setPaletteOpen((open) => !open)}><PaletteIcon /></ToolbarButton>
            <span className="hidden min-w-0 flex-1 truncate px-1 text-[12px] font-semibold text-charcoal/70 sm:block" title={templateName}>{templateName}</span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <ToolbarButton className="sm:grid" label="Undo" shortcuts="Meta+Z Control+Z" onClick={undo} disabled={!canUndo}><UndoIcon /></ToolbarButton>
            <ToolbarButton className="sm:grid" label="Redo" shortcuts="Meta+Shift+Z Control+Shift+Z Control+Y" onClick={redo} disabled={!canRedo}><RedoIcon /></ToolbarButton>
            <ToolbarAction label="Randomise" onClick={randomise}><DiceIcon /></ToolbarAction>
            <ToolbarAction label="Reset" onClick={() => setConfirmReset(true)}><ResetIcon /></ToolbarAction>
            <ChangeTemplatePanel
              compact
              triggerLabel="Change template"
              open={templateOpen}
              onToggle={() => {
                if (templateOpen) cancelTemplateDraft()
                else openTemplatePanel()
              }}
              onClose={cancelTemplateDraft}
              template={draftGroup.label}
              templates={PICKER_GROUPS.map((group) => group.label)}
              onTemplate={(label) => {
                const group = PICKER_GROUPS.find((item) => item.label === label)
                const firstType = group?.subs[0]
                if (!group || !firstType) return
                setTemplateDraft({
                  group: group.key,
                  sub: firstType.key,
                  templateId: firstType.templates[0]?.key ?? "",
                })
              }}
              layout={draftType.label}
              layouts={draftGroup.subs.map((type) => type.label)}
              onLayout={(label) => {
                const type = draftGroup.subs.find((item) => item.label === label)
                if (!type) return
                setTemplateDraft((current) => ({
                  group: (current ?? draftState).group,
                  sub: type.key,
                  templateId: type.templates[0]?.key ?? "",
                }))
              }}
              variant={draftVariantLabel}
              variants={draftType.templates.map((template) => template.label)}
              onVariant={(label) => {
                const template = draftType.templates.find((item) => item.label === label)
                if (!template) return
                setTemplateDraft((current) => ({
                  group: (current ?? draftState).group,
                  sub: (current ?? draftState).sub,
                  templateId: template.key,
                }))
              }}
              onApply={applyTemplateDraft}
              onCancel={cancelTemplateDraft}
              canApply={templateDraftDirty}
            />
            <ToolbarAction label="Export" onClick={handleExport}><ExportIcon /></ToolbarAction>
            <ToolbarAction label="Second Opinion" onClick={openSecondOpinion}><SecondOpinionIcon /></ToolbarAction>
            <div ref={moreMenuRef} className="relative min-[1600px]:hidden">
              <ToolbarButton label="More tools" pressed={moreOpen} onClick={() => { setMoreOpen((open) => !open); setTemplateOpen(false) }}><MoreIcon /></ToolbarButton>
              {moreOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-[190px] rounded-[8px] border border-softgrey bg-white p-1.5 shadow-xl" role="menu" aria-label="More workspace tools">
                  <MenuAction label="Brand assets" onClick={openBrandAssets}><BrandIcon /></MenuAction>
                  <MenuAction label="Center template" onClick={() => { previewRef.current?.fitToScreen(); setMoreOpen(false) }}><CenterIcon /></MenuAction>
                  <MenuAction label="Full screen" onClick={() => { void toggleFullscreen(); setMoreOpen(false) }}><FullscreenIcon /></MenuAction>
                  <MenuAction className="lg:hidden" label={customiseOpen ? "Hide customise" : "Show customise"} onClick={() => { setCustomiseOpen((open) => !open); setPaletteSheetOpen(false); setMoreOpen(false) }}><CustomiseIcon /></MenuAction>
                </div>
              )}
            </div>
            <ToolbarButton className="hidden min-[1600px]:grid" label="Brand assets" onClick={openBrandAssets}><BrandIcon /></ToolbarButton>
            <ToolbarButton className="hidden min-[1600px]:grid" label="Center template" onClick={() => previewRef.current?.fitToScreen()}><CenterIcon /></ToolbarButton>
            <ToolbarButton className="hidden min-[1600px]:grid" label="Full screen" onClick={toggleFullscreen}><FullscreenIcon /></ToolbarButton>
            <ToolbarButton className="hidden lg:grid" label={customiseOpen ? "Hide customise" : "Show customise"} pressed={customiseOpen} onClick={() => { setCustomiseOpen((open) => !open); setPaletteSheetOpen(false) }}><CustomiseIcon /></ToolbarButton>
          </div>
        </header>

        <main ref={canvasRef} className="relative min-h-0 flex-1 overflow-hidden bg-softgrey p-2 sm:p-3" aria-label="Preview canvas">
          {fullscreen && (
            <div className="absolute left-2 right-2 top-2 z-30 flex items-center justify-between gap-2 rounded-[8px] border border-softgrey bg-white/95 px-2 py-1.5 shadow-sm backdrop-blur">
              <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
                {palette.slice(0, 8).map((swatch) => (
                  <button
                    key={swatch.id}
                    type="button"
                    className="h-11 w-11 shrink-0 rounded-[7px] border border-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
                    style={{ background: swatch.hex }}
                    aria-label={`${swatch.name} ${swatch.hex}`}
                    title={`${swatch.name} ${swatch.hex}`}
                    onClick={() => { setPaletteSheetOpen(true) }}
                  />
                ))}
                <ToolbarButton label="Open palette" onClick={() => setPaletteSheetOpen(true)}><PaletteIcon /></ToolbarButton>
              </div>
              <button
                type="button"
                onClick={() => { void toggleFullscreen() }}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[7px] border border-softgrey bg-white px-3 text-[12px] font-semibold text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
              >
                Exit Full Screen
              </button>
            </div>
          )}
          {fullscreen && paletteSheetOpen && (
            <div className="absolute inset-x-2 bottom-2 top-16 z-40 overflow-hidden rounded-[8px] border border-softgrey bg-white shadow-xl">
              <PaletteRail
                className="h-full w-full"
                palette={palette}
                onAdd={addColour}
                onChange={changeColour}
                onRename={renameColour}
                onRemove={removeColour}
                onToggleLock={toggleLock}
                onReorder={reorderPalette}
                roleBindings={roleBindings}
                roleOptions={paletteRoleOptions}
                defaultRoleByIndex={paletteRoleOptions}
                unassignedRoleSwatchIds={unassignedRoleSwatchIds}
                onRoleChange={handleRoleChange}
                onClose={() => setPaletteSheetOpen(false)}
              />
            </div>
          )}
          <ErrorBoundary
            label="editor-preview"
            fallback={(error) => (
              <div className="grid h-full place-items-center rounded-[8px] bg-white text-center">
                <div className="flex flex-col items-center gap-3 px-6">
                  <p className="text-[14px] font-semibold text-charcoal/60">Preview failed to render</p>
                  {import.meta.env.DEV && (
                    <p className="max-w-xs text-[11px] text-charcoal/40">{error.message}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-lg border border-softgrey bg-white px-4 py-2 text-[12px] font-semibold text-charcoal hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
                  >
                    Reload
                  </button>
                </div>
              </div>
            )}
          >
            <div className="h-full w-full overflow-hidden rounded-[8px] border border-charcoal/10 bg-white">
              <PreviewProvider value={previewContext}>
                <ScopeProvider value={`${selection.group}/${selection.sub}/${templateId}`}>
                  <PreviewRenderer ref={previewRef} group={selection.group} sub={selection.sub} templateId={templateId} theme={theme} />
                </ScopeProvider>
              </PreviewProvider>
            </div>
          </ErrorBoundary>
        </main>
      </div>

      {customiseOpen && (
        <CustomisePanel
          onClose={() => setCustomiseOpen(false)}
          className="fixed bottom-0 right-0 top-12 z-30 flex w-[min(280px,100vw)] shrink-0 flex-col border-l border-softgrey bg-white shadow-xl lg:static lg:z-auto lg:shadow-none"
          selectedElement={selectedElement}
          elementValues={currentElementValues}
          onElementChange={handleElementChange}
          onClearSelection={clearSelection}
          roleOptions={roleLabels}
          templateSection={
            <div className="grid grid-cols-2 gap-1.5">
              {PICKER_GROUPS.find((group) => group.key === selection.group)?.subs.map((type) => {
                const active = type.key === currentType.key
                return (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => {
                      setTemplateDraft({
                        group: selection.group,
                        sub: type.key,
                        templateId: templateByType[`${selection.group}/${type.key}`] ?? type.templates[0]?.key ?? "",
                      })
                      setTemplateOpen(true)
                    }}
                    aria-pressed={active}
                    className={`min-h-11 rounded-[6px] border text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta ${active ? "border-brand-cta bg-brand-cta/10 text-brand-ink" : "border-softgrey text-charcoal/55 hover:bg-offwhite hover:text-charcoal"}`}
                  >
                    {type.label}
                  </button>
                )
              })}
            </div>
          }
        />
      )}

      {paletteSheetOpen && !fullscreen && (
        <SheetBackdrop className="lg:hidden" onClose={() => setPaletteSheetOpen(false)}>
          <PaletteRail
            className="h-[min(72dvh,680px)] w-full rounded-t-[8px] border-t border-softgrey"
            palette={palette}
            onAdd={addColour}
            onChange={changeColour}
            onRename={renameColour}
            onRemove={removeColour}
            onToggleLock={toggleLock}
            onReorder={reorderPalette}
            roleBindings={roleBindings}
            roleOptions={paletteRoleOptions}
            defaultRoleByIndex={paletteRoleOptions}
            unassignedRoleSwatchIds={unassignedRoleSwatchIds}
            onRoleChange={handleRoleChange}
          />
        </SheetBackdrop>
      )}

      {brandOpen && <BrandUpload brand={brand} onChange={setBrand} onClose={() => setBrandOpen(false)} />}

      <ExportPanel
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        palette={palette}
        tokenSystem={tokenSystem}
        project={{ templateId, brand }}
        accessibilityChecks={accessibilityChecks}
        onImportProject={reopenProject}
        onToast={(message, kind) => toast.push(message, kind)}
        onSuccessfulExport={() => markOnboardingStep("export")}
        locked={!canUseEntitlementFeature("exportCode", designId)}
      />

      <ExportPaywallOverlay
        open={exportPaywallOpen}
        onPay={() => {
          payFirstExport(designId)
          setExportPaywallOpen(false)
          setAccountSetupOpen(true)
        }}
        onLater={() => setExportPaywallOpen(false)}
      />

      <AccountSetupOverlay
        open={accountSetupOpen}
        onComplete={(profile) => {
          createAccount(profile)
          setAccountSetupOpen(false)
          setExportOpen(true)
        }}
        onLater={() => {
          createAccount({ name: "", email: "" })
          setAccountSetupOpen(false)
          setExportOpen(true)
        }}
      />

      <SecondOpinionPanel
        open={secondOpinionOpen}
        onClose={() => setSecondOpinionOpen(false)}
        checks={accessibilityChecks}
        unlocked={canUseEntitlementFeature("secondOpinion")}
        onUpgrade={() => { setSecondOpinionOpen(false); setPaywall({ open: true, reason: "Second Opinion is a Pro feature. Subscribe for full accessibility analysis." }) }}
      />

      <OnboardingCard />

      <ConfirmDialog
        open={confirmReset}
        title="Reset your palette?"
        body="Your current colours will be replaced by the defaults. You can undo this change."
        confirmLabel="Reset palette"
        destructive
        onConfirm={reset}
        onCancel={() => setConfirmReset(false)}
      />

      <PaywallOverlay
        open={paywall.open}
        reason={paywall.reason}
        onUnlock={() => {
          if (!PAYMENTS_ENABLED) return
          subscribePro()
          setPaywall({ open: false })
          toast.push("Pro unlocked", "success")
        }}
        onLater={() => setPaywall({ open: false })}
      />
    </div>
  )
}

function ToolbarButton({ label, onClick, children, disabled = false, pressed, className = "", shortcuts }: { label: string; onClick: () => void; children: ReactNode; disabled?: boolean; pressed?: boolean; className?: string; shortcuts?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} aria-pressed={pressed} aria-keyshortcuts={shortcuts} title={label} className={`grid h-11 w-11 shrink-0 place-items-center rounded-[7px] text-charcoal/55 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta disabled:cursor-not-allowed disabled:opacity-30 ${pressed ? "bg-offwhite text-charcoal" : ""} ${className}`}>
      {children}
    </button>
  )
}

function ToolbarAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-[7px] px-0 text-[12px] font-semibold text-charcoal/65 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta min-[1400px]:w-auto min-[1400px]:px-3">
      {children}<span className="hidden min-[1400px]:inline">{label}</span>
    </button>
  )
}

function MenuAction({ label, onClick, children, className = "" }: { label: string; onClick: () => void; children: ReactNode; className?: string }) {
  return <button type="button" role="menuitem" onClick={onClick} className={`flex h-11 w-full items-center gap-3 rounded-[7px] px-3 text-left text-[12px] font-semibold text-charcoal/70 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta ${className}`}><span className="grid w-5 place-items-center">{children}</span>{label}</button>
}

function SheetBackdrop({ children, onClose, className = "" }: { children: ReactNode; onClose: () => void; className?: string }) {
  const dialogRef = useDialogFocus<HTMLDivElement>(true, onClose)
  return (
    <div className={`fixed inset-0 z-50 flex items-end bg-charcoal/30 ${className}`} onMouseDown={onClose} role="dialog" aria-modal="true" aria-label="Palette">
      <div ref={dialogRef} className="w-full" onMouseDown={(event) => event.stopPropagation()}>{children}</div>
    </div>
  )
}

const PaletteIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 5h16M4 12h16M4 19h10" /><circle cx="7" cy="5" r="2" fill="currentColor" stroke="none" /><circle cx="14" cy="12" r="2" fill="currentColor" stroke="none" /><circle cx="9" cy="19" r="2" fill="currentColor" stroke="none" /></svg>
const UndoIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 6 6v1" /></svg>
const RedoIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 14 5-5-5-5" /><path d="M20 9H10a6 6 0 0 0-6 6v1" /></svg>
const DiceIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" /></svg>
const ResetIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
const BrandIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="9" /></svg>
const CenterIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /><circle cx="12" cy="12" r="2" /></svg>
const FullscreenIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg>
const ExportIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3v12M7 8l5-5 5 5" /><path d="M5 13v7h14v-7" /></svg>
const SecondOpinionIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
const CustomiseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /></svg>
const MoreIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
