import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { deriveTheme, hslToHex, randomHex, uid, type RoleBindings, type Swatch } from "../lib/color"
import { DEFAULT_BUTTON_PROPS, paletteToTrio, type ButtonStyle } from "../components/ButtonPreview"
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
import { canExport, canUseWorkspace, loadEntitlement, mockCreateAccount, mockPayFirstExport, mockSubscribePro, needsAccountSetup, needsExportPaywall, needsPro, saveEntitlement, type Entitlement } from "../lib/entitlement"
import { evaluateAccessibility } from "../lib/accessibility"
import { createDefaultPalette, loadPalette, readHashPalette, writeHashPalette } from "../lib/paletteStore"
import { useNav, useRoute } from "../lib/router"
import { pickCuratedPalette } from "../lib/curatedPalettes"
import { ELEMENT_DEFAULTS, elementTokens, randomTypographyTokens, randomButtonTokens, type ElementOverrides, type InspectorSelection } from "../lib/designTokens"
import { createTokenSystem, semanticColour, semanticKeyForRole } from "../lib/tokenSystem"
import { templateAssetById } from "../lib/templateAssets"
import { readGenerateResult } from "../lib/generateFlowStore"
import { isBrandLike, isString, isStringArray, isStringMap, isPlainObject } from "../lib/storedShape"

type Selection = { group: GroupKey; sub: string }

const STORE_KEY = "hueframe:v1"
const MAX_HISTORY = 40
const START_NAMES = ["Primary", "Secondary", "Tertiary", "Quaternary", "Quinary", "Senary"]
const DEFAULT_SELECTION: Selection = { group: "website", sub: "landing-page" }
const WEBSITE_ROLE_LABELS = ["Page Background", "Secondary Background", "Brand Primary", "Secondary", "Tertiary", "Accent", "Heading Text", "Body Text", "Surface", "Border"]
const APPLICATION_ROLE_LABELS = ["App Background", "Secondary Background", "Brand Primary", "Secondary", "Tertiary", "Accent", "Heading Text", "Body Text", "Surface", "Border"]

/**
 * Reads one key out of the shared project blob.
 *
 * `isValid` is optional but should be supplied whenever the caller feeds the
 * result somewhere that assumes a shape (iteration, spread, Object.entries).
 * Without it a corrupted value reaches render and throws.
 */
function loadStored<T>(key: string, fallback: T, isValid?: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return fallback
    const value = JSON.parse(raw)?.[key]
    if (value === undefined || value === null) return fallback
    if (isValid && !isValid(value)) return fallback
    return value as T
  } catch {
    return fallback
  }
}

function loadBrand(): Brand {
  const brand = loadStored<Brand>("brand", { name: "HueSet", logo: null, symbol: null }, isBrandLike as (v: unknown) => v is Brand)
  return brand.name === "Palette Preview" ? { ...brand, name: "HueSet" } : brand
}

function useStored(key: string, value: unknown) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      const data = raw ? JSON.parse(raw) : {}
      data[key] = value
      localStorage.setItem(STORE_KEY, JSON.stringify(data))
    } catch {
      /* storage unavailable */
    }
  }, [key, value])
}

export default function Builder() {
  const nav = useNav()
  const [, navigate] = useRoute()
  const toast = useToast()
  const previewRef = useRef<PreviewRendererHandle | null>(null)
  const canvasRef = useRef<HTMLElement | null>(null)
  const moreMenuRef = useRef<HTMLDivElement | null>(null)
  const skipHistory = useRef(false)
  const randomiseCount = useRef(0)
  const recentCurated = useRef<number[]>([])

  const [palette, setPalette] = useState<Swatch[]>(loadPalette)
  const [selection, setSelection] = useState<Selection>(DEFAULT_SELECTION)
  const [templateByType, setTemplateByType] = useState<Record<string, string>>(() => loadStored("templateByType", {}, isStringMap))
  const [brand, setBrand] = useState<Brand>(loadBrand)
  const [assignments] = useState<Record<string, string>>(() => loadStored("assignments", {}, isStringMap))
  const [buttonStyle] = useState<ButtonStyle>(() => loadStored("buttonStyle", "flat" as ButtonStyle, isString as (v: unknown) => v is ButtonStyle))
  const [selectedElement, setSelectedElement] = useState<InspectorSelection | null>(null)
  const [elementOverrides, setElementOverrides] = useState<ElementOverrides>(() => loadStored("elementOverrides", {}, isPlainObject as (v: unknown) => v is ElementOverrides))
  const [roleBindings, setRoleBindings] = useState<RoleBindings>(() => loadStored("roleBindings", {}, isStringMap as (v: unknown) => v is RoleBindings))
  const [unassignedRoleSwatchIds, setUnassignedRoleSwatchIds] = useState<string[]>(() => loadStored("unassignedRoleSwatchIds", [], isStringArray))
  const [undoStack, setUndoStack] = useState<Swatch[][]>([])
  const [redoStack, setRedoStack] = useState<Swatch[][]>([])
  const [templateOpen, setTemplateOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [paletteSheetOpen, setPaletteSheetOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(true)
  const [customiseOpen, setCustomiseOpen] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1200px)").matches)
  const [brandOpen, setBrandOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportPaywallOpen, setExportPaywallOpen] = useState(false)
  const [accountSetupOpen, setAccountSetupOpen] = useState(false)
  const [secondOpinionOpen, setSecondOpinionOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [entitlement, setEntitlement] = useState<Entitlement>(loadEntitlement)
  const [paywall, setPaywall] = useState<{ open: boolean; reason?: string }>({ open: false })
  const [designId] = useState<string>(() => loadStored("designId", "", isString) || uid())

  useStored("palette", palette)
  useStored("templateByType", templateByType)
  useStored("brand", brand)
  useStored("designId", designId)
  useStored("elementOverrides", elementOverrides)
  useStored("roleBindings", roleBindings)
  useStored("unassignedRoleSwatchIds", unassignedRoleSwatchIds)

  useEffect(() => { saveEntitlement(entitlement) }, [entitlement])
  useEffect(() => { writeHashPalette(palette) }, [palette])

  useEffect(() => {
    if (needsPro(entitlement)) setPaywall({ open: true, reason: "Your free first design is complete. Subscribe to Pro for unlimited access." })
  }, [])

  useEffect(() => {
    const result = readGenerateResult()
    if (!result) return
    setSelection({ group: result.group as GroupKey, sub: result.sub })
    setTemplateByType((c) => ({ ...c, [`${result.group}/${result.sub}`]: result.templateId }))
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      const next = readHashPalette()
      if (!next || next.map((swatch) => swatch.hex).join() === palette.map((swatch) => swatch.hex).join()) return
      skipHistory.current = true
      setPalette(next)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [palette])

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1200px)")
    const update = () => setCustomiseOpen(query.matches)
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!moreOpen) return
    const close = (event: PointerEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) setMoreOpen(false)
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [moreOpen])

  const mutatePalette = useCallback((updater: (current: Swatch[]) => Swatch[]) => {
    setPalette((current) => {
      const next = updater(current)
      if (!skipHistory.current && JSON.stringify(next) !== JSON.stringify(current)) {
        setUndoStack((stack) => stack.length >= MAX_HISTORY ? [...stack.slice(1), current] : [...stack, current])
        setRedoStack([])
      }
      skipHistory.current = false
      return next
    })
  }, [])

  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (!stack.length) return stack
      const previous = stack[stack.length - 1]
      setRedoStack((redo) => [...redo, palette])
      skipHistory.current = true
      setPalette(previous)
      return stack.slice(0, -1)
    })
  }, [palette])

  const redo = useCallback(() => {
    setRedoStack((stack) => {
      if (!stack.length) return stack
      const next = stack[stack.length - 1]
      setUndoStack((undoHistory) => [...undoHistory, palette])
      skipHistory.current = true
      setPalette(next)
      return stack.slice(0, -1)
    })
  }, [palette])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPaletteSheetOpen(false)
        setPaletteOpen(false)
        setCustomiseOpen(false)
        setTemplateOpen(false)
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
    const frame = requestAnimationFrame(() => previewRef.current?.fitToScreen())
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
  }, [customiseOpen])

  const clearSelection = useCallback(() => setSelectedElement(null), [])

  const handleElementChange = useCallback((key: string, value: string | boolean) => {
    setSelectedElement((current) => {
      if (!current) return current
      setElementOverrides((overrides) => {
        const prev = overrides[current.id] ?? {}
        return { ...overrides, [current.id]: { ...prev, [key]: value } }
      })
      return current
    })
  }, [])

  const reorderPalette = useCallback((activeId: string, overId: string) => {
    mutatePalette((current) => {
      const from = current.findIndex((s) => s.id === activeId)
      const to = current.findIndex((s) => s.id === overId)
      if (from === -1 || to === -1 || from === to) return current
      const next = [...current]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [mutatePalette])

  const handleRoleChange = useCallback((role: string, swatchId: string) => {
    setUnassignedRoleSwatchIds((ids) => {
      if (role) return ids.filter((id) => id !== swatchId)
      return ids.includes(swatchId) ? ids : [...ids, swatchId]
    })
    setRoleBindings((bindings) => {
      const next = { ...bindings }
      for (const [key, id] of Object.entries(next)) {
        if (id === swatchId) delete next[key]
      }
      if (role) next[role] = swatchId
      return next
    })
  }, [])

  const paletteRoleOptions = useMemo(() => {
    if (selection.group === "application") {
      return APPLICATION_ROLE_LABELS
    }
    return WEBSITE_ROLE_LABELS
  }, [selection.group])

  const currentElementValues = useMemo(() => {
    if (!selectedElement) return null
    const override = elementOverrides[selectedElement.id]
    return { ...ELEMENT_DEFAULTS[selectedElement.kind], ...override }
  }, [selectedElement, elementOverrides])

  const previewContext = useMemo<PreviewCtxValue>(() => ({
    editMode: true,
    assignments,
    roleColor: (swatchId) => palette.find((swatch) => swatch.id === swatchId)?.hex,
    tokenColor: (role) => {
      const key = semanticKeyForRole(role)
      return key ? semanticColour(tokenSystem, palette, key, theme.accent) : theme.accent
    },
    brand,
    buttonStyle,
    buttonProps: DEFAULT_BUTTON_PROPS,
    trio,
    selectedElement,
    elementOverrides,
    tokenSystem,
    selectElement,
  }), [assignments, brand, buttonStyle, elementOverrides, palette, selectedElement, selectElement, theme.accent, tokenSystem, trio])

  const trySelect = useCallback((next: Selection, nextTemplate?: string) => {
    const group = GROUPS.find((item) => item.key === next.group)
    const type = group?.subs.find((item) => item.key === next.sub) ?? group?.subs[0]
    if (!group || !type) return false
    if (!canUseWorkspace(entitlement)) {
      setPaywall({ open: true, reason: "Your free first design is complete. Subscribe to Pro for unlimited access." })
      return false
    }
    setSelection({ group: group.key, sub: type.key })
    return true
  }, [entitlement])

  const chooseTemplate = (id: string, label: string) => {
    if (!trySelect(selection, id)) return
    setTemplateByType((current) => ({ ...current, [selectionKey]: id }))
    markOnboardingStep("template")
    toast.push(`Template: ${label}`, "success")
  }

  const changeColour = (id: string, hex: string) => {
    mutatePalette((current) => current.map((swatch) => swatch.id === id ? { ...swatch, hex } : swatch))
    markOnboardingStep("pick")
  }
  const renameColour = (id: string, name: string) => mutatePalette((current) => current.map((swatch) => swatch.id === id ? { ...swatch, name } : swatch))
  const toggleLock = (id: string) => mutatePalette((current) => current.map((swatch) => swatch.id === id ? { ...swatch, locked: !swatch.locked } : swatch))
  const addColour = () => {
    mutatePalette((current) => [...current, { id: uid(), name: START_NAMES[current.length] ?? `Colour ${current.length + 1}`, hex: randomHex() }])
    markOnboardingStep("pick")
  }
  const removeColour = (id: string) => mutatePalette((current) => current.length > 1 ? current.filter((swatch) => swatch.id !== id) : current)

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
    return current.map((swatch, index) => swatch.locked ? swatch : {
      ...swatch,
      hex: hslToHex((hue + Math.max(0, index - roles.length + 1) * 43) % 360, roles[index]?.s ?? 55, roles[index]?.l ?? 55),
    })
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
        mutatePalette((current) => current.map((swatch, index) => swatch.locked ? swatch : { ...swatch, hex: curated.palette[index] ?? randomHex() }))
        return
      }
    }
    mutatePalette(smartRandomise)
    applyCoherentOverrides()
  }

  const applyCoherentOverrides = () => {
    const typo = randomTypographyTokens()
    const btn = randomButtonTokens()
    setElementOverrides((prev) => {
      const next = { ...prev }
      for (const [id, ov] of Object.entries(next)) {
        if (id.startsWith("text-") || id.includes("/text")) {
          next[id] = { ...ov, ...typo }
        } else if (id.startsWith("button-") || id.includes("/button")) {
          next[id] = { ...ov, ...btn }
        }
      }
      return next
    })
  }

  const reset = () => {
    setUndoStack((history) => [...history, palette])
    setRedoStack([])
    skipHistory.current = true
    setUnassignedRoleSwatchIds([])
    setPalette(createDefaultPalette())
    setConfirmReset(false)
    toast.push("Palette reset", "success")
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await canvasRef.current?.requestFullscreen()
    } catch {
      toast.push("Full screen is not available in this browser", "error")
    }
  }

  const reopenProject = (project: ImportedProject) => {
    skipHistory.current = false
    mutatePalette(() => project.palette)
    const id = project.project?.templateId
    const asset = id ? templateAssetById.get(id) : undefined
    if (asset) {
      const group = asset.category.toLowerCase() as GroupKey
      const type = GROUPS.find((item) => item.key === group)?.subs.find((item) => item.templates.some((template) => template.key === id))
      if (type) {
        setSelection({ group, sub: type.key })
        setTemplateByType((current) => ({ ...current, [`${group}/${type.key}`]: id! }))
      }
    }
  }

  const handleExport = () => {
    markOnboardingStep("export")
    if (needsPro(entitlement)) {
      setPaywall({ open: true, reason: "Export requires a Pro subscription after your first design." })
      return
    }
    if (needsExportPaywall(entitlement)) {
      setExportPaywallOpen(true)
      return
    }
    if (needsAccountSetup(entitlement)) {
      setAccountSetupOpen(true)
      return
    }
    if (canExport(entitlement, designId)) {
      setExportOpen(true)
      return
    }
    setPaywall({ open: true, reason: "Export is available for your first design or with a Pro subscription." })
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
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-softgrey bg-white px-2 sm:px-3">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <a href="/" onClick={nav("/")} className="grid h-11 w-11 shrink-0 place-items-center rounded-[7px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label="HueSet home" title="HueSet home">
              <img src="/app-icon-64.png" alt="" width={24} height={24} className="h-6 w-6 rounded-[6px]" />
            </a>
            <ToolbarButton className="lg:hidden" label="Open palette" onClick={() => { setPaletteSheetOpen(true); setCustomiseOpen(false) }}><PaletteIcon /></ToolbarButton>
            <ToolbarButton className="hidden lg:grid" label={paletteOpen ? "Hide palette" : "Show palette"} pressed={paletteOpen} onClick={() => setPaletteOpen((open) => !open)}><PaletteIcon /></ToolbarButton>
            <span className="hidden min-w-0 flex-1 truncate px-1 text-[12px] font-semibold text-charcoal/70 sm:block" title={templateName}>{templateName}</span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <ToolbarButton className="hidden sm:grid" label="Undo" onClick={undo} disabled={!undoStack.length}><UndoIcon /></ToolbarButton>
            <ToolbarButton className="hidden sm:grid" label="Redo" onClick={redo} disabled={!redoStack.length}><RedoIcon /></ToolbarButton>
            <ToolbarAction label="Randomise" onClick={randomise}><DiceIcon /></ToolbarAction>
            <ToolbarAction label="Reset" onClick={() => setConfirmReset(true)}><ResetIcon /></ToolbarAction>
            <ChangeTemplatePanel
              compact
              triggerLabel="Change template"
              open={templateOpen}
              onToggle={() => { setTemplateOpen((open) => !open); setMoreOpen(false) }}
              onClose={() => setTemplateOpen(false)}
              template={currentGroup.label}
              templates={GROUPS.map((group) => group.label)}
              onTemplate={(label) => {
                const group = GROUPS.find((item) => item.label === label)
                const firstType = group?.subs[0]
                if (group && firstType && trySelect({ group: group.key, sub: firstType.key })) markOnboardingStep("template")
              }}
              layout={currentType.label}
              layouts={currentGroup.subs.map((type) => type.label)}
              onLayout={(label) => {
                const type = currentGroup.subs.find((item) => item.label === label)
                if (type && trySelect({ group: currentGroup.key, sub: type.key })) markOnboardingStep("template")
              }}
              variant={currentType.templates.find((template) => template.key === templateId)?.label ?? "Default"}
              variants={currentType.templates.map((template) => template.label)}
              onVariant={(label) => {
                const template = currentType.templates.find((item) => item.label === label)
                if (template) chooseTemplate(template.key, template.label)
              }}
            />
            <ToolbarAction label="Export" onClick={handleExport}><ExportIcon /></ToolbarAction>
            <ToolbarAction label="Second Opinion" onClick={() => setSecondOpinionOpen(true)}><SecondOpinionIcon /></ToolbarAction>
            <div ref={moreMenuRef} className="relative min-[1600px]:hidden">
              <ToolbarButton label="More tools" pressed={moreOpen} onClick={() => { setMoreOpen((open) => !open); setTemplateOpen(false) }}><MoreIcon /></ToolbarButton>
              {moreOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-[190px] rounded-[8px] border border-softgrey bg-white p-1.5 shadow-xl" role="menu" aria-label="More workspace tools">
                  <MenuAction label="Brand assets" onClick={() => { setBrandOpen(true); setMoreOpen(false) }}><BrandIcon /></MenuAction>
                  <MenuAction label="Center template" onClick={() => { previewRef.current?.fitToScreen(); setMoreOpen(false) }}><CenterIcon /></MenuAction>
                  <MenuAction label="Full screen" onClick={() => { void toggleFullscreen(); setMoreOpen(false) }}><FullscreenIcon /></MenuAction>
                  <MenuAction className="lg:hidden" label={customiseOpen ? "Hide customise" : "Show customise"} onClick={() => { setCustomiseOpen((open) => !open); setPaletteSheetOpen(false); setMoreOpen(false) }}><CustomiseIcon /></MenuAction>
                </div>
              )}
            </div>
            <ToolbarButton className="hidden min-[1600px]:grid" label="Brand assets" onClick={() => setBrandOpen(true)}><BrandIcon /></ToolbarButton>
            <ToolbarButton className="hidden min-[1600px]:grid" label="Center template" onClick={() => previewRef.current?.fitToScreen()}><CenterIcon /></ToolbarButton>
            <ToolbarButton className="hidden min-[1600px]:grid" label="Full screen" onClick={toggleFullscreen}><FullscreenIcon /></ToolbarButton>
            <ToolbarButton className="hidden lg:grid" label={customiseOpen ? "Hide customise" : "Show customise"} pressed={customiseOpen} onClick={() => { setCustomiseOpen((open) => !open); setPaletteSheetOpen(false) }}><CustomiseIcon /></ToolbarButton>
          </div>
        </header>

        <main ref={canvasRef} className="relative min-h-0 flex-1 overflow-hidden bg-softgrey p-2 sm:p-3" aria-label="Preview canvas">
          <div className="h-full w-full overflow-hidden rounded-[8px] border border-charcoal/10 bg-white">
            <PreviewProvider value={previewContext}>
              <ScopeProvider value={`${selection.group}/${selection.sub}/${templateId}`}>
                <PreviewRenderer ref={previewRef} group={selection.group} sub={selection.sub} templateId={templateId} theme={theme} />
              </ScopeProvider>
            </PreviewProvider>
          </div>
        </main>
      </div>

      {customiseOpen && (
        <CustomisePanel
          onClose={() => setCustomiseOpen(false)}
          className="hidden w-[280px] shrink-0 border-l border-softgrey min-[1200px]:flex"
          selectedElement={selectedElement}
          elementValues={currentElementValues}
          onElementChange={handleElementChange}
          onClearSelection={clearSelection}
          roleOptions={roleLabels}
          templateSection={
            <div className="grid grid-cols-2 gap-1.5">
              {currentGroup.subs.map((type) => {
                const active = type.key === currentType.key
                return (
                  <button key={type.key} type="button" onClick={() => trySelect({ group: currentGroup.key, sub: type.key })} aria-pressed={active} className={`h-8 rounded-[6px] border text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${active ? "border-brand bg-brand/10 text-brand" : "border-softgrey text-charcoal/55 hover:bg-offwhite hover:text-charcoal"}`}>
                    {type.label}
                  </button>
                )
              })}
            </div>
          }
        />
      )}

      {paletteSheetOpen && (
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

      {customiseOpen && (
        <>
          <div className="fixed inset-0 z-40 hidden bg-charcoal/25 lg:block min-[1200px]:hidden" onClick={() => setCustomiseOpen(false)} aria-hidden />
          <CustomisePanel
            onClose={() => setCustomiseOpen(false)}
            className="fixed bottom-0 right-0 top-12 z-50 hidden w-[280px] border-l border-softgrey shadow-xl lg:flex min-[1200px]:hidden"
            selectedElement={selectedElement}
            elementValues={currentElementValues}
            onElementChange={handleElementChange}
            onClearSelection={clearSelection}
            roleOptions={roleLabels}
          />
          <SheetBackdrop className="lg:hidden" onClose={() => setCustomiseOpen(false)}>
            <CustomisePanel
              onClose={() => setCustomiseOpen(false)}
              className="h-[min(52dvh,420px)] w-full rounded-t-[8px] border-t border-softgrey"
              selectedElement={selectedElement}
              elementValues={currentElementValues}
              onElementChange={handleElementChange}
              onClearSelection={clearSelection}
              roleOptions={roleLabels}
            />
          </SheetBackdrop>
        </>
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
      />

      <ExportPaywallOverlay
        open={exportPaywallOpen}
        onPay={() => {
          setEntitlement((e) => mockPayFirstExport(e, designId))
          setExportPaywallOpen(false)
          setAccountSetupOpen(true)
        }}
        onLater={() => setExportPaywallOpen(false)}
      />

      <AccountSetupOverlay
        open={accountSetupOpen}
        onComplete={(profile) => {
          setEntitlement((e) => mockCreateAccount(e, profile))
          setAccountSetupOpen(false)
          setExportOpen(true)
        }}
        onLater={() => {
          setEntitlement((e) => mockCreateAccount(e, { name: "", email: "" }))
          setAccountSetupOpen(false)
          setExportOpen(true)
        }}
      />

      <SecondOpinionPanel
        open={secondOpinionOpen}
        onClose={() => setSecondOpinionOpen(false)}
        checks={accessibilityChecks}
        isPro={entitlement.isPro}
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
        onUnlock={() => { setEntitlement((e) => mockSubscribePro(e)); setPaywall({ open: false }); toast.push("Pro unlocked", "success") }}
        onLater={() => setPaywall({ open: false })}
      />
    </div>
  )
}

function ToolbarButton({ label, onClick, children, disabled = false, pressed, className = "" }: { label: string; onClick: () => void; children: ReactNode; disabled?: boolean; pressed?: boolean; className?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} aria-pressed={pressed} title={label} className={`grid h-11 w-11 shrink-0 place-items-center rounded-[7px] text-charcoal/55 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-30 ${pressed ? "bg-offwhite text-charcoal" : ""} ${className}`}>
      {children}
    </button>
  )
}

function ToolbarAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-[7px] px-0 text-[12px] font-semibold text-charcoal/65 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand min-[1400px]:w-auto min-[1400px]:px-3">
      {children}<span className="hidden min-[1400px]:inline">{label}</span>
    </button>
  )
}

function MenuAction({ label, onClick, children, className = "" }: { label: string; onClick: () => void; children: ReactNode; className?: string }) {
  return <button type="button" role="menuitem" onClick={onClick} className={`flex h-11 w-full items-center gap-3 rounded-[7px] px-3 text-left text-[12px] font-semibold text-charcoal/70 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${className}`}><span className="grid w-5 place-items-center">{children}</span>{label}</button>
}

function SheetBackdrop({ children, onClose, className = "" }: { children: ReactNode; onClose: () => void; className?: string }) {
  return <div className={`fixed inset-0 z-50 flex items-end bg-charcoal/30 ${className}`} onMouseDown={onClose} role="dialog" aria-modal="true"><div className="w-full" onMouseDown={(event) => event.stopPropagation()}>{children}</div></div>
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
