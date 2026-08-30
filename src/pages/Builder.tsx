import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  BRAND,
  contrastRatio,
  deriveTheme,
  hslToHex,
  randomHex,
  readableOn,
  themeContrastIssues,
  uid,
  type RoleBindings,
  type Swatch,
} from "../lib/color"
import PalettePanel from "../components/PalettePanel"
import {
  DEFAULT_BUTTON_PROPS,
  paletteToTrio,
  type ButtonProps,
  type ButtonStyle,
} from "../components/ButtonPreview"
import {
  GROUPS,
  PreviewRenderer,
  type PreviewRendererHandle,
  type GroupKey,
} from "../components/Previews"
import { PreviewProvider, ScopeProvider, type Brand, type PreviewCtxValue } from "../components/PreviewCtx"
import BrandUpload from "../components/BrandUpload"
import { useRoute } from "../lib/router"
import { useToast } from "../components/Toast"
import ConfirmDialog from "../components/ConfirmDialog"
import IntroTour, { markIntroSeen, shouldShowIntro } from "../components/IntroTour"
import PaywallOverlay from "../components/PaywallOverlay"
import {
  FREE_PREVIEW_LIMIT,
  loadEntitlement,
  needsPaywall,
  previewKey,
  recordSwitch,
  saveEntitlement,
  type Entitlement,
} from "../lib/entitlement"
import ExportPanel from "../components/ExportPanel"
import { createDefaultPalette, loadPalette } from "../lib/paletteStore"
import InspectorPanel from "../components/InspectorPanel"
import { pickCuratedPalette } from "../lib/curatedPalettes"
import TemplateLibrary from "../components/TemplateLibrary"
import { defaultTemplate, templateAssetById, type TemplateAsset } from "../lib/templateAssets"
import { elementTokens, type ElementOverrides, type InspectorSelection } from "../lib/designTokens"
import {
  buttonMainElementTokens,
  cardDefaultElementTokens,
  createTokenSystem,
  normalizeTokenSystem,
  semanticColour,
  semanticKeyForRole,
  semanticRoleBindings,
  type DesignTokenSystem,
} from "../lib/tokenSystem"
import { ACCESSIBILITY_STATUS_LABEL, evaluateAccessibility, worstAccessibilityStatus, type AccessibilityCheck } from "../lib/accessibility"

const TokenSystemPanel = lazy(() => import("../components/TokenSystemPanel"))

type Selection = { group: GroupKey; sub: string }

const START_NAMES = ["Primary", "Secondary", "Tertiary", "Quaternary", "Quinary", "Senary"]

/* Contextual colour roles per preview. Left aligned to palette index; extra
 * swatches keep their custom name. */
const ROLES_BY_PREVIEW: Record<string, (string | null)[]> = {
  "website":            ["Page Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
  "application":        ["App Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
  // Websites
  "website/landing":  ["Page Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
  "website/saas":     ["Page Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
  "website/ecom":     ["Page Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
  "website/signin":   ["Page Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
  "website/paywall":  ["Page Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
  // Mobile
  "mobile/standard":  ["App Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
  "mobile/dashboard": ["App Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
  "mobile/cards":     ["App Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
  "mobile/profile":   ["App Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
  // Components (non-button)
  "components/cards":      ["Card Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Card Border"],
  "components/forms":      ["Form Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Input Border"],
  "components/nav":        ["Nav Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Divider"],
  "components/states":     ["Canvas Background", "Success Accent", "Warning Accent", "Heading Text", "Body Text", "Error Accent"],
  "components/charts":     ["Chart Background", "Grid Lines", "Primary Series", "Heading Text", "Body Text", "Secondary Series"],
  "components/typography": ["Background", "Secondary Background", "Brand Primary", "Heading Text", "Body Text", "Border"],
}

const DESIGN_ROLES = Array.from(new Set(
  Object.values(ROLES_BY_PREVIEW).flat().filter((role): role is string => Boolean(role)),
))

const TEXT_ROLE_HINTS = ["text", "heading", "body", "caption", "label"]
const BACKGROUND_ROLE_HINTS = ["background", "surface", "canvas", "card", "nav", "form"]

type BuilderSnapshot = {
  palette: Swatch[]
  assignments: Record<string, string>
  roleBindings: RoleBindings
  elementOverrides: ElementOverrides
  tokenSystem: DesignTokenSystem
  componentIds: string[]
  colourWayChosen: boolean
}


/* localStorage persistence */
const STORE_KEY = "hueframe:v1"
function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return fallback
    const data = JSON.parse(raw)
    return data?.[key] ?? fallback
  } catch { return fallback }
}
function useStored(key: string, value: unknown) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      const data = raw ? JSON.parse(raw) : {}
      data[key] = value
      localStorage.setItem(STORE_KEY, JSON.stringify(data))
    } catch { /* storage unavailable — ignore */ }
  }, [key, value])
}

function migrateSwatchReferences(records: Record<string, string>, palette: Swatch[]): Record<string, string> {
  const ids = new Set(palette.map((swatch) => swatch.id))
  return Object.fromEntries(Object.entries(records).flatMap(([key, value]) => {
    if (ids.has(value)) return [[key, value]]
    const renamed = palette.find((swatch) => swatch.name.trim().toLowerCase() === value.trim().toLowerCase())
    return renamed ? [[key, renamed.id]] : []
  }))
}

const MAX_HISTORY = 40
/* #PreviewWorkspace /preview - foundation for #GenerateDesignWorkflow. */
export default function Builder() {
  const [, navigate] = useRoute()
  const toast = useToast()

  // ---------- palette + design state ----------
  const [palette, setPalette] = useState<Swatch[]>(loadPalette)
  const [sel, setSel] = useState<Selection>({ group: "website", sub: "landing-page" })
  const [tplBySub, setTplBySub] = useState<Record<string, string>>({ "website/landing-page": defaultTemplate.id })
  const [buttonStyle] = useState<ButtonStyle>(() => loadStored("buttonStyle", "depth" as ButtonStyle))
  const [buttonProps] = useState<ButtonProps>(() => loadStored("buttonProps", DEFAULT_BUTTON_PROPS))

  // Edit Elements
  const [editMode, setEditMode] = useState(false)
  const [assignments, setAssignments] = useState<Record<string, string>>(() => migrateSwatchReferences(loadStored("assignments", {}), palette))
  const [roleBindings, setRoleBindings] = useState<RoleBindings>(() => migrateSwatchReferences(loadStored("roleBindings", {}), palette))
  const [selectedElement, setSelectedElement] = useState<InspectorSelection | null>(null)
  const [elementOverrides, setElementOverrides] = useState<ElementOverrides>(() => loadStored("elementOverrides", {}))
  const [tokenSystem, setTokenSystem] = useState<DesignTokenSystem>(() => normalizeTokenSystem(loadStored<unknown>("tokenSystem", null), palette))
  const [componentIds, setComponentIds] = useState<string[]>(() => loadStored("componentIds", []))
  const [colourWayChosen, setColourWayChosen] = useState<boolean>(() => loadStored("colourWayChosen", false))

  // Brand
  const [brand, setBrand] = useState<Brand>(() => loadStored("brand", { name: "Palette Preview", logo: null, symbol: null }))
  const [brandOpen, setBrandOpen] = useState(false)

  // Overlays
  const [previewPickerOpen, setPreviewPickerOpen] = useState(false)
  const [libraryStartCategory, setLibraryStartCategory] = useState<"Website" | "Application" | "Components">("Website")
  const [libraryMode, setLibraryMode] = useState<"template" | "component">("template")
  const [tokenPanelOpen, setTokenPanelOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(shouldShowIntro)
  const [confirmReset, setConfirmReset] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const previewAreaRef = useRef<HTMLElement | null>(null)
  const previewRendererRef = useRef<PreviewRendererHandle | null>(null)

  // Role Mapping (previously "Assign Hierarchy")
  const [roleMapSource, setRoleMapSource] = useState("Page Background")
  const [roleMapTargetId, setRoleMapTargetId] = useState(() => palette[2]?.id ?? palette[0]?.id ?? "")
  const [roleMapMessage, setRoleMapMessage] = useState<{ text: string; tone: "success" | "error" | "neutral" } | null>(null)

  // Undo / Redo
  const [undoStack, setUndoStack] = useState<BuilderSnapshot[]>([])
  const [redoStack, setRedoStack] = useState<BuilderSnapshot[]>([])

  // Free / Pro entitlement
  const [ent, setEnt] = useState<Entitlement>(loadEntitlement)
  useEffect(() => { saveEntitlement(ent) }, [ent])
  const [paywall, setPaywall] = useState<{ open: boolean; reason?: string }>({ open: false })
  useStored("palette", palette)
  useStored("assignments", assignments)
  useStored("roleBindings", roleBindings)
  useStored("elementOverrides", elementOverrides)
  useStored("tokenSystem", tokenSystem)
  useStored("componentIds", componentIds)
  useStored("colourWayChosen", colourWayChosen)
  useStored("brand", brand)
  useStored("buttonStyle", buttonStyle)
  useStored("buttonProps", buttonProps)

  const closeHelp = useCallback(() => { markIntroSeen(); setHelpOpen(false) }, [])

  // Native browser fullscreen state.
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === previewAreaRef.current)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  const pushHistory = useCallback((snapshot: BuilderSnapshot) => {
    setUndoStack((stack) => stack.length >= MAX_HISTORY ? [...stack.slice(1), snapshot] : [...stack, snapshot])
    setRedoStack([])
  }, [])

  // Palette edits and role bindings share one history so Set can be undone.
  const mutatePalette = useCallback((updater: (prev: Swatch[]) => Swatch[]) => {
    const next = updater(palette)
    if (JSON.stringify(palette) === JSON.stringify(next)) return
    pushHistory({ palette, assignments, roleBindings, elementOverrides, tokenSystem, componentIds, colourWayChosen })
    setPalette(next)
  }, [assignments, colourWayChosen, componentIds, elementOverrides, palette, pushHistory, roleBindings, tokenSystem])

  const mutateWorkspace = useCallback((next: Partial<BuilderSnapshot>) => {
    pushHistory({ palette, assignments, roleBindings, elementOverrides, tokenSystem, componentIds, colourWayChosen })
    if (next.palette) setPalette(next.palette)
    if (next.assignments) setAssignments(next.assignments)
    if (next.roleBindings) setRoleBindings(next.roleBindings)
    if (next.elementOverrides) setElementOverrides(next.elementOverrides)
    if (next.tokenSystem) setTokenSystem(next.tokenSystem)
    if (next.componentIds) setComponentIds(next.componentIds)
    if (next.colourWayChosen !== undefined) setColourWayChosen(next.colourWayChosen)
  }, [assignments, colourWayChosen, componentIds, elementOverrides, palette, pushHistory, roleBindings, tokenSystem])

  const undo = useCallback(() => {
    if (!undoStack.length) { toast.push("Nothing to undo"); return }
    const previous = undoStack[undoStack.length - 1]
    setUndoStack(undoStack.slice(0, -1))
    setRedoStack((redo) => [...redo, { palette, assignments, roleBindings, elementOverrides, tokenSystem, componentIds, colourWayChosen }])
    setPalette(previous.palette)
    setAssignments(previous.assignments)
    setRoleBindings(previous.roleBindings)
    setElementOverrides(previous.elementOverrides)
    setTokenSystem(previous.tokenSystem)
    setComponentIds(previous.componentIds)
    setColourWayChosen(previous.colourWayChosen)
    setRoleMapMessage(null)
    toast.push("Undone")
  }, [assignments, colourWayChosen, componentIds, elementOverrides, palette, roleBindings, toast, tokenSystem, undoStack])

  const redo = useCallback(() => {
    if (!redoStack.length) { toast.push("Nothing to redo"); return }
    const next = redoStack[redoStack.length - 1]
    setRedoStack(redoStack.slice(0, -1))
    setUndoStack((undoItems) => [...undoItems, { palette, assignments, roleBindings, elementOverrides, tokenSystem, componentIds, colourWayChosen }])
    setPalette(next.palette)
    setAssignments(next.assignments)
    setRoleBindings(next.roleBindings)
    setElementOverrides(next.elementOverrides)
    setTokenSystem(next.tokenSystem)
    setComponentIds(next.componentIds)
    setColourWayChosen(next.colourWayChosen)
    setRoleMapMessage(null)
    toast.push("Redone")
  }, [assignments, colourWayChosen, componentIds, elementOverrides, palette, redoStack, roleBindings, toast, tokenSystem])

  // Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z / Cmd/Ctrl+Y
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return
      if (mod && !e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); undo() }
      else if (mod && ((e.shiftKey && e.key.toLowerCase() === "z") || e.key.toLowerCase() === "y")) { e.preventDefault(); redo() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [undo, redo])

  const currentGroup = GROUPS.find((g) => g.key === sel.group)!
  const currentSub = currentGroup.subs.find((s) => s.key === sel.sub) ?? currentGroup.subs[0]
  const templates = currentSub.templates
  const currentSelectionKey = `${sel.group}/${currentSub.key}`
  const tpl = tplBySub[currentSelectionKey] ?? templates[0]?.key ?? ""
  const currentAsset = templateAssetById.get(tpl)
  const currentTemplateName = currentAsset?.name ?? "Untitled template"
  const roleLabels: (string | null)[] | undefined = ROLES_BY_PREVIEW[`${sel.group}/${sel.sub}`] ?? ROLES_BY_PREVIEW[sel.group]

  const effectiveRoleBindings = useMemo(() => ({ ...roleBindings, ...semanticRoleBindings(tokenSystem) }), [roleBindings, tokenSystem])
  const theme = useMemo(() => deriveTheme(palette, roleLabels, effectiveRoleBindings), [effectiveRoleBindings, palette, roleLabels])
  const trio = useMemo(() => paletteToTrio(palette), [palette])
  const accessibilityChecks = useMemo(() => {
    const checks = evaluateAccessibility(theme, tokenSystem)
    const buttonBackground = semanticColour(tokenSystem, palette, tokenSystem.component.buttonMain.background, theme.accent)
    const textToken = tokenSystem.component.buttonMain.text
    const buttonText = textToken === "textInverse" ? readableOn(buttonBackground) : semanticColour(tokenSystem, palette, textToken, theme.onBrand)
    const buttonRatio = contrastRatio(buttonText, buttonBackground)
    const focusColour = semanticColour(tokenSystem, palette, tokenSystem.state.focusRing.colour, theme.accent)
    const focusRatio = contrastRatio(focusColour, theme.paper)
    return checks.map((check) => {
      if (check.id === "button") return { ...check, status: buttonRatio >= 4.5 ? "good" as const : buttonRatio >= 3 ? "review" as const : "poor" as const, value: `${Math.round(buttonRatio * 100) / 100}:1` }
      if (check.id === "focus") return { ...check, status: focusRatio >= 3 && tokenSystem.state.focusRing.width >= 2 ? "good" as const : focusRatio >= 2 || tokenSystem.state.focusRing.width >= 2 ? "review" as const : "poor" as const, value: `${Math.round(focusRatio * 100) / 100}:1 · ${tokenSystem.state.focusRing.width}px ring` }
      return check
    })
  }, [palette, theme, tokenSystem])

  useEffect(() => {
    setTokenSystem((current) => normalizeTokenSystem(current, palette))
  }, [palette])

  useEffect(() => {
    if (palette.some((swatch) => swatch.id === roleMapTargetId)) return
    setRoleMapTargetId(palette[0]?.id ?? "")
  }, [palette, roleMapTargetId])

  // ---------- entitlement-aware preview switching ----------
  const goPro = () => { setPaywall({ open: false }); navigate("/pricing") }
  const dismissPaywall = () => setPaywall({ open: false })

  const trySelectPreview = useCallback((next: Selection): boolean => {
    const nextGroup = GROUPS.find((group) => group.key === next.group)!
    const nextSub = nextGroup.subs.find((sub) => sub.key === next.sub) ?? nextGroup.subs[0]
    const variant = tplBySub[`${next.group}/${nextSub.key}`] ?? nextSub.templates[0]?.key ?? "default"
    const key = previewKey(next.group, next.sub, variant)
    if (needsPaywall(ent, key)) {
      setPaywall({ open: true, reason: `You've used all ${FREE_PREVIEW_LIMIT} of your free previews. Go Pro + to keep exploring - your current work stays exactly where it is.` })
      return false
    }
    setSel(next)
    setEnt((e) => recordSwitch(e, key))
    return true
  }, [ent, tplBySub])

  // Entering the workspace applies the current palette to the default preview.
  // That is the first chargeable preview action; palette work remains unlimited.
  const initialPreviewRecorded = useRef(false)
  useEffect(() => {
    if (initialPreviewRecorded.current) return
    initialPreviewRecorded.current = true
    const key = previewKey("website", "landing-page", defaultTemplate.id)
    setEnt((current) => {
      if (needsPaywall(current, key)) {
        setPaywall({ open: true, reason: `You've used all ${FREE_PREVIEW_LIMIT} free previews. Your palette is still available in the free generator.` })
        return current
      }
      return recordSwitch(current, key)
    })
  }, [])

  // ---------- palette mutations ----------
  const change = (id: string, hex: string) => mutatePalette((p) => p.map((s) => (s.id === id ? { ...s, hex } : s)))
  const rename = (id: string, name: string) => mutatePalette((p) => p.map((s) => (s.id === id ? { ...s, name: name.trim() || s.name } : s)))
  const add = () => {
    const id = uid()
    const occupiedRoles = new Set([
      ...(roleLabels ?? []).slice(0, palette.length).filter((role): role is string => Boolean(role)),
      ...Object.keys(roleBindings),
    ])
    const nextRole = roleLabels?.[palette.length]
      ?? DESIGN_ROLES.find((role) => !occupiedRoles.has(role))
      ?? null
    const roleHint = (nextRole ?? "").toLowerCase()
    const hex = TEXT_ROLE_HINTS.some((hint) => roleHint.includes(hint))
      ? readableOn(theme.paper)
      : BACKGROUND_ROLE_HINTS.some((hint) => roleHint.includes(hint))
      ? theme.surface
      : randomHex()
    const nextPalette = [...palette, { id, name: START_NAMES[palette.length] ?? `Colour ${palette.length + 1}`, hex }]
    const nextBindings = nextRole ? { ...roleBindings, [nextRole]: id } : roleBindings
    mutateWorkspace({ palette: nextPalette, roleBindings: nextBindings })
    toast.push(nextRole ? `Colour added as ${nextRole}` : "Colour added", "success")
  }
  const remove = (id: string) => {
    if (palette.length <= 1) return
    const nextAssignments = Object.fromEntries(Object.entries(assignments).filter(([, swatchId]) => swatchId !== id))
    const nextBindings = Object.fromEntries(Object.entries(roleBindings).filter(([, swatchId]) => swatchId !== id))
    mutateWorkspace({
      palette: palette.filter((swatch) => swatch.id !== id),
      assignments: nextAssignments,
      roleBindings: nextBindings,
    })
    toast.push("Colour removed and stale bindings cleared", "success")
  }
  // Randomise: 1st + 2nd click = smart random, every 3rd click = curated
  // palette (recency-aware, respects locks). Falls back to smart random if
  // no curated palette is a reasonable match around the locked colours.
  const randomizeClickCount = useRef(0)
  const recentCuratedIdx = useRef<number[]>([])
  const roleHintsFor = (swatch: Swatch, index: number): string[] => [
    roleLabels?.[index] ?? "",
    ...Object.entries(roleBindings).filter(([, id]) => id === swatch.id).map(([role]) => role),
  ].map((role) => role.toLowerCase())

  /* Smart random stays intentionally restrained: neutral backgrounds,
   * one strong accent, and text values chosen for UI readability. */
  const smartRandom = (p: Swatch[]): Swatch[] => {
    const baseHue = Math.floor(Math.random() * 360)
    const dark = Math.random() < 0.25
    const roleFor = (idx: number, hints: string[]): { h: number; s: number; l: number } => {
      const has = (...words: string[]) => hints.some((hint) => words.some((word) => hint.includes(word)))
      if (has("heading")) {
        return dark ? { h: baseHue, s: 8, l: 96 } : { h: baseHue, s: 14, l: 11 }
      }
      if (has("body", "text", "caption", "label")) {
        return dark ? { h: baseHue, s: 8, l: 82 } : { h: baseHue, s: 10, l: 30 }
      }
      if (has("secondary background", "surface", "card background", "form background")) {
        return dark ? { h: baseHue, s: 12, l: 18 } : { h: baseHue, s: 12, l: 94 }
      }
      if (has("background", "canvas", "page", "app", "nav")) {
        return dark ? { h: baseHue, s: 14, l: 10 } : { h: baseHue, s: 14, l: 98 }
      }
      if (has("success")) return { h: 148, s: 58, l: dark ? 58 : 38 }
      if (has("warning")) return { h: 38, s: 76, l: dark ? 62 : 42 }
      if (has("error")) return { h: 4, s: 66, l: dark ? 62 : 45 }
      if (has("border", "divider", "grid", "outline")) {
        return dark ? { h: baseHue, s: 10, l: 34 } : { h: baseHue, s: 9, l: 78 }
      }
      if (has("secondary series", "secondary")) {
        return { h: (baseHue + 48) % 360, s: 48, l: dark ? 64 : 44 }
      }
      if (has("primary", "brand", "accent", "series", "active")) {
        return { h: baseHue, s: 68, l: dark ? 64 : 42 }
      }
      const fallback = [
        dark ? { h: baseHue, s: 14, l: 10 } : { h: baseHue, s: 14, l: 98 },
        dark ? { h: baseHue, s: 12, l: 18 } : { h: baseHue, s: 12, l: 94 },
        { h: baseHue, s: 68, l: dark ? 64 : 42 },
        dark ? { h: baseHue, s: 8, l: 96 } : { h: baseHue, s: 14, l: 11 },
        dark ? { h: baseHue, s: 8, l: 82 } : { h: baseHue, s: 10, l: 30 },
      ]
      return fallback[idx] ?? { h: (baseHue + idx * 28) % 360, s: 38, l: dark ? 62 : 46 }
    }
    return p.map((s, idx) => {
      if (s.locked) return s
      const spec = roleFor(idx, roleHintsFor(s, idx))
      return { ...s, hex: hslToHex(spec.h, spec.s, spec.l) }
    })
  }

  const swatchIdForRole = (candidate: Swatch[], role: string): string | undefined => {
    const explicit = Object.entries(roleBindings).find(([name]) => name.toLowerCase() === role.toLowerCase())?.[1]
    if (explicit && candidate.some((swatch) => swatch.id === explicit)) return explicit
    const index = (roleLabels ?? []).findIndex((name) => name?.toLowerCase() === role.toLowerCase())
    return index >= 0 ? candidate[index]?.id : undefined
  }

  const repairTextContrast = (candidate: Swatch[]): Swatch[] => {
    const next = candidate.map((swatch) => ({ ...swatch }))
    const candidateTheme = deriveTheme(next, roleLabels, effectiveRoleBindings)
    const backgrounds = [candidateTheme.paper, candidateTheme.surface]
    const choices = ["#101828", "#FFFFFF"]
    const safeText = choices.sort((a, b) =>
      Math.min(...backgrounds.map((bg) => contrastRatio(b, bg))) - Math.min(...backgrounds.map((bg) => contrastRatio(a, bg))),
    )[0]

    for (const role of ["Heading Text", "Body Text"]) {
      const id = swatchIdForRole(next, role)
      const swatch = next.find((item) => item.id === id)
      if (!swatch || swatch.locked) continue
      const currentTheme = deriveTheme(next, roleLabels, effectiveRoleBindings)
      const foreground = role === "Heading Text" ? currentTheme.ink : currentTheme.inkSoft
      if ([currentTheme.paper, currentTheme.surface].some((bg) => contrastRatio(foreground, bg) < 4.5)) {
        swatch.hex = safeText
      }
    }
    return next
  }

  const acceptSafePalette = (candidate: Swatch[]): Swatch[] | null => {
    const repaired = repairTextContrast(candidate)
    return themeContrastIssues(deriveTheme(repaired, roleLabels, effectiveRoleBindings)).length ? null : repaired
  }

  const generateSafePalette = (source: Swatch[]): Swatch[] | null => {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const accepted = acceptSafePalette(smartRandom(source))
      if (accepted) return accepted
    }
    return null
  }

  const randomize = () => {
    if (!palette.some((s) => !s.locked)) { toast.push("All colours are locked — unlock one to randomise", "error"); return }

    randomizeClickCount.current += 1
    const isCuratedTurn = randomizeClickCount.current % 3 === 0

    if (isCuratedTurn) {
      const locks = palette
        .map((s, idx) => ({ idx, hex: s.hex, locked: !!s.locked }))
        .filter((l) => l.locked && l.idx < 5)
        .map(({ idx, hex }) => ({ idx, hex }))
      const chosen = pickCuratedPalette(locks, recentCuratedIdx.current)
      if (chosen) {
        recentCuratedIdx.current = [chosen.index, ...recentCuratedIdx.current].slice(0, 20)
        const curatedCandidate = palette.map((s, i) => {
          if (s.locked) return s
          if (i >= chosen.palette.length) return { ...s, hex: randomHex() }
          return { ...s, hex: chosen.palette[i] }
        })
        const accepted = acceptSafePalette(curatedCandidate)
        if (accepted) {
          mutatePalette(() => accepted)
          toast.push("Curated, UI-safe palette", "success")
          return
        }
      }
      toast.push("Curated palette could not satisfy the current locks and role mapping")
    }
    const accepted = generateSafePalette(palette)
    if (!accepted) {
      toast.push("Locked colours or role collisions prevent safe text contrast", "error")
      return
    }
    mutatePalette(() => accepted)
    toast.push("UI-safe palette", "success")
  }
  const toggleLock = (id: string) => mutatePalette((p) => p.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s)))
  const reorder = (activeId: string, overId: string) => mutatePalette((p) => {
    const from = p.findIndex((swatch) => swatch.id === activeId)
    const to = p.findIndex((swatch) => swatch.id === overId)
    if (from < 0 || to < 0 || from === to) return p
    const next = [...p]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
  })

  const doReset = () => {
    const nextPalette = createDefaultPalette()
    mutateWorkspace({ palette: nextPalette, assignments: {}, roleBindings: {}, elementOverrides: {}, tokenSystem: createTokenSystem(nextPalette), componentIds: [], colourWayChosen: false })
    setSelectedElement(null)
    setConfirmReset(false)
    toast.push("Palette reset — Undo brings it back", "success")
  }

  const trySelectAsset = (asset: TemplateAsset) => {
    if (libraryMode === "component" && asset.category === "Components") {
      if (componentIds.includes(asset.id)) {
        toast.push(`${asset.name} is already in this project`)
      } else {
        mutateWorkspace({ componentIds: [...componentIds, asset.id] })
        toast.push(`${asset.name} added to project components`, "success")
      }
      setPreviewPickerOpen(false)
      return
    }
    const nextGroup = GROUPS.find((group) => group.label === asset.category)
    const nextSub = nextGroup?.subs.find((sub) => sub.templates.some((template) => template.key === asset.id))
    if (!nextGroup || !nextSub) return

    const fullKey = previewKey(nextGroup.key, nextSub.key, asset.id)
    if (needsPaywall(ent, fullKey)) {
      setPaywall({ open: true, reason: `You've used all ${FREE_PREVIEW_LIMIT} free previews. Return to Quick Palette to keep creating and exporting for free.` })
      return
    }

    setSel({ group: nextGroup.key, sub: nextSub.key })
    setTplBySub((current) => ({ ...current, [`${nextGroup.key}/${nextSub.key}`]: asset.id }))
    setSelectedElement(null)
    setEnt((current) => recordSwitch(current, fullKey))
    setPreviewPickerOpen(false)
    toast.push(`Template: ${asset.type} · ${asset.variant}`)
  }

  const openLibrary = (mode: "template" | "component") => {
    setLibraryMode(mode)
    setLibraryStartCategory(mode === "component" ? "Components" : currentAsset?.category ?? "Website")
    setPreviewPickerOpen(true)
  }

  const roleSourceOptions = Array.from(new Set([
    ...(roleLabels ?? []).filter((role): role is string => Boolean(role)),
    ...DESIGN_ROLES,
    "Page Background",
    "Secondary Background",
    "Brand Primary",
    "Heading Text",
    "Body Text",
    "Button Text",
    "Border",
  ]))
  const roleMapTarget = palette.find((swatch) => swatch.id === roleMapTargetId) ?? palette[0]
  const targetIndex = roleMapTarget ? palette.findIndex((swatch) => swatch.id === roleMapTarget.id) : -1
  const targetDefaultRole = targetIndex >= 0 ? roleLabels?.[targetIndex] ?? null : null
  const roleMapSemanticKey = semanticKeyForRole(roleMapSource)
  const currentRoleTargetId = roleMapSemanticKey ? tokenSystem.semantic.colours[roleMapSemanticKey] : roleBindings[roleMapSource]
  const roleMapNoOp = !roleMapTarget
    || currentRoleTargetId === roleMapTarget.id
    || roleMapTarget.name.trim().toLowerCase() === roleMapSource.trim().toLowerCase()
    || targetDefaultRole?.trim().toLowerCase() === roleMapSource.trim().toLowerCase()

  const roleKind = (role: string) => {
    const value = role.toLowerCase()
    if (TEXT_ROLE_HINTS.some((hint) => value.includes(hint))) return "text"
    if (BACKGROUND_ROLE_HINTS.some((hint) => value.includes(hint))) return "background"
    return "other"
  }

  const applyRoleMapping = () => {
    if (!roleMapTarget) return
    if (roleMapNoOp) {
      const message = `${roleMapSource} already uses ${roleMapTarget.name}.`
      setRoleMapMessage({ text: message, tone: "neutral" })
      toast.push(message)
      return
    }

    const nextBindings = { ...roleBindings, [roleMapSource]: roleMapTarget.id }
    const semanticKey = semanticKeyForRole(roleMapSource)
    const nextTokenSystem = semanticKey
      ? { ...tokenSystem, semantic: { ...tokenSystem.semantic, colours: { ...tokenSystem.semantic.colours, [semanticKey]: roleMapTarget.id } } }
      : tokenSystem
    const rolesUsingTarget = [
      targetDefaultRole,
      ...Object.entries(nextBindings).filter(([, id]) => id === roleMapTarget.id).map(([role]) => role),
    ].filter((role): role is string => Boolean(role))
    const createsTextBackgroundCollision = rolesUsingTarget.some((role) => roleKind(role) === "text")
      && rolesUsingTarget.some((role) => roleKind(role) === "background")

    const issues = themeContrastIssues(deriveTheme(palette, roleLabels, { ...nextBindings, ...semanticRoleBindings(nextTokenSystem) }))
    mutateWorkspace({ roleBindings: nextBindings, tokenSystem: nextTokenSystem })
    if (createsTextBackgroundCollision || (roleKind(roleMapSource) !== "other" && issues.length)) {
      const issue = issues[0]
      const detail = createsTextBackgroundCollision
        ? "The same colour is being used for text and a background."
        : `${issue.foreground} is ${issue.ratio}:1 on ${issue.background}.`
      const message = `${roleMapSource} updated. Needs review: ${detail} Try a lighter or darker colour if readability matters here.`
      setRoleMapMessage({ text: message, tone: "error" })
      toast.push("Mapping updated with an accessibility warning")
    } else {
      const message = `${roleMapSource} now uses ${roleMapTarget.name} in every preview.`
      setRoleMapMessage({ text: message, tone: "success" })
      toast.push(message, "success")
    }
  }

  const tokenColor = (role: string): string => {
    const semanticKey = semanticKeyForRole(role)
    if (semanticKey) return semanticColour(tokenSystem, palette, semanticKey, theme.accent)
    const boundId = roleBindings[role]
    const bound = boundId ? palette.find((swatch) => swatch.id === boundId)?.hex : undefined
    if (bound) return bound
    const key = role.toLowerCase()
    if (key.includes("button text")) return theme.onBrand
    if (key.includes("border") || key.includes("divider") || key.includes("grid")) return theme.border
    if (key.includes("secondary") || key.includes("surface") || key.includes("card") || key.includes("form")) return theme.surface
    if (key.includes("heading")) return theme.ink
    if (key.includes("body") || key.includes("text") || key.includes("caption") || key.includes("label")) return theme.inkSoft
    if (key.includes("background") || key.includes("canvas")) return theme.paper
    return theme.accent
  }

  const selectedElementValues = selectedElement
    ? elementTokens(selectedElement.kind, {
        ...(selectedElement.kind === "button" ? buttonMainElementTokens(tokenSystem) : selectedElement.kind === "card" ? cardDefaultElementTokens(tokenSystem) : {}),
        ...selectedElement.defaults,
        ...elementOverrides[selectedElement.id],
      })
    : null
  const inspectorAccessibilityChecks = selectedElement?.kind === "button" && selectedElementValues
    ? accessibilityChecks.map((check) => {
        if (check.id === "touch-target") {
          const size = String(selectedElementValues.size)
          const height = size === "size.sm" ? 36 : size === "size.lg" ? 52 : 44
          return { ...check, status: height >= 44 ? "good" as const : height >= 40 ? "review" as const : "poor" as const, value: `${height}px high` }
        }
        if (check.id === "button") {
          const background = tokenColor(String(selectedElementValues.colourRole ?? "Brand Primary"))
          const textToken = tokenSystem.component.buttonMain.text
          const textColour = textToken === "textInverse" ? readableOn(background) : semanticColour(tokenSystem, palette, textToken, theme.onBrand)
          const ratio = contrastRatio(textColour, background)
          return { ...check, status: ratio >= 4.5 ? "good" as const : ratio >= 3 ? "review" as const : "poor" as const, value: `${Math.round(ratio * 100) / 100}:1` }
        }
        return check
      })
    : accessibilityChecks
  const updateSelectedElement = (key: string, value: string | boolean) => {
    if (!selectedElement) return
    mutateWorkspace({
      elementOverrides: {
        ...elementOverrides,
        [selectedElement.id]: { ...elementOverrides[selectedElement.id], [key]: value },
      },
    })
  }

  const centerTemplate = () => {
    previewRendererRef.current?.fitToScreen()
    previewAreaRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    toast.push("Template centred", "success")
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await previewAreaRef.current?.requestFullscreen()
    } catch {
      toast.push("Full screen is not available in this browser", "error")
    }
  }

  const ctx: PreviewCtxValue = {
    editMode,
    assignments,
    roleColor: (swatchId) => palette.find((s) => s.id === swatchId)?.hex,
    tokenColor,
    brand,
    buttonStyle,
    buttonProps,
    trio,
    selectedElement,
    elementOverrides,
    tokenSystem,
    selectElement: setSelectedElement,
  }

  return (
    <div className="flex min-h-full flex-col bg-offwhite text-charcoal xl:h-full">
      {/* Palette roles stay together in their own rail. */}
      <section className="shrink-0 border-b border-softgrey/70 bg-white px-3 py-2 sm:px-5">
        <PalettePanel
          palette={palette}
          onChange={change}
          onAdd={add}
          onRemove={remove}
          onToggleLock={toggleLock}
          onRename={rename}
          onReorder={reorder}
          brand={BRAND.brand}
          roleLabels={roleLabels}
        />
      </section>

      <WorkflowBar
        colourWayChosen={colourWayChosen}
        componentCount={componentIds.length}
        onChoose={() => { mutateWorkspace({ colourWayChosen: true }); toast.push("Colour way chosen", "success") }}
        onTokens={() => setTokenPanelOpen(true)}
        onComponents={() => openLibrary("component")}
        onExport={() => setExportOpen(true)}
      />

      {/* Preview stacks above controls until there is room for a real sidebar. */}
      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-softgrey/70 bg-white px-3 py-2.5 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase text-charcoal/45">Current template:</p>
          <p className="truncate text-[14px] font-bold text-charcoal/80">{currentTemplateName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <WorkspaceIconButton label="Auto-center template" onClick={centerTemplate}><CenterIcon /></WorkspaceIconButton>
          <WorkspaceIconButton label={isFullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen} pressed={isFullscreen}><FullscreenIcon /></WorkspaceIconButton>
          <button type="button" onClick={() => { setEditMode((current) => !current); if (editMode) setSelectedElement(null) }} className={`flex h-11 items-center gap-2 rounded-[8px] border px-3 text-[12px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${editMode ? "border-brand bg-[#eef8fc] text-brand-dark" : "border-[#d7d9dd] bg-white text-[#374151] hover:bg-[#f3f4f6]"}`} aria-pressed={editMode}>
            <EditIcon /><span className="hidden md:inline">Edit elements</span>
          </button>
          <button type="button" onClick={() => openLibrary("template")} className="flex h-11 items-center gap-2 rounded-[8px] border border-[#d7d9dd] bg-[#f3f4f6] px-3 text-[12px] font-semibold text-[#374151] transition-colors hover:bg-[#e9eaec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2" aria-label="Change template" title="Change template">
            <LayersIcon /><span className="hidden sm:inline">Change template</span>
          </button>
        </div>
      </div>

      {/* ================= Preview (large, immersive) ================= */}
      <main ref={previewAreaRef} className="relative min-h-[520px] flex-none overflow-y-auto bg-[#171616] p-3 sm:p-5 xl:min-h-0 xl:flex-1 fullscreen:h-screen fullscreen:w-screen fullscreen:p-4">
        <div className="flex h-full min-h-[440px] flex-col gap-3 sm:gap-4">
          <div className="min-h-[300px] flex-1">
            <PreviewProvider value={ctx}>
              <ScopeProvider value={`${sel.group}/${sel.sub}/${tpl}`}>
                <div key={sel.sub + tpl} className="animate-pop-in relative h-full w-full overflow-hidden rounded-[8px] border border-white/10 bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
                  <PreviewRenderer ref={previewRendererRef} group={sel.group} sub={sel.sub} templateId={tpl} theme={theme} />
                </div>
              </ScopeProvider>
            </PreviewProvider>
          </div>

          {/* Preview browser (arrows + dropdown + Template chips) removed — Variant + Layout in the sidebar drive template and layout switching */}
        </div>

        {editMode && (
          <div
            role="status"
            className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-charcoal/85 px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-lg backdrop-blur"
          >
            Edit Elements is on - select an element to inspect its tokens
          </div>
        )}
        <AccessibilityCanvasBadge checks={accessibilityChecks} />
        {isFullscreen && <button type="button" onClick={toggleFullscreen} className="absolute left-4 top-4 z-30 flex h-9 items-center gap-2 rounded-[8px] border border-white/20 bg-charcoal/90 px-3 text-xs font-semibold text-white shadow-lg" aria-label="Exit full screen"><CloseIcon /> Exit full screen</button>}
      </main>

        </div>{/* /main column */}

        {/* ================= Contextual inspector (always visible) ================= */}
        <InspectorPanel
          selectedElement={selectedElement}
          elementValues={selectedElementValues}
          onElementChange={updateSelectedElement}
          onClearSelection={() => setSelectedElement(null)}
          onRandomize={randomize}
          onUndo={undo}
          onRedo={redo}
          onReset={() => setConfirmReset(true)}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          roleSource={roleMapSource}
          roleTargetId={roleMapTargetId}
          roleSourceOptions={roleSourceOptions}
          paletteOptions={palette.map(({ id, name, hex }) => ({ id, name, hex }))}
          onRoleSource={(value) => { setRoleMapSource(value); setRoleMapMessage(null) }}
          onRoleTarget={(value) => { setRoleMapTargetId(value); setRoleMapMessage(null) }}
          onRoleSet={applyRoleMapping}
          roleSetDisabled={roleMapNoOp}
          roleMessage={roleMapMessage}
          onInsertBrand={() => setBrandOpen(true)}
          onHelp={() => setHelpOpen(true)}
          exportSummary={[`${palette.length} palette colours`, "5 token layers", `${componentIds.length} added components`, currentTemplateName]}
          accessibilityChecks={inspectorAccessibilityChecks}
        />
      </div>{/* /main area flex row */}

      {/* ================= Preview picker ================= */}
      {previewPickerOpen && (
        <TemplateLibrary
          selectedId={tpl}
          onSelect={trySelectAsset}
          onClose={() => setPreviewPickerOpen(false)}
          initialCategory={libraryStartCategory}
          title={libraryMode === "component" ? "Add a component" : "Change template"}
          categories={libraryMode === "component" ? ["Components"] : undefined}
        />
      )}

      {tokenPanelOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-[70] grid place-items-center bg-charcoal/45 text-sm font-semibold text-white">Loading token tools...</div>}>
          <TokenSystemPanel
            open
            system={tokenSystem}
            palette={palette}
            theme={theme}
            onChange={(next) => mutateWorkspace({ tokenSystem: next })}
            onClose={() => setTokenPanelOpen(false)}
          />
        </Suspense>
      )}

      {/* Brand modal */}
      {brandOpen && (
        <BrandUpload
          brand={brand}
          onChange={setBrand}
          onClose={() => setBrandOpen(false)}
        />
      )}

      {/* Export */}
      <ExportPanel
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        palette={palette}
        tokenSystem={tokenSystem}
        accessibilityChecks={accessibilityChecks}
        project={{
          name: "Palette Preview design system",
          templateId: tpl,
          componentIds,
          colourWayChosen,
          brand,
          roleBindings,
          elementOverrides,
        }}
        onImportProject={(imported) => {
          const nextPalette = imported.palette
          const nextSystem = normalizeTokenSystem(imported.tokenSystem, nextPalette)
          mutateWorkspace({
            palette: nextPalette,
            tokenSystem: nextSystem,
            componentIds: imported.project?.componentIds ?? [],
            colourWayChosen: imported.project?.colourWayChosen ?? true,
            roleBindings: imported.project?.roleBindings ?? {},
            elementOverrides: imported.project?.elementOverrides ?? {},
          })
          if (imported.project?.brand) setBrand(imported.project.brand as Brand)
          const importedAsset = imported.project?.templateId ? templateAssetById.get(imported.project.templateId) : undefined
          if (importedAsset) {
            const group = GROUPS.find((item) => item.label === importedAsset.category)
            const sub = group?.subs.find((item) => item.templates.some((template) => template.key === importedAsset.id))
            if (group && sub) {
              setSel({ group: group.key, sub: sub.key })
              setTplBySub((current) => ({ ...current, [`${group.key}/${sub.key}`]: importedAsset.id }))
            }
          }
        }}
        onToast={(m, k) => toast.push(m, k)}
      />

      {/* Intro tour + Help */}
      <IntroTour open={helpOpen} onClose={closeHelp} />

      {/* Reset confirmation */}
      <ConfirmDialog
        open={confirmReset}
        title="Reset your palette?"
        body="Your palette, mappings, tokens, component choices and element edits will return to their defaults. You can Undo (Ctrl/Cmd+Z) if you change your mind."
        confirmLabel="Reset palette"
        destructive
        onConfirm={doReset}
        onCancel={() => setConfirmReset(false)}
      />

      {/* Pro paywall */}
      <PaywallOverlay
        open={paywall.open}
        reason={paywall.reason}
        onUnlock={goPro}
        onLater={dismissPaywall}
      />
    </div>
  )
}

function WorkflowBar({
  colourWayChosen,
  componentCount,
  onChoose,
  onTokens,
  onComponents,
  onExport,
}: {
  colourWayChosen: boolean
  componentCount: number
  onChoose: () => void
  onTokens: () => void
  onComponents: () => void
  onExport: () => void
}) {
  type WorkflowStage = { label: string; state: "ready" | "action" | "header"; action?: () => void }
  const stages: WorkflowStage[] = [
    { label: "Palette", state: "ready", action: undefined },
    { label: "Preview", state: "ready", action: undefined },
    { label: colourWayChosen ? "Chosen" : "Choose", state: colourWayChosen ? "ready" : "action", action: colourWayChosen ? undefined : onChoose },
    { label: "Tokens", state: "action", action: onTokens },
    { label: "Template", state: "header", action: undefined },
    { label: componentCount ? `Components ${componentCount}` : "Components", state: componentCount ? "ready" : "action", action: onComponents },
    { label: "Edit", state: "header", action: undefined },
    { label: "Export", state: "action", action: onExport },
  ] as const
  return (
    <nav className="shrink-0 overflow-x-auto border-b border-softgrey bg-[#fafafa] px-3 py-2 sm:px-5" aria-label="Generate design workflow">
      <ol className="flex min-w-max items-center gap-1.5">
        {stages.map((stage, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <span className="h-px w-2 bg-softgrey" aria-hidden />}
            {stage.action ? (
              <button type="button" onClick={stage.action} className="flex h-11 items-center gap-1.5 rounded-[7px] border border-softgrey bg-white px-2.5 text-[11px] font-semibold text-charcoal/70 hover:border-charcoal/25 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-charcoal text-[9px] text-white">{index + 1}</span>{stage.label}
              </button>
            ) : (
              <span className={`flex h-11 items-center gap-1.5 px-2 text-[11px] font-semibold ${stage.state === "ready" ? "text-[#067647]" : "text-charcoal/45"}`} aria-label={`${index + 1}. ${stage.label}${stage.state === "ready" ? ", ready" : ", available in preview toolbar"}`}>
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[9px] ${stage.state === "ready" ? "bg-[#d1fadf] text-[#067647]" : "bg-softgrey text-charcoal/55"}`}>{stage.state === "ready" ? <CheckSmallIcon /> : index + 1}</span>{stage.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function AccessibilityCanvasBadge({ checks }: { checks: AccessibilityCheck[] }) {
  const status = worstAccessibilityStatus(checks)
  const count = checks.filter((check) => check.status !== "good").length
  return (
    <div className={`pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-[7px] border px-2.5 py-1.5 text-[10.5px] font-semibold shadow-sm backdrop-blur ${status === "good" ? "border-[#a7e0c2] bg-[#ecfdf3]/95 text-[#067647]" : status === "review" ? "border-[#fed7aa] bg-[#fff7ed]/95 text-[#9a3412]" : "border-[#fecaca] bg-[#fef2f2]/95 text-[#b42318]"}`} role="status">
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      Accessibility: {status === "good" ? ACCESSIBILITY_STATUS_LABEL.good : ACCESSIBILITY_STATUS_LABEL.review}{count ? ` · ${count}` : ""}
    </div>
  )
}

function WorkspaceIconButton({
  label, onClick, pressed = false, children,
}: {
  label: string
  onClick: () => void
  pressed?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${pressed ? "border-brand bg-[#eef8fc] text-brand-dark" : "border-[#d7d9dd] bg-white text-[#4b5563] hover:bg-[#f3f4f6]"}`}
    >
      {children}
    </button>
  )
}

/* ---------- icons ---------- */
const EditIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 4.5 5 5-11 11H3.5v-5.5z" /><path d="m12 7 5 5" /></svg>)
const CenterIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /><circle cx="12" cy="12" r="3" /></svg>)
const LayersIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m12 2 10 6-10 6L2 8Z" /><path d="m2 12 10 6 10-6M2 16l10 6 10-6" /></svg>)
const CloseIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>)
const FullscreenIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>)
const CheckSmallIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 4 4L19 6" /></svg>)
