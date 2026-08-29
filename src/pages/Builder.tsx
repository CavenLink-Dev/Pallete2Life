import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  BRAND,
  contrastRatio,
  deriveTheme,
  hslToHex,
  normalizeHex,
  randomHex,
  readableOn,
  themeContrastIssues,
  uid,
  withAlpha,
  type RoleBindings,
  type Swatch,
} from "../lib/color"
import PalettePanel from "../components/PalettePanel"
import {
  BUTTON_STYLES,
  ButtonLab,
  DEFAULT_BUTTON_PROPS,
  STYLE_META,
  paletteToTrio,
  type ButtonProps,
  type ButtonStyle,
} from "../components/ButtonPreview"
import {
  GROUPS,
  renderComponentPreview,
  type GroupKey,
} from "../components/Previews"
import { PreviewProvider, ScopeProvider, type Brand, type PreviewCtxValue } from "../components/PreviewCtx"
import BrandUpload from "../components/BrandUpload"
import { useNav, useRoute } from "../lib/router"
import { useToast } from "../components/Toast"
import ConfirmDialog from "../components/ConfirmDialog"
import IntroTour, { markIntroSeen, shouldShowIntro } from "../components/IntroTour"
import PaywallOverlay from "../components/PaywallOverlay"
import {
  FREE_PREVIEW_LIMIT,
  freeRemaining,
  loadEntitlement,
  needsPaywall,
  previewKey,
  recordSwitch,
  saveEntitlement,
  type Entitlement,
} from "../lib/entitlement"
import ExportPanel from "../components/ExportPanel"
import { createDefaultPalette, loadPalette } from "../lib/paletteStore"
import PropertiesPanel from "../components/PropertiesPanel"
import { pickCuratedPalette } from "../lib/curatedPalettes"
import TemplateLibrary from "../components/TemplateLibrary"
import { defaultTemplate, type TemplateAsset } from "../lib/templateAssets"

type Selection = { group: GroupKey; sub: string }

const START_NAMES = ["Primary", "Secondary", "Tertiary", "Quaternary", "Quinary", "Senary"]

/* Contextual colour roles per preview. Left aligned to palette index; extra
 * swatches keep their custom name. Buttons use STYLE_META (per style). */
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
  const navHome = useNav()
  const [, navigate] = useRoute()
  const toast = useToast()

  // ---------- palette + design state ----------
  const [palette, setPalette] = useState<Swatch[]>(loadPalette)
  const [sel, setSel] = useState<Selection>({ group: "website", sub: "landing-page" })
  const [tplBySub, setTplBySub] = useState<Record<string, string>>({})
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>(() => loadStored("buttonStyle", "depth" as ButtonStyle))
  const [buttonProps, setButtonProps] = useState<ButtonProps>(() => loadStored("buttonProps", DEFAULT_BUTTON_PROPS))

  // Edit Elements
  const [editMode, setEditMode] = useState(false)
  const [assignments, setAssignments] = useState<Record<string, string>>(() => migrateSwatchReferences(loadStored("assignments", {}), palette))
  const [roleBindings, setRoleBindings] = useState<RoleBindings>(() => migrateSwatchReferences(loadStored("roleBindings", {}), palette))
  const [assignTarget, setAssignTarget] = useState<{ id: string; label: string; currentHex: string } | null>(null)

  // Brand
  const [brand, setBrand] = useState<Brand>(() => loadStored("brand", { name: "Palette Preview", logo: null, symbol: null }))
  const [brandOpen, setBrandOpen] = useState(false)

  // Overlays
  const [previewPickerOpen, setPreviewPickerOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(shouldShowIntro)
  const [confirmReset, setConfirmReset] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

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
  const remaining = freeRemaining(ent)
  const remainingLabel = ent.isPro ? null : `${remaining} preview${remaining === 1 ? "" : "s"} left`

  useStored("palette", palette)
  useStored("assignments", assignments)
  useStored("roleBindings", roleBindings)
  useStored("brand", brand)
  useStored("buttonStyle", buttonStyle)
  useStored("buttonProps", buttonProps)

  const closeHelp = useCallback(() => { markIntroSeen(); setHelpOpen(false) }, [])

  // Fullscreen Escape
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [fullscreen])

  const pushHistory = useCallback((snapshot: BuilderSnapshot) => {
    setUndoStack((stack) => stack.length >= MAX_HISTORY ? [...stack.slice(1), snapshot] : [...stack, snapshot])
    setRedoStack([])
  }, [])

  // Palette edits and role bindings share one history so Set can be undone.
  const mutatePalette = useCallback((updater: (prev: Swatch[]) => Swatch[]) => {
    const next = updater(palette)
    if (JSON.stringify(palette) === JSON.stringify(next)) return
    pushHistory({ palette, assignments, roleBindings })
    setPalette(next)
  }, [assignments, palette, pushHistory, roleBindings])

  const mutateWorkspace = useCallback((next: Partial<BuilderSnapshot>) => {
    pushHistory({ palette, assignments, roleBindings })
    if (next.palette) setPalette(next.palette)
    if (next.assignments) setAssignments(next.assignments)
    if (next.roleBindings) setRoleBindings(next.roleBindings)
  }, [assignments, palette, pushHistory, roleBindings])

  const undo = useCallback(() => {
    if (!undoStack.length) { toast.push("Nothing to undo"); return }
    const previous = undoStack[undoStack.length - 1]
    setUndoStack(undoStack.slice(0, -1))
    setRedoStack((redo) => [...redo, { palette, assignments, roleBindings }])
    setPalette(previous.palette)
    setAssignments(previous.assignments)
    setRoleBindings(previous.roleBindings)
    setRoleMapMessage(null)
    toast.push("Undone")
  }, [assignments, palette, roleBindings, toast, undoStack])

  const redo = useCallback(() => {
    if (!redoStack.length) { toast.push("Nothing to redo"); return }
    const next = redoStack[redoStack.length - 1]
    setRedoStack(redoStack.slice(0, -1))
    setUndoStack((undoItems) => [...undoItems, { palette, assignments, roleBindings }])
    setPalette(next.palette)
    setAssignments(next.assignments)
    setRoleBindings(next.roleBindings)
    setRoleMapMessage(null)
    toast.push("Redone")
  }, [assignments, palette, redoStack, roleBindings, toast])

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
  const isButton = false
  const currentTemplateLabel = isButton
    ? STYLE_META[buttonStyle].label
    : templates.find((t) => t.key === tpl)?.label ?? ""

  const roleLabels: (string | null)[] | undefined = isButton
    ? STYLE_META[buttonStyle].roles.map((r) => r.part)
    : ROLES_BY_PREVIEW[`${sel.group}/${sel.sub}`] ?? ROLES_BY_PREVIEW[sel.group]

  const theme = useMemo(() => deriveTheme(palette, roleLabels, roleBindings), [palette, roleBindings, roleLabels])
  const trio = useMemo(() => paletteToTrio(palette), [palette])

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
    const candidateTheme = deriveTheme(next, roleLabels, roleBindings)
    const backgrounds = [candidateTheme.paper, candidateTheme.surface]
    const choices = ["#101828", "#FFFFFF"]
    const safeText = choices.sort((a, b) =>
      Math.min(...backgrounds.map((bg) => contrastRatio(b, bg))) - Math.min(...backgrounds.map((bg) => contrastRatio(a, bg))),
    )[0]

    for (const role of ["Heading Text", "Body Text"]) {
      const id = swatchIdForRole(next, role)
      const swatch = next.find((item) => item.id === id)
      if (!swatch || swatch.locked) continue
      const currentTheme = deriveTheme(next, roleLabels, roleBindings)
      const foreground = role === "Heading Text" ? currentTheme.ink : currentTheme.inkSoft
      if ([currentTheme.paper, currentTheme.surface].some((bg) => contrastRatio(foreground, bg) < 4.5)) {
        swatch.hex = safeText
      }
    }
    return next
  }

  const acceptSafePalette = (candidate: Swatch[]): Swatch[] | null => {
    const repaired = repairTextContrast(candidate)
    return themeContrastIssues(deriveTheme(repaired, roleLabels, roleBindings)).length ? null : repaired
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
    mutateWorkspace({ palette: createDefaultPalette(), assignments: {}, roleBindings: {} })
    setConfirmReset(false)
    toast.push("Palette reset — Undo brings it back", "success")
  }

  const trySelectAsset = (asset: TemplateAsset) => {
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
    setEnt((current) => recordSwitch(current, fullKey))
    setPreviewPickerOpen(false)
    toast.push(`Template: ${asset.type} · ${asset.variant}`)
  }

  const roleSourceOptions = Array.from(new Set([
    ...(roleLabels ?? []).filter((role): role is string => Boolean(role)),
    ...DESIGN_ROLES,
  ]))
  const roleMapTarget = palette.find((swatch) => swatch.id === roleMapTargetId) ?? palette[0]
  const targetIndex = roleMapTarget ? palette.findIndex((swatch) => swatch.id === roleMapTarget.id) : -1
  const targetDefaultRole = targetIndex >= 0 ? roleLabels?.[targetIndex] ?? null : null
  const roleMapNoOp = !roleMapTarget
    || roleBindings[roleMapSource] === roleMapTarget.id
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
    const rolesUsingTarget = [
      targetDefaultRole,
      ...Object.entries(nextBindings).filter(([, id]) => id === roleMapTarget.id).map(([role]) => role),
    ].filter((role): role is string => Boolean(role))
    const createsTextBackgroundCollision = rolesUsingTarget.some((role) => roleKind(role) === "text")
      && rolesUsingTarget.some((role) => roleKind(role) === "background")

    if (createsTextBackgroundCollision) {
      const message = `${roleMapTarget.name} cannot be both text and a background because the contrast would be 1:1.`
      setRoleMapMessage({ text: message, tone: "error" })
      toast.push(message, "error")
      return
    }

    const issues = themeContrastIssues(deriveTheme(palette, roleLabels, nextBindings))
    if (roleKind(roleMapSource) !== "other" && issues.length) {
      const issue = issues[0]
      const message = `${issue.foreground} would be ${issue.ratio}:1 on ${issue.background}. Choose a safer colour.`
      setRoleMapMessage({ text: message, tone: "error" })
      toast.push(message, "error")
      return
    }

    mutateWorkspace({ roleBindings: nextBindings })
    const message = `${roleMapSource} now uses ${roleMapTarget.name} in every preview.`
    setRoleMapMessage({ text: message, tone: "success" })
    toast.push(message, "success")
  }

  const applyElementAssignment = (swatch: Swatch) => {
    if (!assignTarget) return
    const kind = roleKind(assignTarget.label)
    const backgrounds = [theme.paper, theme.surface]
    const unsafeText = kind === "text" && backgrounds.some((background) => contrastRatio(swatch.hex, background) < 4.5)
    const unsafeBackground = kind === "background"
      && [theme.ink, theme.inkSoft].some((foreground) => contrastRatio(foreground, swatch.hex) < 4.5)
    if (unsafeText || unsafeBackground) {
      const ratio = unsafeText
        ? Math.min(...backgrounds.map((background) => contrastRatio(swatch.hex, background)))
        : Math.min(contrastRatio(theme.ink, swatch.hex), contrastRatio(theme.inkSoft, swatch.hex))
      toast.push(`${swatch.name} would only reach ${ratio.toFixed(2)}:1 contrast here`, "error")
      return
    }
    mutateWorkspace({ assignments: { ...assignments, [assignTarget.id]: swatch.id } })
    setAssignTarget(null)
    toast.push(`${assignTarget.label} now uses ${swatch.name}`, "success")
  }

  const ctx: PreviewCtxValue = {
    editMode,
    assignments,
    requestAssign: (id, label, currentHex) => setAssignTarget({ id, label, currentHex }),
    roleColor: (swatchId) => palette.find((s) => s.id === swatchId)?.hex,
    brand,
    buttonStyle,
    buttonProps,
    trio,
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
          onRandomize={randomize}
          onToggleLock={toggleLock}
          onRename={rename}
          onReorder={reorder}
          brand={BRAND.brand}
          roleLabels={roleLabels}
        />
      </section>

      {/* Preview stacks above controls until there is room for a real sidebar. */}
      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-softgrey/70 bg-white px-3 py-2.5 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase text-charcoal/45">Current template</p>
          <p className="truncate text-[13px] font-semibold text-charcoal/80">Template / {currentGroup.label} / {currentSub.label} / {currentTemplateLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setPreviewPickerOpen(true)}
          className="flex h-10 shrink-0 items-center gap-2 rounded-[8px] border border-[#d7d9dd] bg-[#f3f4f6] px-3 text-[12px] font-semibold text-[#374151] transition-colors hover:bg-[#e9eaec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Change template"
          title="Change template"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m12 2 10 6-10 6L2 8Z"/><path d="M2 16l10 6 10-6"/><path d="M2 12l10 6 10-6"/></svg>
          <span className="hidden sm:inline">Change template</span>
        </button>
      </div>

      {/* ================= Preview (large, immersive) ================= */}
      <main className="relative min-h-[520px] flex-none overflow-y-auto bg-[#171616] p-3 sm:p-5 xl:min-h-0 xl:flex-1">
        <div className="flex h-full min-h-[440px] flex-col gap-3 sm:gap-4">
          <div className="min-h-[300px] flex-1">
            <PreviewProvider value={ctx}>
              {isButton ? (
                <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
                  <ButtonLab colors={trio} style={buttonStyle} props={buttonProps} setProps={setButtonProps} />
                </div>
              ) : (
                <ScopeProvider value={`${sel.group}/${sel.sub}/${tpl}`}>
                  <div
                    key={sel.sub + tpl}
                    className="animate-pop-in relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]"
                  >
                    {renderComponentPreview(sel.group, sel.sub, tpl, theme)}
                  </div>
                </ScopeProvider>
              )}
            </PreviewProvider>
          </div>

          {/* Preview browser (arrows + dropdown + Template chips) removed — Variant + Layout in the sidebar drive template and layout switching */}
        </div>

        {editMode && (
          <div
            role="status"
            className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-charcoal/85 px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-lg backdrop-blur"
          >
            Edit Elements is on — click something in the preview to customise it
          </div>
        )}
      </main>

        </div>{/* /main column */}

        {/* ================= Properties sidebar (always visible) ================= */}
        <PropertiesPanel
          onRandomize={randomize}
          onUndo={undo}
          onRedo={redo}
          onSave={() => toast.push("Palette autosaves as you work", "success")}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onFormat={() => setPreviewPickerOpen(true)}
          formatLabel="Templates"
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
          onFullscreen={() => setFullscreen(true)}
          onExport={() => setExportOpen(true)}
          onHelp={() => setHelpOpen(true)}
        />
      </div>{/* /main area flex row */}

      {/* ================= Preview picker ================= */}
      {previewPickerOpen && (
        <TemplateLibrary
          selectedId={tpl}
          onSelect={trySelectAsset}
          onClose={() => setPreviewPickerOpen(false)}
        />
      )}

      {/* ================= Full screen preview ================= */}
      {fullscreen && !isButton && (
        <div className="fixed inset-0 z-40 flex flex-col bg-charcoal/95">
          <div className="min-h-0 flex-1 p-3 sm:p-5">
            <PreviewProvider value={ctx}>
              <ScopeProvider value={`${sel.group}/${sel.sub}/${tpl}`}>
                <div className="h-full w-full overflow-hidden rounded-2xl bg-white">
                  {renderComponentPreview(sel.group, sel.sub, tpl, theme)}
                </div>
              </ScopeProvider>
            </PreviewProvider>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-charcoal px-4 py-2.5 text-white sm:px-6">
            <div className="flex items-center gap-2">
              <img src="/app-icon-64.png" alt="" width={22} height={22} className="h-[22px] w-[22px] rounded-md" />
              <span className="hidden text-xs font-semibold sm:block" style={{ fontFamily: "var(--font-display)" }}>Palette <span style={{ color: BRAND.brand }}>Preview</span></span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {palette.map((s) => (
                <label
                  key={s.id}
                  className="relative block h-8 w-8 cursor-pointer rounded-full transition-transform hover:scale-110"
                  style={{ background: s.hex, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)" }}
                  title={`${s.name} · ${s.hex}${s.locked ? " · locked" : ""}`}
                >
                  <input
                    type="color"
                    value={s.hex}
                    onChange={(e) => change(s.id, normalizeHex(e.target.value))}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label={`Edit ${s.name}`}
                  />
                </label>
              ))}
              <button type="button" onClick={randomize} className="ml-1 rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white">Randomise</button>
              <button type="button" onClick={() => setEditMode((v) => !v)} className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors" style={editMode ? { background: BRAND.brand, color: "#fff" } : { border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)" }}>{editMode ? "Editing" : "Edit"}</button>
              <button type="button" onClick={() => setPreviewPickerOpen(true)} className="rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white">Change preview</button>
            </div>
            <button type="button" onClick={() => setFullscreen(false)} className="flex items-center gap-1.5 rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Brand modal */}
      {brandOpen && (
        <BrandUpload
          brand={brand}
          onChange={(b) => { setBrand(b); toast.push("Brand updated", "success") }}
          onClose={() => setBrandOpen(false)}
        />
      )}

      {/* Assign-colour modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={() => setAssignTarget(null)}>
          <div className="animate-pop-in w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Assign a colour">
            <p className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Assign a colour</p>
            <p className="mt-0.5 text-xs text-charcoal/55">Bind “{assignTarget.label}” to one of your palette colours.</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {palette.map((s) => {
                const on = assignments[assignTarget.id] === s.id
                return (
                  <button key={s.id} type="button" onClick={() => applyElementAssignment(s)} className="flex flex-col gap-1.5 rounded-xl p-1.5 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]" style={{ outline: on ? `2px solid ${BRAND.brand}` : "1px solid " + BRAND.softgrey }}>
                    <span className="h-10 w-full rounded-lg" style={{ background: s.hex, boxShadow: `inset 0 0 0 1px ${withAlpha(readableOn(s.hex), 0.12)}` }} />
                    <span className="text-[11px] font-semibold text-charcoal/70">{s.name}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex justify-between">
              <button type="button" onClick={() => { const next = { ...assignments }; delete next[assignTarget.id]; mutateWorkspace({ assignments: next }); setAssignTarget(null); toast.push("Reset to default colour") }} className="rounded-lg px-3 py-2 text-xs font-semibold text-charcoal/55 hover:text-charcoal">Reset to default</button>
              <button type="button" onClick={() => setAssignTarget(null)} className="rounded-lg border border-softgrey px-3 py-2 text-xs font-semibold text-charcoal/70 hover:text-charcoal">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Export */}
      <ExportPanel
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        palette={palette}
        isPro={ent.isPro}
        onUpgrade={() => { setExportOpen(false); setPaywall({ open: true, reason: "High-resolution image exports are part of Pro." }) }}
        onToast={(m, k) => toast.push(m, k)}
      />

      {/* Intro tour + Help */}
      <IntroTour open={helpOpen} onClose={closeHelp} />

      {/* Reset confirmation */}
      <ConfirmDialog
        open={confirmReset}
        title="Reset your palette?"
        body="Your current colours and element assignments will be replaced by the defaults. You can Undo (Ctrl/Cmd+Z) if you change your mind."
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

/* ---------- shared components ---------- */

function ToolButton({
  onClick, icon, label, valueLabel, title, active, subtle,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  valueLabel?: string
  title?: string
  active?: boolean
  subtle?: boolean
}) {
  const iconColor = active ? "#fff" : subtle ? "rgba(14,24,33,0.55)" : BRAND.brand
  const textColor = active ? "#fff" : subtle ? "rgba(14,24,33,0.7)" : BRAND.charcoal
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={valueLabel ? `${label}: ${valueLabel}` : label}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-1"
      style={active
        ? { background: BRAND.brand, color: "#fff", border: `1px solid ${BRAND.brand}` }
        : subtle
        ? { background: "transparent", color: textColor, border: "1px solid transparent" }
        : { background: "#fff", color: BRAND.charcoal, border: `1px solid ${BRAND.softgrey}` }}
    >
      <span className="flex h-4 w-4 items-center justify-center" aria-hidden style={{ color: iconColor }}>{icon}</span>
      <span>{label}</span>
      {valueLabel && !active && (
        <>
          <span className="text-charcoal/30" aria-hidden>·</span>
          <span className="max-w-[140px] truncate text-charcoal/55">{valueLabel}</span>
        </>
      )}
    </button>
  )
}

function IconButton({
  onClick, disabled, label, title, children,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      aria-label={label}
      className="flex items-center gap-1.5 rounded-lg border border-softgrey bg-white px-2 py-1.5 text-[11px] font-semibold text-charcoal/65 outline-none transition-colors hover:text-charcoal focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}

/* ---------- icons ---------- */
const Chevron = () => (<span aria-hidden className="text-charcoal/25">›</span>)
const PreviewIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 20h8" /></svg>)
const EditIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 4.5 5 5-11 11H3.5v-5.5z" /><path d="m12 7 5 5" /></svg>)
const BrandIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L7 20" /></svg>)
const ExportIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13" /><path d="m7 8 5-5 5 5" /><path d="M5 21h14" /></svg>)
const ChevronDownIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>)
const FullscreenIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>)
const UndoIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-4" /></svg>)
const RedoIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h4" /></svg>)
const ResetIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>)
const HelpIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7" /><path d="M12 17.01V17" /></svg>)
