import { useEffect, useState } from "react"
import type { Swatch, Theme } from "../lib/color"
import {
  SEMANTIC_COLOUR_META,
  semanticColour,
  type DesignTokenSystem,
  type SemanticColourKey,
} from "../lib/tokenSystem"
import { useDialogFocus } from "../lib/useDialogFocus"

type Layer = "Core" | "Roles" | "Components" | "States" | "Export"

type Props = {
  open: boolean
  system: DesignTokenSystem
  palette: Swatch[]
  theme: Theme
  onChange: (system: DesignTokenSystem) => void
  onClose: () => void
}

const LAYERS: { key: Layer; label: string; note: string }[] = [
  { key: "Core", label: "Core values", note: "Reusable sizes and styles" },
  { key: "Roles", label: "Colour roles", note: "Meaning applied to colours" },
  { key: "Components", label: "Components", note: "Shared component rules" },
  { key: "States", label: "Interactions", note: "Focus, motion and disabled states" },
  { key: "Export", label: "Export", note: "Take the system with you" },
]

export default function TokenSystemPanel({ open, system, palette, theme, onChange, onClose }: Props) {
  const [layer, setLayer] = useState<Layer>("Core")
  const dialogRef = useDialogFocus<HTMLDivElement>(open)

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [onClose, open])

  if (!open) return null

  const updatePrimitive = (group: keyof DesignTokenSystem["primitive"], key: string, value: number | string) => {
    onChange({ ...system, primitive: { ...system.primitive, [group]: { ...system.primitive[group], [key]: value } } })
  }
  const updateSemanticColour = (key: SemanticColourKey, swatchId: string) => {
    onChange({ ...system, semantic: { ...system.semantic, colours: { ...system.semantic.colours, [key]: swatchId } } })
  }
  const updateButton = (key: keyof DesignTokenSystem["component"]["buttonMain"], value: string) => {
    onChange({ ...system, component: { ...system.component, buttonMain: { ...system.component.buttonMain, [key]: value } } })
  }
  const updateCard = (key: keyof DesignTokenSystem["component"]["cardDefault"], value: string) => {
    onChange({ ...system, component: { ...system.component, cardDefault: { ...system.component.cardDefault, [key]: value } } })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/45 p-3 backdrop-blur-[2px] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="token-system-title" onMouseDown={onClose}>
      <div ref={dialogRef} className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[8px] border border-softgrey bg-white shadow-[0_30px_80px_-28px_rgba(14,24,33,0.55)]" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b border-softgrey px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase text-charcoal/45">Design system</p>
            <h2 id="token-system-title" className="text-[20px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Token system</h2>
            <p className="mt-1 text-[12px] text-charcoal/55">Start with understandable choices. Palette Preview keeps the technical token names underneath.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-softgrey text-charcoal/55 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2" aria-label="Close token system" title="Close"><CloseIcon /></button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <nav className="flex shrink-0 overflow-x-auto border-b border-softgrey bg-[#fafafa] p-2 md:w-[210px] md:flex-col md:border-b-0 md:border-r" aria-label="Token layers">
            {LAYERS.map((item, index) => (
              <button key={item.key} type="button" onClick={() => setLayer(item.key)} className={`min-h-11 min-w-[150px] rounded-[7px] px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset md:min-w-0 ${layer === item.key ? "bg-white text-charcoal shadow-sm ring-1 ring-softgrey" : "text-charcoal/55 hover:bg-white/70 hover:text-charcoal"}`} aria-current={layer === item.key ? "step" : undefined}>
                <span className="flex items-center gap-2 text-[12px] font-bold"><span className="grid h-5 w-5 place-items-center rounded-full bg-charcoal text-[10px] text-white">{index + 1}</span>{item.label}</span>
                <span className="mt-1 hidden pl-7 text-[10.5px] leading-4 text-charcoal/45 md:block">{item.note}</span>
              </button>
            ))}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {layer === "Core" && (
              <LayerSection title="Core values" description="These scales keep spacing, type, radius and controls consistent without showing every token at once.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberControl label="Regular spacing" note="spacing.4" value={system.primitive.spacing["spacing.4"]} min={8} max={32} suffix="px" onChange={(value) => updatePrimitive("spacing", "spacing.4", value)} />
                  <NumberControl label="Medium radius" note="radius.md" value={system.primitive.radius["radius.md"]} min={0} max={24} suffix="px" onChange={(value) => updatePrimitive("radius", "radius.md", value)} />
                  <NumberControl label="Body text size" note="font.size.md" value={system.primitive.fontSize["font.size.md"]} min={12} max={20} suffix="px" onChange={(value) => updatePrimitive("fontSize", "font.size.md", value)} />
                  <NumberControl label="Main control height" note="size.control.md" value={system.primitive.sizing["size.control.md"]} min={36} max={60} suffix="px" onChange={(value) => updatePrimitive("sizing", "size.control.md", value)} />
                  <NumberControl label="Standard icon size" note="size.icon.md" value={system.primitive.iconSize["size.icon.md"]} min={12} max={32} suffix="px" onChange={(value) => updatePrimitive("iconSize", "size.icon.md", value)} />
                  <SelectControl label="Default shadow" note="shadow.sm" value={system.primitive.shadows["shadow.sm"]} options={[
                    ["none", "None"],
                    ["0 4px 12px rgba(14,24,33,0.08)", "Soft"],
                    ["0 10px 28px rgba(14,24,33,0.12)", "Medium"],
                    ["0 18px 44px rgba(14,24,33,0.16)", "Strong"],
                  ]} onChange={(value) => updatePrimitive("shadows", "shadow.sm", value)} />
                </div>
                <TokenCoverage />
              </LayerSection>
            )}

            {layer === "Roles" && (
              <LayerSection title="Colour roles" description="Give palette colours a job. Every preview and matching component updates when a role changes.">
                <div className="grid gap-2 sm:grid-cols-2">
                  {SEMANTIC_COLOUR_META.map((item) => (
                    <label key={item.key} className="flex items-center gap-3 rounded-[7px] border border-softgrey px-3 py-2.5">
                      <span className="h-7 w-7 shrink-0 rounded-[5px] border border-black/10" style={{ background: semanticColour(system, palette, item.key, theme.accent) }} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-charcoal">{item.label}</span>
                        <span className="block truncate text-[10px] text-charcoal/60">{item.internal}</span>
                      </span>
                      <select value={system.semantic.colours[item.key]} onChange={(event) => updateSemanticColour(item.key, event.target.value)} className="max-w-[130px] bg-transparent text-right text-[11px] font-semibold text-charcoal/65 outline-none" aria-label={`${item.label} palette colour`}>
                        {palette.map((swatch) => <option key={swatch.id} value={swatch.id}>{swatch.name}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              </LayerSection>
            )}

            {layer === "Components" && (
              <LayerSection title="Reusable component rules" description="Every component with the same tag inherits these values. Individual overrides remain available in the inspector.">
                <ComponentGroup title="Button Main" internal="component.button.main">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectControl label="Radius" value={system.component.buttonMain.radius} options={tokenOptions(system.primitive.radius)} onChange={(value) => updateButton("radius", value)} />
                    <SelectControl label="Height" value={system.component.buttonMain.height} options={tokenOptions(system.primitive.sizing, "size.control.")} onChange={(value) => updateButton("height", value)} />
                    <SelectControl label="Horizontal padding" value={system.component.buttonMain.paddingInline} options={tokenOptions(system.primitive.spacing)} onChange={(value) => updateButton("paddingInline", value)} />
                    <SelectControl label="Content gap" value={system.component.buttonMain.gap} options={tokenOptions(system.primitive.gaps)} onChange={(value) => updateButton("gap", value)} />
                    <SemanticSelect label="Background" value={system.component.buttonMain.background} onChange={(value) => updateButton("background", value)} />
                    <SelectControl label="Text" value={system.component.buttonMain.text} options={[["textInverse", "Inverse text"], ...SEMANTIC_COLOUR_META.map((item) => [item.key, item.label])]} onChange={(value) => updateButton("text", value)} />
                  </div>
                </ComponentGroup>
                <ComponentGroup title="Card Default" internal="component.card.default">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SemanticSelect label="Background" value={system.component.cardDefault.background} onChange={(value) => updateCard("background", value)} />
                    <SelectControl label="Radius" value={system.component.cardDefault.radius} options={tokenOptions(system.primitive.radius)} onChange={(value) => updateCard("radius", value)} />
                    <SelectControl label="Padding" value={system.component.cardDefault.padding} options={tokenOptions(system.primitive.spacing)} onChange={(value) => updateCard("padding", value)} />
                    <SelectControl label="Shadow" value={system.component.cardDefault.shadow} options={tokenOptions(system.primitive.shadows)} onChange={(value) => updateCard("shadow", value)} />
                  </div>
                </ComponentGroup>
              </LayerSection>
            )}

            {layer === "States" && (
              <LayerSection title="Interaction rules" description="Keep focus, disabled controls and motion predictable across the design system.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberControl label="Focus ring width" note="state.focus.ring.width" value={system.state.focusRing.width} min={1} max={6} suffix="px" onChange={(value) => onChange({ ...system, state: { ...system.state, focusRing: { ...system.state.focusRing, width: value } } })} />
                  <SemanticSelect label="Focus ring colour" value={system.state.focusRing.colour} onChange={(value) => onChange({ ...system, state: { ...system.state, focusRing: { ...system.state.focusRing, colour: value } } })} />
                  <NumberControl label="Disabled opacity" note="state.disabled.opacity" value={Math.round(system.state.disabledOpacity * 100)} min={20} max={80} suffix="%" onChange={(value) => onChange({ ...system, state: { ...system.state, disabledOpacity: value / 100 } })} />
                  <NumberControl label="Standard motion" note="motion.duration.normal" value={system.state.motionDuration.normal} min={80} max={500} step={10} suffix="ms" onChange={(value) => onChange({ ...system, state: { ...system.state, motionDuration: { ...system.state.motionDuration, normal: value } } })} />
                  <SelectControl label="Motion feel" value={system.state.motionEasing.standard} options={[
                    ["cubic-bezier(0.2, 0, 0, 1)", "Balanced"],
                    ["ease-out", "Gentle"],
                    ["ease-in-out", "Smooth"],
                    ["linear", "Direct"],
                  ]} onChange={(value) => onChange({ ...system, state: { ...system.state, motionEasing: { ...system.state.motionEasing, standard: value } } })} />
                </div>
              </LayerSection>
            )}

            {layer === "Export" && (
              <LayerSection title="Ready to use" description="Export the palette alone or the complete layered system for code and future project work.">
                <div className="border-y border-softgrey py-4">
                  {["Primitive colour and design scales", "Semantic colour and type roles", "Button Main and Card Default rules", "Focus, opacity and motion states"].map((item) => <p key={item} className="flex items-center gap-2 py-1.5 text-[13px] text-charcoal/70"><CheckIcon />{item}</p>)}
                </div>
                <p className="mt-5 rounded-[7px] border border-softgrey bg-offwhite px-4 py-3 text-[12px] leading-5 text-charcoal/60">Use Export when you are ready. Keeping export in one place prevents conflicting project files.</p>
                <div className="mt-5 rounded-[7px] border border-dashed border-softgrey bg-offwhite p-4">
                  <p className="text-[12px] font-bold text-charcoal/70">Figma integration</p>
                  <p className="mt-1 text-[11.5px] text-charcoal/45">Future feature. It is intentionally separate from the export formats that work today.</p>
                </div>
              </LayerSection>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LayerSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section><h3 className="text-[18px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h3><p className="mt-1 max-w-2xl text-[12.5px] leading-5 text-charcoal/55">{description}</p><div className="mt-5">{children}</div></section>
}

function ComponentGroup({ title, internal, children }: { title: string; internal: string; children: React.ReactNode }) {
  return <section className="mb-5 border-b border-softgrey pb-5 last:mb-0 last:border-b-0"><div className="mb-3"><h4 className="text-[14px] font-bold">{title}</h4><p className="text-[10px] text-charcoal/60">{internal}</p></div>{children}</section>
}

function NumberControl({ label, note, value, min, max, step = 1, suffix, onChange }: { label: string; note?: string; value: number; min: number; max: number; step?: number; suffix: string; onChange: (value: number) => void }) {
  return <label className="rounded-[7px] border border-softgrey p-3"><span className="flex items-center justify-between gap-3"><span><span className="block text-[12px] font-semibold">{label}</span>{note && <span className="block text-[10px] text-charcoal/40">{note}</span>}</span><span className="text-[12px] font-bold tabular-nums">{value}{suffix}</span></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-brand" /></label>
}

function SelectControl({ label, note, value, options, onChange }: { label: string; note?: string; value: string; options: (string | string[])[][] | string[][]; onChange: (value: string) => void }) {
  return <label className="grid gap-1"><span className="text-[11px] font-semibold text-charcoal/65">{label}{note && <span className="ml-1 font-normal text-charcoal/35">{note}</span>}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-[7px] border border-softgrey bg-white px-3 text-[12px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">{options.map((option) => { const pair = option as string[]; return <option key={pair[0]} value={pair[0]}>{pair[1] ?? pair[0]}</option> })}</select></label>
}

function SemanticSelect({ label, value, onChange }: { label: string; value: SemanticColourKey; onChange: (value: SemanticColourKey) => void }) {
  return <SelectControl label={label} value={value} options={SEMANTIC_COLOUR_META.map((item) => [item.key, item.label])} onChange={(next) => onChange(next as SemanticColourKey)} />
}

function TokenCoverage() {
  return <details className="mt-5 rounded-[7px] border border-softgrey bg-offwhite px-4 py-3"><summary className="cursor-pointer text-[12px] font-semibold text-charcoal/70">Included token groups</summary><p className="mt-2 text-[11.5px] leading-5 text-charcoal/50">Spacing, gaps, radius, typography, font size, font weight, line height, borders, shadows, opacity, sizing, icon size, focus ring, motion duration and motion easing.</p></details>
}

function tokenOptions(values: Record<string, string | number>, prefix?: string): string[][] {
  return Object.keys(values).filter((key) => !prefix || key.startsWith(prefix)).map((key) => [key, friendlyToken(key)])
}

function friendlyToken(value: string) {
  return value.split(".").slice(-1)[0].replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}

const CloseIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
const CheckIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0e8a4e" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 4 4L19 6" /></svg>
