import { useEffect, useMemo, useState } from "react"
import { BRAND, hexToRgb, hslString, rgbString, type Swatch } from "../lib/color"

type Props = {
  open: boolean
  onClose: () => void
  palette: Swatch[]
  isPro: boolean
  onUpgrade: () => void
  onToast: (msg: string, kind?: "info" | "success" | "error") => void
}

/**
 * Export overlay. Grouped into three simple categories:
 *   1. Copy — HEX / RGB / HSL for the whole palette
 *   2. Developer — CSS variables, Tailwind, JSON, Design Tokens
 *   3. Download — PNG, SVG, project file
 *
 * Premium items show a small Pro label rather than being hidden.
 */
export default function ExportPanel({ open, onClose, palette, isPro, onUpgrade, onToast }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const [format, setFormat] = useState<"css" | "tailwind" | "json" | "tokens">("css")

  const formatted = useMemo(() => renderFormat(format, palette), [format, palette])

  if (!open) return null

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      onToast(`${label} copied to clipboard`, "success")
    } catch {
      onToast("Couldn't copy — your browser may block clipboard access", "error")
    }
  }

  const downloadFile = (name: string, mime: string, content: string) => {
    try {
      const blob = new Blob([content], { type: mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = name
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); URL.revokeObjectURL(url)
      onToast(`Saved ${name}`, "success")
    } catch {
      onToast("Couldn't save the file", "error")
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-charcoal/40 p-4 pt-[6vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-title"
    >
      <div onClick={(e) => e.stopPropagation()} className="animate-pop-in flex w-full max-w-3xl flex-col gap-5 rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 id="export-title" className="text-[16px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Export</h2>
          <button type="button" onClick={onClose} className="rounded-lg border border-softgrey px-2.5 py-1.5 text-[11px] font-semibold text-charcoal/60 hover:text-charcoal">Close</button>
        </div>

        {/* Copy */}
        <Section title="Copy colours">
          <div className="grid gap-2 sm:grid-cols-3">
            <CopyCard label="HEX" onClick={() => copy(palette.map((s) => s.hex).join("\n"), "HEX list")} sample={palette.slice(0, 3).map((s) => s.hex).join(", ")} />
            <CopyCard label="RGB" onClick={() => copy(palette.map((s) => `${s.name}: ${rgbString(s.hex)}`).join("\n"), "RGB list")} sample={rgbString(palette[0]?.hex ?? "#000")} />
            <CopyCard label="HSL" onClick={() => copy(palette.map((s) => `${s.name}: ${hslString(s.hex)}`).join("\n"), "HSL list")} sample={hslString(palette[0]?.hex ?? "#000")} />
          </div>
        </Section>

        {/* Developer */}
        <Section title="Developer formats">
          <div className="mb-2 flex flex-wrap gap-1.5 text-[12px] font-semibold">
            <FormatChip on={format === "css"} onClick={() => setFormat("css")}>CSS variables</FormatChip>
            <FormatChip on={format === "tailwind"} onClick={() => setFormat("tailwind")}>Tailwind</FormatChip>
            <FormatChip on={format === "json"} onClick={() => setFormat("json")}>JSON</FormatChip>
            <FormatChip on={format === "tokens"} onClick={() => setFormat("tokens")}>Design tokens</FormatChip>
          </div>
          <div className="relative">
            <pre className="max-h-52 overflow-auto rounded-xl border border-softgrey bg-offwhite p-3 text-[12px] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>{formatted}</pre>
            <button
              type="button"
              onClick={() => copy(formatted, format.toUpperCase())}
              className="absolute right-2 top-2 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-charcoal/75 shadow hover:text-charcoal"
            >
              Copy
            </button>
          </div>
        </Section>

        {/* Download */}
        <Section title="Download">
          <div className="grid gap-2 sm:grid-cols-3">
            <DownloadCard
              label="Project file"
              note="Free · JSON, re-openable"
              onClick={() => downloadFile("palette.pallet-preview.json", "application/json", JSON.stringify({ v: 1, palette }, null, 2))}
            />
            <DownloadCard
              label="Palette PNG"
              note="Pro"
              locked={!isPro}
              onClick={() => (isPro ? downloadFile("palette.svg", "image/svg+xml", makePaletteSvg(palette)) : onUpgrade())}
            />
            <DownloadCard
              label="Palette SVG"
              note="Pro"
              locked={!isPro}
              onClick={() => (isPro ? downloadFile("palette.svg", "image/svg+xml", makePaletteSvg(palette)) : onUpgrade())}
            />
          </div>
          <p className="mt-2 text-[11px] text-charcoal/45">
            The project file works today so you can save your palette anywhere. High-resolution image exports are part of Pro.
          </p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal/50">{title}</p>
      {children}
    </section>
  )
}

function CopyCard({ label, sample, onClick }: { label: string; sample: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-1 rounded-xl border border-softgrey bg-white p-3 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
    >
      <span className="text-[11px] font-bold uppercase tracking-wide text-charcoal/45">{label}</span>
      <span className="truncate text-[12px] text-charcoal/70" style={{ fontFamily: "var(--font-mono)" }}>{sample}</span>
      <span className="mt-1 text-[11px] font-semibold" style={{ color: BRAND.brandDark }}>Copy list →</span>
    </button>
  )
}

function FormatChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-2.5 py-1 transition-colors"
      style={on ? { background: BRAND.brand, color: "#fff" } : { background: "#fff", color: BRAND.medgrey, border: `1px solid ${BRAND.softgrey}` }}
    >
      {children}
    </button>
  )
}

function DownloadCard({ label, note, onClick, locked }: { label: string; note: string; onClick: () => void; locked?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-1 rounded-xl border border-softgrey bg-white p-3 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
    >
      <span className="flex items-center gap-1.5 text-[13px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
        {label}
        {locked && (
          <span
            className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
            style={{ background: `${BRAND.brand}18`, color: BRAND.brandDark }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            Pro
          </span>
        )}
      </span>
      <span className="text-[11.5px] text-charcoal/55">{note}</span>
    </button>
  )
}

/* ---------- format renderers ---------- */
function slug(name: string): string {
  return (name || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "colour"
}

function renderFormat(fmt: "css" | "tailwind" | "json" | "tokens", palette: Swatch[]): string {
  if (!palette.length) return ""
  if (fmt === "css") {
    return ":root {\n" +
      palette.map((s) => `  --${slug(s.name)}: ${s.hex.toLowerCase()};`).join("\n") +
      "\n}\n"
  }
  if (fmt === "tailwind") {
    const entries = palette.map((s) => `      "${slug(s.name)}": "${s.hex.toLowerCase()}"`).join(",\n")
    return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${entries}\n      }\n    }\n  }\n}\n`
  }
  if (fmt === "json") {
    const obj: Record<string, string> = {}
    palette.forEach((s) => { obj[slug(s.name)] = s.hex.toLowerCase() })
    return JSON.stringify(obj, null, 2) + "\n"
  }
  // Design tokens (W3C draft)
  const tokens: Record<string, { $value: string; $type: "color" }> = {}
  palette.forEach((s) => { tokens[slug(s.name)] = { $value: s.hex.toLowerCase(), $type: "color" } })
  return JSON.stringify({ color: tokens }, null, 2) + "\n"
}

function makePaletteSvg(palette: Swatch[]): string {
  const size = 120, gap = 12
  const w = palette.length * size + gap * (palette.length + 1)
  const h = size + gap * 2 + 40
  const swatches = palette.map((s, i) => {
    const x = gap + i * (size + gap)
    const { r, g, b } = hexToRgb(s.hex)
    const bright = (r + g + b) / 3 > 160
    const text = bright ? "#0E1821" : "#FFFFFF"
    return `
    <g>
      <rect x="${x}" y="${gap}" width="${size}" height="${size}" rx="14" fill="${s.hex}" />
      <text x="${x + 10}" y="${gap + 22}" font-family="Inter, system-ui" font-size="10" font-weight="700" fill="${text}">${s.name}</text>
      <text x="${x + 10}" y="${gap + size - 10}" font-family="ui-monospace, Menlo, monospace" font-size="11" font-weight="700" fill="${text}">${s.hex}</text>
    </g>`
  }).join("")
  return `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#F8F8F6" />
  ${swatches}
  <text x="${gap}" y="${h - 12}" font-family="Inter, system-ui" font-size="11" fill="#7A818B">Made with Pallet Preview</text>
</svg>`
}
