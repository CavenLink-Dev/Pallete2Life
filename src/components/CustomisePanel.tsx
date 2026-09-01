import type React from "react"
import { ELEMENT_DEFAULTS, TOKEN_OPTIONS, type ElementTokenValues, type InspectorKind, type InspectorSelection } from "../lib/designTokens"

type Props = {
  onClose: () => void
  className?: string
  selectedElement: InspectorSelection | null
  elementValues: ElementTokenValues | null
  onElementChange: (key: string, value: string | boolean) => void
  onClearSelection: () => void
  roleOptions: string[]
  templateSection?: React.ReactNode
}

export default function CustomisePanel({ onClose, className = "", selectedElement, elementValues, onElementChange, onClearSelection, roleOptions, templateSection }: Props) {
  const values = selectedElement ? { ...ELEMENT_DEFAULTS[selectedElement.kind], ...elementValues } : null

  return (
    <aside className={`flex min-h-0 flex-col bg-white ${className}`} aria-label="Customise panel">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-softgrey px-3">
        <h2 className="text-[13px] font-bold">Customise</h2>
        <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-[7px] text-charcoal/55 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta" aria-label="Collapse customise panel" title="Collapse customise panel">
          <CollapseIcon />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
        <div className="flex flex-col gap-3">
          {selectedElement && values ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-charcoal/50">{capitalize(selectedElement.kind)}</p>
                  <p className="truncate text-[13px] font-semibold">{selectedElement.label}</p>
                </div>
                <button type="button" onClick={onClearSelection} className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] text-charcoal/50 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta" aria-label="Clear selection" title="Clear selection">
                  <CloseIcon />
                </button>
              </div>

              {(selectedElement.kind === "text" || selectedElement.kind === "button") && (
                <Section title="Typography" defaultOpen>
                  <CompactSelect label="Font" value={String(values.fontFamily ?? "font.system")} options={TOKEN_OPTIONS.fontFamily} onChange={(v) => onElementChange("fontFamily", v)} />
                  <div className="grid grid-cols-2 gap-2">
                    <CompactSelect label="Size" value={String(values.fontSize ?? "font.md")} options={TOKEN_OPTIONS.fontSize} onChange={(v) => onElementChange("fontSize", v)} />
                    <CompactSelect label="Weight" value={String(values.fontWeight ?? "weight.regular")} options={TOKEN_OPTIONS.fontWeight} onChange={(v) => onElementChange("fontWeight", v)} />
                  </div>
                  <div className="flex gap-1">
                    <ToggleBtn active={Boolean(values.fontWeight === "weight.bold")} label="Bold" onClick={() => onElementChange("fontWeight", values.fontWeight === "weight.bold" ? "weight.regular" : "weight.bold")}>B</ToggleBtn>
                    <ToggleBtn active={Boolean(values.italic)} label="Italic" onClick={() => onElementChange("italic", !values.italic)}><em>I</em></ToggleBtn>
                    <ToggleBtn active={Boolean(values.underline)} label="Underline" onClick={() => onElementChange("underline", !values.underline)}><u>U</u></ToggleBtn>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <CompactSelect label="Line height" value={String(values.lineHeight ?? "leading.normal")} options={TOKEN_OPTIONS.lineHeight} onChange={(v) => onElementChange("lineHeight", v)} />
                    <CompactSelect label="Spacing" value={String(values.letterSpacing ?? "tracking.normal")} options={TOKEN_OPTIONS.letterSpacing} onChange={(v) => onElementChange("letterSpacing", v)} />
                  </div>
                  {selectedElement.kind === "text" && (
                    <div className="grid grid-cols-2 gap-2">
                      <CompactSelect label="Align" value={String(values.textAlign ?? "align.left")} options={TOKEN_OPTIONS.textAlign} onChange={(v) => onElementChange("textAlign", v)} />
                      <CompactSelect label="Colour" value={String(values.textColour ?? "Heading Text")} options={roleOptions} onChange={(v) => onElementChange("textColour", v)} />
                    </div>
                  )}
                </Section>
              )}

              {selectedElement.kind === "button" && (
                <Section title="Button" defaultOpen>
                  <CompactSelect label="Preset" value={String(values.buttonType ?? "solid")} options={TOKEN_OPTIONS.buttonPreset} onChange={(v) => onElementChange("buttonType", v)} />
                  <CompactInput label="Text" value={String(values.text ?? "")} onChange={(v) => onElementChange("text", v)} />
                  <div className="grid grid-cols-2 gap-2">
                    <CompactSelect label="Size" value={String(values.size ?? "size.md")} options={TOKEN_OPTIONS.size} onChange={(v) => onElementChange("size", v)} />
                    <CompactSelect label="Radius" value={String(values.radius ?? "radius.md")} options={TOKEN_OPTIONS.radius} onChange={(v) => onElementChange("radius", v)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <CompactSelect label="Fill role" value={String(values.colourRole ?? "Brand Primary")} options={roleOptions} onChange={(v) => onElementChange("colourRole", v)} />
                    <CompactSelect label="Border" value={String(values.border ?? "border.none")} options={TOKEN_OPTIONS.border} onChange={(v) => onElementChange("border", v)} />
                  </div>
                </Section>
              )}

              {selectedElement.kind === "card" && (
                <Section title="Component" defaultOpen>
                  <CompactSelect label="Background" value={String(values.background ?? "Secondary Background")} options={["Page Background", "Secondary Background", "Brand Primary"]} onChange={(v) => onElementChange("background", v)} />
                  <div className="grid grid-cols-2 gap-2">
                    <CompactSelect label="Radius" value={String(values.radius ?? "radius.lg")} options={TOKEN_OPTIONS.radius} onChange={(v) => onElementChange("radius", v)} />
                    <CompactSelect label="Shadow" value={String(values.shadow ?? "shadow.sm")} options={TOKEN_OPTIONS.shadow} onChange={(v) => onElementChange("shadow", v)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <CompactSelect label="Border" value={String(values.border ?? "border.subtle")} options={TOKEN_OPTIONS.border} onChange={(v) => onElementChange("border", v)} />
                    <CompactSelect label="Padding" value={String(values.padding ?? "space.4")} options={TOKEN_OPTIONS.padding} onChange={(v) => onElementChange("padding", v)} />
                  </div>
                </Section>
              )}

              {selectedElement.kind === "navigation" && (
                <Section title="Component" defaultOpen>
                  <CompactInput label="Label" value={String(values.label ?? "")} onChange={(v) => onElementChange("label", v)} />
                  <CompactSelect label="Colour" value={String(values.colourRole ?? "Body Text")} options={roleOptions} onChange={(v) => onElementChange("colourRole", v)} />
                  <label className="flex items-center justify-between gap-2 rounded-[6px] border border-softgrey px-2.5 py-1.5">
                    <span className="text-[11px] font-semibold text-charcoal/65">Active</span>
                    <input type="checkbox" checked={Boolean(values.active)} onChange={(e) => onElementChange("active", e.target.checked)} className="h-4 w-4 accent-brand" />
                  </label>
                </Section>
              )}
            </>
          ) : (
            <p className="py-6 text-center text-[12px] leading-5 text-charcoal/50">Click an element in the preview to customise it.</p>
          )}

          {templateSection && <Section title="Template / Style">{templateSection}</Section>}
        </div>
      </div>
    </aside>
  )
}

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details className="group rounded-[7px] border border-softgrey" open={defaultOpen || undefined}>
      <summary className="flex h-9 cursor-pointer list-none items-center justify-between rounded-[7px] px-2.5 text-[11px] font-bold uppercase text-charcoal/55 hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">
        {title}
        <ChevronIcon />
      </summary>
      <div className="grid gap-2 border-t border-softgrey p-2.5">{children}</div>
    </details>
  )
}

function CompactSelect({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-0.5">
      <span className="text-[10px] font-semibold text-charcoal/50">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 rounded-[6px] border border-softgrey bg-offwhite px-2 text-[11px] font-semibold text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">
        {options.map((o) => <option key={o} value={o}>{humanize(o)}</option>)}
      </select>
    </label>
  )
}

function CompactInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-0.5">
      <span className="text-[10px] font-semibold text-charcoal/50">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-8 rounded-[6px] border border-softgrey bg-offwhite px-2 text-[11px] text-charcoal outline-none focus-visible:ring-2 focus-visible:ring-brand-cta" />
    </label>
  )
}

function ToggleBtn({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} aria-label={label} title={label} className={`grid h-11 w-11 place-items-center rounded-[6px] border text-[12px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta ${active ? "border-brand-cta bg-brand-cta/10 text-brand-ink" : "border-softgrey text-charcoal/55 hover:bg-offwhite hover:text-charcoal"}`}>
      {children}
    </button>
  )
}

const humanize = (v: string) => v.split(".").pop()?.replace(/(^|\s)\S/g, (l) => l.toUpperCase()) ?? v
const capitalize = (v: string) => v.charAt(0).toUpperCase() + v.slice(1)

const CollapseIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /><path d="M20 4v16" /></svg>
const CloseIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
const ChevronIcon = () => <svg className="transition-transform group-open:rotate-180" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
