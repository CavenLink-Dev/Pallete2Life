import { useEffect, useState } from "react"
import { aaCheck, hslString, normalizeHex, readableOn, rgbString, withAlpha, type Swatch } from "../lib/color"

type Props = {
  palette: Swatch[]
  onChange: (id: string, hex: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onRandomize: () => void
  onToggleLock: (id: string) => void
  brand: string
  roleLabels?: (string | null)[]
  caption?: string
}

export default function PalettePanel({
  palette,
  onChange,
  onAdd,
  onRemove,
  onRandomize,
  onToggleLock,
  brand,
  roleLabels,
  caption,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const openSwatch = palette.find((s) => s.id === openId) ?? null
  const openRole = openSwatch ? roleLabels?.[palette.indexOf(openSwatch)] ?? null : null

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Your colour palette
          </h2>
          <p className="mt-0.5 text-[13px] text-charcoal/55">{caption ?? "Edit any colour and watch it flow through the preview below."}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRandomize}
            className="flex items-center gap-1.5 rounded-lg border border-softgrey bg-white px-3.5 py-2 text-xs font-medium text-charcoal transition-colors hover:border-charcoal/25"
          >
            <ShuffleIcon /> Randomise
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: brand }}
          >
            <PlusIcon /> Add colour
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {palette.map((s, i) => (
          <SwatchCard
            key={s.id}
            swatch={s}
            role={roleLabels?.[i] ?? null}
            selected={openId === s.id}
            onClick={() => setOpenId(openId === s.id ? null : s.id)}
            onRemove={() => {
              onRemove(s.id)
              if (openId === s.id) setOpenId(null)
            }}
            onToggleLock={() => onToggleLock(s.id)}
            canRemove={palette.length > 1}
            brand={brand}
          />
        ))}
      </div>

      {openSwatch && (
        <ColorEditor
          swatch={openSwatch}
          role={openRole}
          onChange={(hex) => onChange(openSwatch.id, hex)}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  )
}

/* ---------- swatch card ---------- */
function SwatchCard({
  swatch,
  role,
  selected,
  onClick,
  onRemove,
  onToggleLock,
  canRemove,
  brand,
}: {
  swatch: Swatch
  role: string | null
  selected: boolean
  onClick: () => void
  onRemove: () => void
  onToggleLock: () => void
  canRemove: boolean
  brand: string
}) {
  const fg = readableOn(swatch.hex)
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-[132px] w-full flex-col justify-between overflow-hidden rounded-2xl p-4 text-left transition-transform hover:-translate-y-1"
      style={{
        background: swatch.hex,
        boxShadow: selected
          ? `0 0 0 2px ${brand}, 0 0 0 5px ${withAlpha(brand, 0.25)}, 0 10px 26px ${withAlpha("#0E1821", 0.16)}`
          : `inset 0 0 0 1px ${withAlpha(fg, 0.12)}, 0 6px 18px ${withAlpha("#0E1821", 0.1)}`,
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: withAlpha(fg, 0.65) }}>
          {swatch.name}
        </span>
        <span className="flex items-center gap-1">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onToggleLock()
            }}
            className={"flex h-5 w-5 items-center justify-center rounded-full transition-opacity " + (swatch.locked ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
            style={{ background: withAlpha(fg, 0.16), color: fg }}
            aria-label={swatch.locked ? "Unlock colour (currently kept during randomise)" : "Lock colour (keep during randomise)"}
            title={swatch.locked ? "Locked — kept when randomising" : "Lock — keep when randomising"}
          >
            {swatch.locked ? <LockIcon /> : <UnlockIcon />}
          </span>
          {canRemove && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              style={{ background: withAlpha(fg, 0.16), color: fg }}
              aria-label="Remove colour"
            >
              <XIcon />
            </span>
          )}
        </span>
      </div>
      <div>
        <span className="block text-[17px] font-bold leading-tight" style={{ color: fg, fontFamily: "var(--font-display)" }}>
          {role ?? swatch.name}
        </span>
        <span className="mt-0.5 block text-[13px] font-semibold" style={{ color: withAlpha(fg, 0.78), fontFamily: "var(--font-mono)" }}>
          {swatch.hex}
        </span>
      </div>
    </button>
  )
}

/* ---------- inline expanded editor ---------- */
function ColorEditor({
  swatch,
  role,
  onChange,
  onClose,
}: {
  swatch: Swatch
  role: string | null
  onChange: (hex: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(swatch.hex)
  useEffect(() => setDraft(swatch.hex), [swatch.hex, swatch.id])

  return (
    <div className="animate-pop-in mt-4 flex flex-col gap-5 rounded-2xl border border-softgrey bg-white p-5 sm:flex-row sm:items-center">
      {/* big picker swatch */}
      <label
        className="relative block h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl"
        style={{ background: swatch.hex, boxShadow: `inset 0 0 0 1px ${withAlpha(readableOn(swatch.hex), 0.15)}` }}
      >
        <input
          type="color"
          value={swatch.hex}
          onChange={(e) => onChange(normalizeHex(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span
          className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: withAlpha(readableOn(swatch.hex), 0.18), color: readableOn(swatch.hex) }}
        >
          pick
        </span>
      </label>

      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>{swatch.name}</span>
          {role && <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: withAlpha("#20B9FA", 0.12), color: "#05A9F0" }}>{role}</span>}
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

      <button
        type="button"
        onClick={onClose}
        className="self-start rounded-lg border border-softgrey px-3 py-2 text-xs font-semibold text-charcoal/60 transition-colors hover:text-charcoal sm:self-center"
      >
        Done
      </button>
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
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
