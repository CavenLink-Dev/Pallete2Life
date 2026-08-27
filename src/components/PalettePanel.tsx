import { useEffect, useRef, useState } from "react"
import { aaCheck, hslString, normalizeHex, readableOn, rgbString, withAlpha, type Swatch } from "../lib/color"

type Props = {
  palette: Swatch[]
  onChange: (id: string, hex: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onRandomize: () => void
  onToggleLock: (id: string) => void
  onRename: (id: string, name: string) => void
  brand: string
  roleLabels?: (string | null)[]
  /** rendered to the right of the palette chips — e.g. a "Style" / "Template" button */
  rightSlot?: React.ReactNode
}

/**
 * Compact horizontal palette bar.
 * Default view is a clean strip of chips (swatch + name + hex).
 * Advanced controls (HEX/RGB/HSL, picker, contrast, rename, lock, remove) appear only
 * when a chip is clicked — they drop below the bar as an inline expanded editor.
 */
export default function PalettePanel({
  palette,
  onChange,
  onAdd,
  onRemove,
  onRandomize,
  onToggleLock,
  onRename,
  brand,
  roleLabels,
  rightSlot,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const openSwatch = palette.find((s) => s.id === openId) ?? null
  const openRole = openSwatch ? roleLabels?.[palette.indexOf(openSwatch)] ?? null : null

  // Close on Escape.
  useEffect(() => {
    if (!openId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openId])

  return (
    <div className="relative">
      <div className="flex items-center gap-2.5 overflow-x-auto pb-0.5">
        {palette.map((s, i) => (
          <SwatchChip
            key={s.id}
            swatch={s}
            role={roleLabels?.[i] ?? null}
            selected={openId === s.id}
            onClick={() => setOpenId(openId === s.id ? null : s.id)}
            brand={brand}
          />
        ))}

        <button
          type="button"
          onClick={onAdd}
          aria-label="Add colour"
          title="Add colour"
          className="ml-1 flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-dashed px-3 text-[11.5px] font-semibold text-charcoal/55 transition-colors hover:border-charcoal/40 hover:text-charcoal"
          style={{ borderColor: withAlpha("#0E1821", 0.18) }}
        >
          <PlusIcon /> Add colour
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onRandomize}
            className="flex items-center gap-1.5 rounded-lg border border-softgrey bg-white px-3 py-2 text-xs font-semibold text-charcoal/75 transition-colors hover:border-charcoal/30 hover:text-charcoal"
            title="Randomise (locked colours are kept)"
          >
            <ShuffleIcon /> Randomise
          </button>
          {rightSlot}
        </div>
      </div>

      {openSwatch && (
        <ColorEditor
          swatch={openSwatch}
          role={openRole}
          canRemove={palette.length > 1}
          onChange={(hex) => onChange(openSwatch.id, hex)}
          onRename={(name) => onRename(openSwatch.id, name)}
          onToggleLock={() => onToggleLock(openSwatch.id)}
          onRemove={() => {
            onRemove(openSwatch.id)
            setOpenId(null)
          }}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  )
}

/* ---------- swatch chip (compact) ---------- */
function SwatchChip({
  swatch,
  role,
  selected,
  onClick,
  brand,
}: {
  swatch: Swatch
  role: string | null
  selected: boolean
  onClick: () => void
  brand: string
}) {
  const fg = readableOn(swatch.hex)
  const displayName = role ?? swatch.name
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-12 shrink-0 items-center gap-2.5 rounded-xl bg-white pl-1.5 pr-3.5 text-left transition-transform hover:-translate-y-0.5"
      style={{
        boxShadow: selected
          ? `0 0 0 2px ${brand}, 0 6px 16px ${withAlpha("#0E1821", 0.12)}`
          : `inset 0 0 0 1px ${withAlpha("#0E1821", 0.08)}, 0 2px 6px ${withAlpha("#0E1821", 0.04)}`,
      }}
      title={`${swatch.name} · ${swatch.hex}${swatch.locked ? " · locked" : ""}`}
    >
      <span
        className="relative flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: swatch.hex, boxShadow: `inset 0 0 0 1px ${withAlpha(fg, 0.15)}` }}
      >
        {swatch.locked && (
          <span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-charcoal shadow"
            aria-label="Locked"
          >
            <LockIcon />
          </span>
        )}
      </span>
      <span className="flex flex-col leading-[1.1]">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.09em] text-charcoal/50"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {displayName}
        </span>
        <span className="mt-0.5 text-[12px] font-bold text-charcoal" style={{ fontFamily: "var(--font-mono)" }}>
          {swatch.hex.toUpperCase()}
        </span>
      </span>
    </button>
  )
}

/* ---------- inline expanded editor ---------- */
const ROLE_SUGGESTIONS = ["Primary", "Secondary", "Tertiary", "Text", "Caption", "Border", "Surface", "Outline", "Navigation", "Disabled", "Background", "Accent"]

function ColorEditor({
  swatch,
  role,
  canRemove,
  onChange,
  onRename,
  onToggleLock,
  onRemove,
  onClose,
}: {
  swatch: Swatch
  role: string | null
  canRemove: boolean
  onChange: (hex: string) => void
  onRename: (name: string) => void
  onToggleLock: () => void
  onRemove: () => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(swatch.hex)
  const [nameDraft, setNameDraft] = useState(swatch.name)
  const nameRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => setDraft(swatch.hex), [swatch.hex, swatch.id])
  useEffect(() => setNameDraft(swatch.name), [swatch.name, swatch.id])

  return (
    <div
      className="animate-pop-in absolute left-0 right-0 top-full z-30 mt-2 flex flex-col gap-4 rounded-2xl border border-softgrey bg-white p-4 shadow-xl sm:flex-row sm:items-center"
      role="dialog"
      aria-label={`Edit ${role ?? swatch.name}`}
    >
      {/* big picker swatch */}
      <label
        className="relative block h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl"
        style={{ background: swatch.hex, boxShadow: `inset 0 0 0 1px ${withAlpha(readableOn(swatch.hex), 0.15)}` }}
        title="Open colour picker"
      >
        <input
          type="color"
          value={swatch.hex}
          onChange={(e) => onChange(normalizeHex(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Colour picker"
        />
        <span
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: withAlpha(readableOn(swatch.hex), 0.18), color: readableOn(swatch.hex) }}
        >
          pick
        </span>
      </label>

      <div className="min-w-0 flex-1">
        <p className="mb-2 text-[10px] font-semibold uppercase text-charcoal/45">Editing</p>
        <p className="mb-3 text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>{role ?? swatch.name}</p>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            ref={nameRef}
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => onRename(nameDraft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onRename(nameDraft)
            }}
            list="hueframe-role-suggestions"
            aria-label="Colour role name"
            className="w-40 rounded-lg border border-transparent px-2 py-1 text-sm font-bold outline-none transition-colors hover:border-softgrey focus:border-[#20B9FA]"
            style={{ fontFamily: "var(--font-display)" }}
          />
          <datalist id="hueframe-role-suggestions">
            {ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
          </datalist>
          <span className="text-[10px] text-charcoal/40">Palette colour name</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* HEX (editable) */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-charcoal/45">Hex</label>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => onChange(normalizeHex(draft))}
              onKeyDown={(e) => {
                if (e.key === "Enter") onChange(normalizeHex(draft))
              }}
              className="w-full rounded-lg border border-softgrey px-3 py-2 text-sm outline-none focus:border-[#20B9FA]"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>
          {/* RGB */}
          <ReadField label="RGB" value={rgbString(swatch.hex)} />
          {/* HSL */}
          <ReadField label="HSL" value={hslString(swatch.hex)} />
        </div>

        {/* WCAG contrast feedback */}
        <div className="mt-3">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-charcoal/45">Contrast (WCAG)</label>
          <div className="flex flex-wrap gap-2">
            <ContrastBadge fg="#FFFFFF" bg={swatch.hex} label="White text" />
            <ContrastBadge fg="#0E1821" bg={swatch.hex} label="Dark text" />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onToggleLock}
            className="flex items-center gap-1.5 rounded-lg border border-softgrey bg-white px-2.5 py-1.5 text-[11px] font-semibold text-charcoal/70 transition-colors hover:text-charcoal"
            title={swatch.locked ? "Unlock (allow randomise to change)" : "Lock (keep on randomise)"}
          >
            {swatch.locked ? <LockIcon /> : <UnlockIcon />}
            {swatch.locked ? "Locked" : "Lock"}
          </button>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg border border-softgrey bg-white px-2.5 py-1.5 text-[11px] font-semibold text-charcoal/60 transition-colors hover:text-[#C22F2F]"
              title="Remove colour"
            >
              Remove
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-charcoal px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Done
        </button>
      </div>
    </div>
  )
}

export function ContrastBadge({ fg, bg, label }: { fg: string; bg: string; label?: string }) {
  const { ratio, aa, aaLarge } = aaCheck(fg, bg)
  const status = aa ? "AA Pass" : aaLarge ? "AA Large only" : "AA Fail"
  const color = aa ? "#0E8A4E" : aaLarge ? "#9A6B00" : "#C22F2F"
  const tint = aa ? "rgba(14,138,78,0.1)" : aaLarge ? "rgba(154,107,0,0.12)" : "rgba(194,47,47,0.1)"
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: tint, color }}
      title={`${label ?? "Contrast"}: ${ratio}:1 — AA needs 4.5:1 (3:1 for large text)`}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: bg, color: fg, boxShadow: "inset 0 0 0 1px rgba(14,24,33,0.15)" }}>A</span>
      {label && <span className="font-medium" style={{ color: "#7A818B" }}>{label}</span>}
      {ratio}:1 · {status}
    </span>
  )
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-charcoal/45">{label}</label>
      <div className="rounded-lg border border-softgrey bg-offwhite px-3 py-2 text-sm text-charcoal/80" style={{ fontFamily: "var(--font-mono)" }}>
        {value}
      </div>
    </div>
  )
}

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const ShuffleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
)
const LockIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)
const UnlockIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.6-1.7" />
  </svg>
)
