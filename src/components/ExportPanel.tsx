import { useEffect, useMemo, useRef, useState } from "react"
import { deriveTheme, hexToRgb, hslString, readableOn, rgbString, type Swatch } from "../lib/color"
import { createTokenSystem, tokenSystemExport, type DesignTokenSystem } from "../lib/tokenSystem"
import { ACCESSIBILITY_STATUS_LABEL, worstAccessibilityStatus, type AccessibilityCheck } from "../lib/accessibility"
import { useDialogFocus } from "../lib/useDialogFocus"

type ExportSection = "palette" | "code" | "visual" | "project"
type CodeFormat = "css" | "json" | "tokens" | "tailwind"

export type ProjectExportData = {
  name?: string
  templateId?: string
  componentIds?: string[]
  colourWayChosen?: boolean
  brand?: unknown
  roleBindings?: Record<string, string>
  elementOverrides?: Record<string, Record<string, string | boolean>>
}

export type ImportedProject = {
  palette: Swatch[]
  tokenSystem?: DesignTokenSystem
  project?: ProjectExportData
}

type Props = {
  open: boolean
  onClose: () => void
  palette: Swatch[]
  tokenSystem?: DesignTokenSystem
  project?: ProjectExportData
  accessibilityChecks?: AccessibilityCheck[]
  onImportProject?: (project: ImportedProject) => void
  onToast: (msg: string, kind?: "info" | "success" | "error") => void
  locked?: boolean
}

const SECTIONS: { key: ExportSection; label: string; note: string }[] = [
  { key: "palette", label: "Palette", note: "Colour values" },
  { key: "code", label: "Code", note: "Developer formats" },
  { key: "visual", label: "Visual", note: "Images and SVG" },
  { key: "project", label: "Project", note: "Save and reopen" },
]

export default function ExportPanel({ open, onClose, palette, tokenSystem, project, accessibilityChecks = [], onImportProject, onToast, locked = false }: Props) {
  const [section, setSection] = useState<ExportSection>("palette")
  const [format, setFormat] = useState<CodeFormat>(tokenSystem ? "tokens" : "css")
  const importRef = useRef<HTMLInputElement | null>(null)
  const dialogRef = useDialogFocus<HTMLDivElement>(open)
  const system = useMemo(() => tokenSystem ?? createTokenSystem(palette), [palette, tokenSystem])
  const formatted = useMemo(() => renderCode(format, palette, system, !!tokenSystem), [format, palette, system, tokenSystem])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, open])

  if (!open) return null

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      onToast(`${label} copied`, "success")
    } catch {
      onToast("Your browser blocked clipboard access", "error")
    }
  }

  const downloadText = (name: string, mime: string, content: string) => downloadBlob(name, new Blob([content], { type: mime }), onToast)
  const projectFile = JSON.stringify({
    format: "palette-preview-project",
    version: 2,
    savedAt: new Date().toISOString(),
    palette,
    tokenSystem: tokenSystem ?? undefined,
    project,
  }, null, 2)

  const importProject = async (file?: File) => {
    if (!file || !onImportProject) return
    try {
      const parsed = JSON.parse(await file.text()) as ImportedProject
      if (!Array.isArray(parsed.palette) || !parsed.palette.length) throw new Error("Palette missing")
      const valid = parsed.palette.every((item) => item && typeof item.id === "string" && typeof item.name === "string" && /^#[0-9a-f]{6}$/i.test(item.hex))
      if (!valid) throw new Error("Palette invalid")
      onImportProject({ palette: parsed.palette, tokenSystem: parsed.tokenSystem, project: parsed.project })
      onToast("Project reopened", "success")
      onClose()
    } catch {
      onToast("This does not look like a HueSet project file", "error")
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal/45 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={onClose} role="dialog" aria-modal="true" aria-labelledby="export-title">
      <div ref={dialogRef} className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[8px] border border-softgrey bg-white shadow-[0_30px_80px_-28px_rgba(14,24,33,0.55)]" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b border-softgrey px-5 py-4">
          <div><p className="text-[10px] font-bold uppercase text-charcoal/45">Export stage</p><h2 id="export-title" className="text-[20px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{tokenSystem ? "Export design system" : "Export palette"}</h2><p className="mt-1 text-[12px] text-charcoal/55">Choose only the format you need.</p></div>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-[8px] border border-softgrey text-charcoal/55 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2" aria-label="Close export" title="Close"><CloseIcon /></button>
        </header>

        <nav className="grid shrink-0 grid-cols-4 border-b border-softgrey" aria-label="Export sections">
          {SECTIONS.map((item) => <button key={item.key} type="button" onClick={() => setSection(item.key)} className={`min-h-11 min-w-0 border-r border-softgrey px-2 py-3 text-left last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset sm:px-4 ${section === item.key ? "bg-[#eef8fc] text-brand-dark" : "text-charcoal/55 hover:bg-offwhite hover:text-charcoal"}`} aria-current={section === item.key ? "page" : undefined}><span className="block truncate text-[12px] font-bold">{item.label}</span><span className="hidden truncate text-[10px] opacity-65 sm:block">{item.note}</span></button>)}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {section === "palette" && <PaletteExport palette={palette} onCopy={copy} onText={() => downloadText("palette-preview-colours.txt", "text/plain", paletteText(palette))} />}
          {section === "code" && (locked ? <LockedSection label="Code export" /> : <CodeExport format={format} formatted={formatted} hasSystem={!!tokenSystem} onFormat={setFormat} onCopy={() => copy(formatted, codeLabel(format))} onDownload={() => downloadText(codeFilename(format), format === "json" || format === "tokens" ? "application/json" : "text/plain", formatted)} />)}
          {section === "visual" && <VisualExport palette={palette} onSvg={() => downloadText("palette-preview.svg", "image/svg+xml", makePaletteSvg(palette))} onRaster={(type) => downloadRaster(palette, type, onToast)} />}
          {section === "project" && (locked ? <LockedSection label="Project export" /> : <ProjectExport hasSystem={!!tokenSystem} accessibilityChecks={accessibilityChecks} onSave={() => downloadText("palette-preview-project.json", "application/json", projectFile)} canImport={!!onImportProject} onImport={() => importRef.current?.click()} />)}
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-softgrey bg-[#fafafa] px-5 py-3">
          <div><p className="text-[11px] font-bold text-charcoal/55">Figma export</p><p className="text-[10px] text-charcoal/40">Future feature</p></div>
          <span className="rounded-[5px] border border-dashed border-softgrey px-2 py-1 text-[10px] font-semibold text-charcoal/40">Not connected</span>
        </footer>
        <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { void importProject(event.target.files?.[0]); event.currentTarget.value = "" }} />
      </div>
    </div>
  )
}

function PaletteExport({ palette, onCopy, onText }: { palette: Swatch[]; onCopy: (value: string, label: string) => void; onText: () => void }) {
  const formats = [
    ["HEX", palette.map((swatch) => `${swatch.name}: ${swatch.hex.toUpperCase()}`).join("\n")],
    ["RGB", palette.map((swatch) => `${swatch.name}: rgb(${rgbString(swatch.hex)})`).join("\n")],
    ["HSL", palette.map((swatch) => `${swatch.name}: hsl(${hslString(swatch.hex)})`).join("\n")],
  ] as const
  return <Section title="Palette export" description="Copy colour values or download one readable text file."><div className="grid gap-3 sm:grid-cols-3">{formats.map(([label, value]) => <ExportCard key={label} title={label} note={value.split("\n")[0]} action="Copy" onClick={() => onCopy(value, `${label} palette`)} icon={<CopyIcon />} />)}</div><button type="button" onClick={onText} className="mt-3 flex min-h-11 w-full items-center justify-between rounded-[7px] border border-softgrey px-4 py-3 text-left hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"><span><span className="block text-[13px] font-bold">Palette text file</span><span className="text-[11px] text-charcoal/45">HEX, RGB and HSL together</span></span><DownloadIcon /></button></Section>
}

function CodeExport({ format, formatted, hasSystem, onFormat, onCopy, onDownload }: { format: CodeFormat; formatted: string; hasSystem: boolean; onFormat: (format: CodeFormat) => void; onCopy: () => void; onDownload: () => void }) {
  const options: [CodeFormat, string][] = [["css", "CSS variables"], ["json", "JSON"], ["tokens", hasSystem ? "Design tokens" : "Palette tokens"], ["tailwind", "Tailwind config"]]
  return <Section title="Code export" description={hasSystem ? "These files include your layered semantic and component decisions." : "These files contain your palette values in code-friendly formats."}><div className="flex flex-wrap gap-1.5">{options.map(([key, label]) => <button key={key} type="button" onClick={() => onFormat(key)} className={`min-h-11 rounded-[6px] border px-3 py-2 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${format === key ? "border-charcoal bg-charcoal text-white" : "border-softgrey text-charcoal/60 hover:text-charcoal"}`}>{label}</button>)}</div><div className="relative mt-3"><pre className="max-h-72 overflow-auto rounded-[7px] border border-softgrey bg-offwhite p-4 pr-20 text-[11px] leading-5" style={{ fontFamily: "var(--font-mono)" }}>{formatted}</pre><button type="button" onClick={onCopy} className="absolute right-2 top-2 min-h-11 rounded-[6px] border border-softgrey bg-white px-3 text-[10px] font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Copy</button></div><button type="button" onClick={onDownload} className="mt-3 inline-flex h-11 items-center gap-2 rounded-[7px] border border-softgrey px-3 text-[12px] font-semibold hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"><DownloadIcon />Download file</button></Section>
}

function VisualExport({ palette, onSvg, onRaster }: { palette: Swatch[]; onSvg: () => void; onRaster: (type: "png" | "jpeg") => void }) {
  return <Section title="Visual export" description="Download a clean swatch sheet for presentations, handoff, or reference."><div className="grid gap-3 sm:grid-cols-3"><ExportCard title="PNG" note="Crisp image" action="Download" onClick={() => onRaster("png")} icon={<ImageIcon />} /><ExportCard title="JPEG" note="Lightweight image" action="Download" onClick={() => onRaster("jpeg")} icon={<ImageIcon />} /><ExportCard title="SVG" note="Editable vector sheet" action="Download" onClick={onSvg} icon={<CodeIcon />} /></div><div className="mt-4 flex h-20 overflow-hidden rounded-[7px] border border-softgrey">{palette.map((swatch) => <span key={swatch.id} className="flex-1" style={{ background: swatch.hex }} title={`${swatch.name} ${swatch.hex}`} />)}</div></Section>
}

function ProjectExport({ hasSystem, accessibilityChecks, onSave, canImport, onImport }: { hasSystem: boolean; accessibilityChecks: AccessibilityCheck[]; onSave: () => void; canImport: boolean; onImport: () => void }) {
  const status = accessibilityChecks.length ? worstAccessibilityStatus(accessibilityChecks) : null
  return <Section title="Project export" description="Keep a reopenable copy of your work, including palette, tokens, template and component choices."><div className="rounded-[7px] border border-softgrey bg-offwhite p-4"><p className="text-[13px] font-bold">Project contents</p><ul className="mt-2 grid gap-1 text-[11.5px] text-charcoal/60"><li>Palette colours and locks</li><li>{hasSystem ? "Layered design tokens and component rules" : "Palette-only project settings"}</li><li>Template, brand and inspector decisions when available</li>{status && <li>Accessibility summary: {status === "good" ? ACCESSIBILITY_STATUS_LABEL.good : ACCESSIBILITY_STATUS_LABEL.review}</li>}</ul></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={onSave} className="inline-flex h-11 items-center gap-2 rounded-[7px] bg-charcoal px-4 text-[12px] font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"><DownloadIcon />Save project file</button>{canImport && <button type="button" onClick={onImport} className="inline-flex h-11 items-center gap-2 rounded-[7px] border border-softgrey px-4 text-[12px] font-bold text-charcoal hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"><UploadIcon />Reopen project</button>}</div></Section>
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section><h3 className="text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h3><p className="mt-1 text-[12px] leading-5 text-charcoal/50">{description}</p><div className="mt-5">{children}</div></section>
}

function LockedSection({ label }: { label: string }) {
  return <div className="flex flex-col items-center justify-center gap-3 py-14 text-center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A818B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg><p className="text-[14px] font-bold text-charcoal/70">{label} requires Pro</p><p className="max-w-xs text-[12px] leading-relaxed text-charcoal/50">Upgrade to HueSet Pro to export CSS variables, JSON, design tokens, typography, and save projects.</p></div>
}

function ExportCard({ title, note, action, onClick, icon }: { title: string; note: string; action: string; onClick: () => void; icon: React.ReactNode }) {
  return <button type="button" onClick={onClick} className="flex min-h-28 flex-col rounded-[7px] border border-softgrey p-3 text-left hover:border-charcoal/25 hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><span className="text-charcoal/55">{icon}</span><span className="mt-3 text-[13px] font-bold">{title}</span><span className="mt-0.5 truncate text-[10.5px] text-charcoal/45">{note}</span><span className="mt-auto pt-3 text-[11px] font-bold text-brand-dark">{action}</span></button>
}

function renderCode(format: CodeFormat, palette: Swatch[], system: DesignTokenSystem, hasSystem: boolean): string {
  const theme = deriveTheme(palette)
  const paletteValues = Object.fromEntries(palette.map((swatch) => [slug(swatch.name), swatch.hex.toLowerCase()]))
  if (format === "tokens") {
    if (!hasSystem) return JSON.stringify({ colour: Object.fromEntries(palette.map((swatch) => [slug(swatch.name), { $value: swatch.hex.toLowerCase(), $type: "color" }])) }, null, 2) + "\n"
    return JSON.stringify(tokenSystemExport(system, palette, theme), null, 2) + "\n"
  }
  if (format === "json") return JSON.stringify(hasSystem ? { palette: paletteValues, semantic: tokenSystemExport(system, palette, theme).semantic } : paletteValues, null, 2) + "\n"
  if (format === "tailwind") {
    const colours = palette.map((swatch) => `        "${slug(swatch.name)}": "${swatch.hex.toLowerCase()}"`).join(",\n")
    const spacing = Object.entries(system.primitive.spacing).map(([key, value]) => `        "${key.split(".").pop()}": "${value}px"`).join(",\n")
    return hasSystem
      ? `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colours}\n      },\n      spacing: {\n${spacing}\n      }\n    }\n  }\n}\n`
      : `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colours}\n      }\n    }\n  }\n}\n`
  }
  const paletteVariables = palette.map((swatch, index) => `  --colour-palette-${index + 1}: ${swatch.hex.toLowerCase()};`).join("\n")
  if (!hasSystem) return `:root {\n${paletteVariables}\n}\n`
  const semantic = tokenSystemExport(system, palette, theme).semantic.colour as Record<string, { $value: string }>
  const semanticVariables = Object.entries(semantic).map(([key, value]) => `  --colour-${kebab(key)}: ${value.$value};`).join("\n")
  const spacing = Object.entries(system.primitive.spacing).map(([key, value]) => `  --${key.replace(".", "-")}: ${value}px;`).join("\n")
  return `:root {\n${paletteVariables}\n\n${semanticVariables}\n\n${spacing}\n}\n`
}

function paletteText(palette: Swatch[]) {
  return `Name\tHEX\tRGB\tHSL\n${palette.map((swatch) => `${swatch.name}\t${swatch.hex.toUpperCase()}\trgb(${rgbString(swatch.hex)})\thsl(${hslString(swatch.hex)})`).join("\n")}\n`
}

function downloadRaster(palette: Swatch[], type: "png" | "jpeg", onToast: Props["onToast"]) {
  const canvas = document.createElement("canvas")
  canvas.width = 1400
  canvas.height = 420
  const context = canvas.getContext("2d")
  if (!context) { onToast("This browser could not create the image", "error"); return }
  context.fillStyle = type === "jpeg" ? "#F8F8F6" : "rgba(0,0,0,0)"
  context.fillRect(0, 0, canvas.width, canvas.height)
  const margin = 40
  const width = (canvas.width - margin * 2) / Math.max(1, palette.length)
  palette.forEach((swatch, index) => {
    const x = margin + index * width
    context.fillStyle = swatch.hex
    context.fillRect(x, 50, width, 270)
    context.fillStyle = readableOn(swatch.hex)
    context.font = "700 20px Inter, Arial, sans-serif"
    context.fillText(swatch.name.slice(0, 14), x + 18, 88, width - 36)
    context.font = "700 18px Menlo, monospace"
    context.fillText(swatch.hex.toUpperCase(), x + 18, 290, width - 36)
  })
  context.fillStyle = "#7A818B"
  context.font = "500 16px Inter, Arial, sans-serif"
  context.fillText("Made with HueSet", margin, 370)
  canvas.toBlob((blob) => { if (blob) downloadBlob(`palette-preview.${type === "jpeg" ? "jpg" : "png"}`, blob, onToast) }, type === "jpeg" ? "image/jpeg" : "image/png", 0.92)
}

function makePaletteSvg(palette: Swatch[]): string {
  const width = 1400
  const margin = 40
  const swatchWidth = (width - margin * 2) / Math.max(1, palette.length)
  const swatches = palette.map((swatch, index) => {
    const x = margin + index * swatchWidth
    const { r, g, b } = hexToRgb(swatch.hex)
    const text = (r + g + b) / 3 > 160 ? "#0E1821" : "#FFFFFF"
    return `<g><rect x="${x}" y="50" width="${swatchWidth}" height="270" fill="${swatch.hex}"/><text x="${x + 18}" y="88" font-family="Inter,Arial,sans-serif" font-size="20" font-weight="700" fill="${text}">${escapeXml(swatch.name)}</text><text x="${x + 18}" y="290" font-family="Menlo,monospace" font-size="18" font-weight="700" fill="${text}">${swatch.hex.toUpperCase()}</text></g>`
  }).join("")
  return `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="1400" height="420" viewBox="0 0 1400 420"><rect width="1400" height="420" fill="#F8F8F6"/>${swatches}<text x="40" y="370" font-family="Inter,Arial,sans-serif" font-size="16" fill="#7A818B">Made with HueSet</text></svg>`
}

function downloadBlob(name: string, blob: Blob, onToast: Props["onToast"]) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
  onToast(`Saved ${name}`, "success")
}

const codeLabel = (format: CodeFormat) => format === "css" ? "CSS variables" : format === "tailwind" ? "Tailwind config" : format === "tokens" ? "Design tokens" : "JSON"
const codeFilename = (format: CodeFormat) => format === "css" ? "palette-preview.css" : format === "tailwind" ? "tailwind.config.js" : format === "tokens" ? "design-tokens.json" : "palette-preview.json"
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "colour"
const kebab = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
const escapeXml = (value: string) => value.replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character] ?? character)

const CloseIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
const CopyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" /></svg>
const DownloadIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3v13M7 12l5 5 5-5M5 21h14" /></svg>
const UploadIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21V8M7 12l5-5 5 5M5 3h14" /></svg>
const ImageIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
const CodeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></svg>
