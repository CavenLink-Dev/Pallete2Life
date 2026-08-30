import type React from "react"
import { ELEMENT_DEFAULTS, TOKEN_OPTIONS, type ElementTokenValues, type InspectorSelection } from "../lib/designTokens"
import { ACCESSIBILITY_STATUS_LABEL, accessibilityCheckLabel, worstAccessibilityStatus, type AccessibilityCheck } from "../lib/accessibility"

type PaletteOption = { id: string; name: string; hex: string }

type Props = {
  selectedElement: InspectorSelection | null
  elementValues: ElementTokenValues | null
  onElementChange: (key: string, value: string | boolean) => void
  onClearSelection: () => void
  onRandomize: () => void
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  canUndo: boolean
  canRedo: boolean
  onHelp: () => void
  onInsertBrand: () => void
  roleSource: string
  roleTargetId: string
  roleSourceOptions: string[]
  paletteOptions: PaletteOption[]
  onRoleSource: (value: string) => void
  onRoleTarget: (value: string) => void
  onRoleSet: () => void
  roleSetDisabled: boolean
  roleMessage: { text: string; tone: "success" | "error" | "neutral" } | null
  exportSummary: string[]
  accessibilityChecks: AccessibilityCheck[]
}

const UI_FONT = { fontFamily: `Geist, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` } as const
const DISPLAY_FONT = { fontFamily: `"Inter", Geist, ui-sans-serif, system-ui, sans-serif` } as const

export default function InspectorPanel(p: Props) {
  const selectedTarget = p.paletteOptions.find((option) => option.id === p.roleTargetId)
  const values = p.selectedElement ? { ...ELEMENT_DEFAULTS[p.selectedElement.kind], ...p.elementValues } : null

  return (
    <aside className="flex h-auto w-full shrink-0 flex-col border-t border-[#e5e7eb] bg-white text-[#111827] xl:h-full xl:w-[369px] xl:border-l xl:border-t-0" aria-label="Inspector panel" style={UI_FONT}>
      <div className="flex flex-col gap-4 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-[#6b7280]">Inspector</p>
            <h2 className="truncate text-[20px] font-bold text-[#31343a]" style={DISPLAY_FONT}>{p.selectedElement?.label ?? "Project settings"}</h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">{p.selectedElement ? `${capitalize(p.selectedElement.kind)} selected` : "Changes are saved automatically."}</p>
          </div>
          <div className="flex gap-1.5">
            {p.selectedElement && <IconButton label="Clear selection" onClick={p.onClearSelection}><CloseIcon /></IconButton>}
            <IconButton label="Help" onClick={p.onHelp}><HelpCircleIcon /></IconButton>
          </div>
        </div>

        <section aria-labelledby="actions-title">
          <h3 id="actions-title" className="mb-2 text-[11px] font-bold uppercase text-[#6b7280]">Actions</h3>
          <button type="button" onClick={p.onRandomize} className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#0e1821] px-4 text-[14px] font-semibold text-white shadow-sm hover:bg-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] focus-visible:ring-offset-2">
            <DiceIcon /> Randomise safely
          </button>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <ActionButton onClick={p.onUndo} disabled={!p.canUndo} icon={<UndoIcon />}>Undo</ActionButton>
            <ActionButton onClick={p.onRedo} disabled={!p.canRedo} icon={<RedoIcon />}>Redo</ActionButton>
            <ActionButton onClick={p.onReset} icon={<ResetIcon />}>Reset</ActionButton>
          </div>
        </section>

        <Divider />

        {p.selectedElement && values ? (
          <>
            <ElementControls selection={p.selectedElement} values={values} roleOptions={p.roleSourceOptions} onChange={p.onElementChange} />
            <Divider />
            <AccessibilityDisclosure checks={p.accessibilityChecks} compact />
          </>
        ) : (
          <ProjectControls {...p} selectedTarget={selectedTarget} />
        )}
      </div>
      <div className="border-t border-[#e5e7eb] px-4 py-3 text-[11px] text-[#6b7280]">Palette Preview</div>
    </aside>
  )
}

function ElementControls({ selection, values, roleOptions, onChange }: { selection: InspectorSelection; values: ElementTokenValues; roleOptions: string[]; onChange: (key: string, value: string | boolean) => void }) {
  return (
    <section aria-labelledby="element-properties-title">
      <h3 id="element-properties-title" className="mb-3 text-[11px] font-bold uppercase text-[#6b7280]">Token properties</h3>
      <div className="grid gap-3">
        {selection.kind === "button" && <>
          <SelectControl label="Button type" value={String(values.buttonType)} options={["solid", "outline", "ghost", "glass"]} onChange={(value) => onChange("buttonType", value)} />
          <TextControl label="Text" value={String(values.text)} onChange={(value) => onChange("text", value)} />
          <SelectControl label="Colour role" value={String(values.colourRole)} options={roleOptions} onChange={(value) => onChange("colourRole", value)} />
          <ControlDisclosure title="Layout and style tokens">
            <TokenControl label="Radius token" value={String(values.radius)} options={TOKEN_OPTIONS.radius} onChange={(value) => onChange("radius", value)} />
            <TokenControl label="Size token" value={String(values.size)} options={TOKEN_OPTIONS.size} onChange={(value) => onChange("size", value)} />
            <TokenControl label="Padding token" value={String(values.padding)} options={TOKEN_OPTIONS.padding} onChange={(value) => onChange("padding", value)} />
            <TokenControl label="Gap token" value={String(values.gap)} options={TOKEN_OPTIONS.gap} onChange={(value) => onChange("gap", value)} />
            <TokenControl label="Border token" value={String(values.border)} options={TOKEN_OPTIONS.border} onChange={(value) => onChange("border", value)} />
          </ControlDisclosure>
        </>}

        {selection.kind === "card" && <>
          <SelectControl label="Background token" value={String(values.background)} options={["Page Background", "Secondary Background", "Brand Primary"]} onChange={(value) => onChange("background", value)} />
          <ControlDisclosure title="Layout and style tokens">
            <TokenControl label="Border token" value={String(values.border)} options={TOKEN_OPTIONS.border} onChange={(value) => onChange("border", value)} />
            <TokenControl label="Radius token" value={String(values.radius)} options={TOKEN_OPTIONS.radius} onChange={(value) => onChange("radius", value)} />
            <TokenControl label="Shadow token" value={String(values.shadow)} options={TOKEN_OPTIONS.shadow} onChange={(value) => onChange("shadow", value)} />
            <TokenControl label="Padding token" value={String(values.padding)} options={TOKEN_OPTIONS.padding} onChange={(value) => onChange("padding", value)} />
            <TokenControl label="Gap token" value={String(values.gap)} options={TOKEN_OPTIONS.gap} onChange={(value) => onChange("gap", value)} />
          </ControlDisclosure>
        </>}

        {selection.kind === "text" && <>
          <TextControl label="Text content" value={String(values.textContent)} onChange={(value) => onChange("textContent", value)} placeholder="Use template text" />
          <SelectControl label="Text colour token" value={String(values.textColour)} options={roleOptions} onChange={(value) => onChange("textColour", value)} />
          <TokenControl label="Typography token" value={String(values.typography)} options={TOKEN_OPTIONS.typography} onChange={(value) => onChange("typography", value)} />
          <ControlDisclosure title="Type details">
            <TokenControl label="Font size token" value={String(values.fontSize)} options={TOKEN_OPTIONS.fontSize} onChange={(value) => onChange("fontSize", value)} />
            <TokenControl label="Font weight token" value={String(values.fontWeight)} options={TOKEN_OPTIONS.fontWeight} onChange={(value) => onChange("fontWeight", value)} />
            <TokenControl label="Line height token" value={String(values.lineHeight)} options={TOKEN_OPTIONS.lineHeight} onChange={(value) => onChange("lineHeight", value)} />
          </ControlDisclosure>
        </>}

        {selection.kind === "navigation" && <>
          <TextControl label="Label" value={String(values.label)} onChange={(value) => onChange("label", value)} />
          <ToggleControl label="Active state" checked={Boolean(values.active)} onChange={(value) => onChange("active", value)} />
          <SelectControl label="Colour role" value={String(values.colourRole)} options={roleOptions} onChange={(value) => onChange("colourRole", value)} />
          <ControlDisclosure title="Layout and style tokens">
            <TokenControl label="Gap token" value={String(values.gap)} options={TOKEN_OPTIONS.gap} onChange={(value) => onChange("gap", value)} />
            <TokenControl label="Padding token" value={String(values.padding)} options={TOKEN_OPTIONS.padding} onChange={(value) => onChange("padding", value)} />
            <TokenControl label="Border token" value={String(values.border)} options={TOKEN_OPTIONS.border} onChange={(value) => onChange("border", value)} />
          </ControlDisclosure>
        </>}
      </div>
    </section>
  )
}

function ProjectControls(p: Props & { selectedTarget?: PaletteOption }) {
  return <>
    <section aria-labelledby="project-tools-title">
      <h3 id="project-tools-title" className="mb-2 text-[11px] font-bold uppercase text-[#6b7280]">Project</h3>
      <ActionButton onClick={p.onInsertBrand} icon={<SparklesIcon />} strong>Brand assets</ActionButton>
    </section>
    <Divider />
    <section aria-labelledby="mapping-title">
      <h3 id="mapping-title" className="text-[11px] font-bold uppercase text-[#6b7280]">Global colour mapping</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-[#6b7280]">Connect a design role to one palette colour across every preview.</p>
      <div className="mt-3 grid gap-2">
        <SelectControl label="Design role" value={p.roleSource} options={p.roleSourceOptions} onChange={p.onRoleSource} />
        <label className="grid gap-1">
          <span className="text-[11px] font-semibold text-[#4b5563]">Palette colour</span>
          <span className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-[4px] border border-black/10" style={{ background: p.selectedTarget?.hex }} />
            <select value={p.roleTargetId} onChange={(event) => p.onRoleTarget(event.target.value)} className="h-11 w-full rounded-[7px] border border-[#d7d9dd] bg-white pl-10 pr-3 text-[13px] font-semibold text-[#374151] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] focus-visible:ring-offset-2">
              {p.paletteOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </span>
        </label>
        <button type="button" onClick={p.onRoleSet} disabled={p.roleSetDisabled} className="h-11 rounded-[7px] bg-[#111827] px-4 text-[13px] font-bold text-white hover:bg-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#e5e7eb] disabled:text-[#9ca3af]">Set mapping</button>
        {p.roleMessage && <p role="status" className={`rounded-[7px] px-3 py-2 text-[12px] leading-relaxed ${p.roleMessage.tone === "error" ? "bg-[#fef2f2] text-[#b42318]" : p.roleMessage.tone === "success" ? "bg-[#ecfdf3] text-[#067647]" : "bg-[#f3f4f6] text-[#4b5563]"}`}>{p.roleMessage.text}</p>}
      </div>
    </section>
    <Divider />
    <ControlDisclosure title="Project overview">
      <SummarySection title="Project contents" items={p.exportSummary} />
    </ControlDisclosure>
    <AccessibilityDisclosure checks={p.accessibilityChecks} />
  </>
}

function AccessibilityDisclosure({ checks, compact = false }: { checks: AccessibilityCheck[]; compact?: boolean }) {
  const status = worstAccessibilityStatus(checks)
  const count = checks.filter((check) => check.status !== "good").length
  return <ControlDisclosure title="Accessibility checks" badge={`${status === "good" ? ACCESSIBILITY_STATUS_LABEL.good : ACCESSIBILITY_STATUS_LABEL.review}${count ? ` · ${count}` : ""}`}><AccessibilitySection checks={checks} compact={compact} /></ControlDisclosure>
}

function AccessibilitySection({ checks, compact = false }: { checks: AccessibilityCheck[]; compact?: boolean }) {
  const visible = compact ? checks.filter((check) => check.id === "button" || check.id === "focus" || check.id === "touch-target") : checks
  return <ul className="grid gap-2">{visible.map((check) => <li key={check.id} className={`rounded-[7px] border px-3 py-2 ${check.status === "good" ? "border-[#b7e4ca] bg-[#ecfdf3]" : check.status === "review" ? "border-[#fed7aa] bg-[#fff7ed]" : "border-[#fecaca] bg-[#fef2f2]"}`}><div className="flex items-center justify-between gap-3"><span className="text-[12px] font-semibold text-[#374151]">{check.label}</span><span className={`text-[10px] font-bold ${check.status === "good" ? "text-[#067647]" : check.status === "review" ? "text-[#9a3412]" : "text-[#b42318]"}`}>{accessibilityCheckLabel(check)}</span></div><p className="mt-0.5 text-[10.5px] text-[#6b7280]">{check.value}{check.status !== "good" ? ` · ${check.suggestion}` : ""}</p></li>)}</ul>
}

function ControlDisclosure({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return <details className="group rounded-[7px] border border-[#e5e7eb] bg-white"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-[7px] px-3 text-[12px] font-semibold text-[#4b5563] hover:bg-[#f9fafb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] focus-visible:ring-offset-2"><span>{title}</span><span className="flex items-center gap-2">{badge && <span className="text-[10.5px] font-bold text-[#6b7280]">{badge}</span>}<ChevronIcon /></span></summary><div className="grid gap-3 border-t border-[#e5e7eb] p-3">{children}</div></details>
}

function SummarySection({ title, items }: { title: string; items: string[] }) {
  return <section><h3 className="text-[11px] font-bold uppercase text-[#6b7280]">{title}</h3><ul className="mt-2 grid gap-1.5">{items.map((item) => <li key={item} className="flex items-center gap-2 text-[12px] text-[#4b5563]"><span className="h-1.5 w-1.5 rounded-full bg-[#20b9fa]" />{item}</li>)}</ul></section>
}

function TextControl({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="grid gap-1"><span className="text-[11px] font-semibold text-[#4b5563]">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 rounded-[7px] border border-[#d7d9dd] px-3 text-[13px] text-[#374151] outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] focus-visible:ring-offset-2" /></label>
}

function SelectControl({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label className="grid gap-1"><span className="text-[11px] font-semibold text-[#4b5563]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-[7px] border border-[#d7d9dd] bg-white px-3 text-[13px] font-semibold text-[#374151] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] focus-visible:ring-offset-2">{options.map((option) => <option key={option} value={option}>{humanize(option)}</option>)}</select></label>
}

function TokenControl(props: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <SelectControl {...props} />
}

function ToggleControl({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex min-h-11 items-center justify-between rounded-[7px] border border-[#d7d9dd] px-3 py-2.5"><span className="text-[12px] font-semibold text-[#4b5563]">{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-[#20b9fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]" /></label>
}

function ActionButton({ children, icon, onClick, disabled, strong }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void; disabled?: boolean; strong?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-[7px] border px-2 text-[12px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${strong ? "w-full border-[#d7d9dd] bg-[#f3f4f6] text-[#111827] hover:bg-[#e9eaec]" : "border-[#e5e7eb] bg-white text-[#4b5563] hover:text-[#111827]"}`}>{icon}<span className="truncate">{children}</span></button>
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] focus-visible:ring-offset-2" aria-label={label} title={label}>{children}</button>
}

const Divider = () => <div className="h-px bg-[#e5e7eb]" />
const humanize = (value: string) => value.split(".").pop()?.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase()) ?? value
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const DiceIcon = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.4" fill="currentColor" /><circle cx="16" cy="8" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="8" cy="16" r="1.4" fill="currentColor" /><circle cx="16" cy="16" r="1.4" fill="currentColor" /></svg>
const UndoIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-4" /></svg>
const RedoIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h4" /></svg>
const ResetIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
const HelpCircleIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17.01V17" /></svg>
const SparklesIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
const CloseIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
const ChevronIcon = () => <svg className="transition-transform group-open:rotate-180" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
