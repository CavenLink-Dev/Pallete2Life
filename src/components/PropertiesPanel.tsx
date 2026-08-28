import type React from "react"
import type { Swatch } from "../lib/color"

type Props = {
  brandName: string
  brandColor: string
  onRandomize: () => void
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  canUndo: boolean
  canRedo: boolean
  editActive: boolean
  onToggleEdit: () => void
  onCreateElement: () => void
  onDelete: () => void
  onCopy: () => void
  onPaste: () => void
  onDuplicate: () => void
  hasSelection: boolean
  hasClipboard: boolean
  roles: string[]
  onSelectRole: () => void
  onCreateRole: () => void
  onRemoveRole: () => void
  availableRoles: string[]
  hierarchySource: string
  hierarchyTarget: string
  hierarchyOptions: string[]
  onHierarchySource: (v: string) => void
  onHierarchyTarget: (v: string) => void
  onHierarchySet: () => void
  currentHex: string
  currentAlpha: number
  onOpenColorEditor: () => void
  onToggleVisible: () => void
  visible: boolean
  variant: string
  variants: string[]
  onVariant: (v: string) => void
  layout: string
  layouts: string[]
  onLayout: (v: string) => void
  onInsertBrand: () => void
  onFullscreen: () => void
  onExport: () => void
  onHelp: () => void
  palette: Swatch[]
  onSwatchClick: (id: string) => void
}

export default function PropertiesPanel(p: Props) {
  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-softgrey/70 bg-white px-4 py-4 text-charcoal"
      aria-label="Palette Preview properties">
      {/* Brand header */}
      <div className="flex items-center gap-2 pb-3 border-b border-softgrey/70">
        <img src="/app-icon-64.png" alt="" width={22} height={22} className="h-[22px] w-[22px] rounded-md" />
        <h2 className="text-[14px] font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Palette <span style={{ color: p.brandColor }}>Preview</span>
        </h2>
      </div>

      {/* Randomise (primary CTA) */}
      <button
        type="button"
        onClick={p.onRandomize}
        className="flex items-center justify-center gap-2 rounded-xl bg-[#0E1821] px-4 py-3 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
      >
        <DiceIcon /> Randomise
      </button>

      {/* Undo / Save / Redo */}
      <div className="grid grid-cols-3 gap-2">
        <PillBtn onClick={p.onUndo} disabled={!p.canUndo} label="Undo" icon={<UndoIcon />} />
        <PillBtn onClick={p.onSave} label="Save" icon={<SaveIcon />} />
        <PillBtn onClick={p.onRedo} disabled={!p.canRedo} label="Redo" icon={<RedoIcon />} />
      </div>

      {/* PROPERTIES header + help */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-[15px] font-extrabold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>PROPERTIES</h3>
        <button
          type="button"
          onClick={p.onHelp}
          className="flex items-center gap-1 rounded-md border border-softgrey px-2 py-1 text-[11px] font-semibold text-charcoal/60 hover:text-charcoal"
          title="Help"
          aria-label="Help"
        >
          <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#20B9FA] text-[9px] font-bold text-white">?</span>
          Help
        </button>
      </div>

      <Section label="Tools" info>
        <ChipRow>
          <Chip active={p.editActive} onClick={p.onToggleEdit}>Edit</Chip>
          <Chip onClick={p.onCreateElement}>Create Element</Chip>
        </ChipRow>
      </Section>

      <Section label="Edit">
        <ChipRow>
          <Chip disabled={!p.hasSelection} onClick={p.onDelete}>Delete</Chip>
          <Chip disabled={!p.hasSelection} onClick={p.onCopy}>Copy</Chip>
          <Chip disabled={!p.hasClipboard} onClick={p.onPaste}>Paste</Chip>
          <Chip disabled={!p.hasSelection} onClick={p.onDuplicate}>Duplicate</Chip>
        </ChipRow>
      </Section>

      <Section label="Colour Roles" info>
        <ChipRow>
          <Chip onClick={p.onSelectRole}>Select</Chip>
          <Chip onClick={p.onCreateRole}>Create +</Chip>
          <Chip onClick={p.onRemoveRole}>Remove -</Chip>
        </ChipRow>
      </Section>

      <Section label="Available Roles">
        <ChipRow>
          {p.availableRoles.map((r) => (
            <Chip key={r}>
              <span className="mr-1.5 inline-block" aria-hidden><LayersIcon /></span>
              {r}
            </Chip>
          ))}
        </ChipRow>
      </Section>

      <Section label="Role Mapping" info>
        <div className="flex flex-wrap items-center gap-2">
          <Swatchlet color={p.currentHex} />
          <SmallSelect value={p.hierarchySource} onChange={p.onHierarchySource} options={p.hierarchyOptions} />
          <SmallSelect value={p.hierarchyTarget} onChange={p.onHierarchyTarget} options={p.hierarchyOptions} />
          <button
            type="button"
            onClick={p.onHierarchySet}
            className="rounded-md border border-softgrey bg-white px-2.5 py-1 text-[11.5px] font-semibold text-charcoal/75 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
          >Set</button>
        </div>
      </Section>

      <Section label="Colour">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={p.onOpenColorEditor}
            className="flex items-center gap-2 rounded-md border border-softgrey bg-white px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
            title="Open colour editor"
            aria-label="Open colour editor"
          >
            <span className="block h-5 w-5 rounded-sm border border-black/10" style={{ background: p.currentHex }} />
            <span className="text-[11.5px] font-mono text-charcoal/85">{p.currentHex.replace("#", "").toUpperCase()}</span>
          </button>
          <span className="flex items-center gap-1 rounded-md border border-softgrey bg-white px-2 py-1 text-[11.5px] font-mono text-charcoal/85">
            {Math.round(p.currentAlpha * 100)} <span className="text-charcoal/45">%</span>
          </span>
          <button
            type="button"
            onClick={p.onToggleVisible}
            className="grid h-7 w-7 place-items-center rounded-md border border-softgrey bg-white text-charcoal/60 hover:text-charcoal"
            title={p.visible ? "Hide" : "Show"}
            aria-label={p.visible ? "Hide colour" : "Show colour"}
          >
            {p.visible ? <EyeIcon /> : <EyeOffIcon />}
          </button>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-md border border-softgrey bg-white text-charcoal/60 hover:text-charcoal"
            title="Remove"
            aria-label="Remove"
          >
            <MinusIcon />
          </button>
        </div>
      </Section>

      <Section label="Variant">
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-softgrey p-0.5">
          {p.variants.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => p.onVariant(v)}
              className={`rounded-md px-2 py-1 text-[11.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] ${
                p.variant === v ? "bg-[#0E1821] text-white" : "text-charcoal/70 hover:text-charcoal"
              }`}
              aria-pressed={p.variant === v}
            >{v}</button>
          ))}
        </div>
      </Section>

      <Section label="Layout">
        <div className="grid grid-cols-2 gap-2">
          {p.layouts.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => p.onLayout(l)}
              className={`rounded-md border px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] ${
                p.layout === l
                  ? "border-[#0E1821] bg-white text-charcoal"
                  : "border-softgrey bg-white text-charcoal/70 hover:text-charcoal"
              }`}
              aria-pressed={p.layout === l}
            >{l}</button>
          ))}
        </div>
      </Section>

      <Section label="Brand" info>
        <button
          type="button"
          onClick={p.onInsertBrand}
          className="flex items-center gap-1.5 rounded-md border border-softgrey bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-charcoal/75 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
        >
          <PlusIcon /> Insert Brand
        </button>
      </Section>

      <Section label="View">
        <button
          type="button"
          onClick={p.onFullscreen}
          className="flex items-center gap-1.5 rounded-md border border-softgrey bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-charcoal/75 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
        >
          <ExpandIcon /> Full screen
        </button>
      </Section>

      <Section label="Export">
        <button
          type="button"
          onClick={p.onExport}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0E1821] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
        >
          <DownloadIcon /> Export Assets
        </button>
      </Section>
    </aside>
  )
}

/* ---------- helpers ---------- */
function Section({ label, info, children }: { label: string; info?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-charcoal/55">{label}</span>
        {info && <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#20B9FA] text-[9px] font-bold text-white" aria-hidden>i</span>}
      </div>
      {children}
    </div>
  )
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-1.5">{children}</div>
}

function Chip({
  children, active, disabled, onClick,
}: { children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md border px-2.5 py-1 text-[11.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] ${
        active
          ? "border-[#0E1821] bg-[#0E1821] text-white"
          : disabled
          ? "cursor-not-allowed border-softgrey/70 bg-white text-charcoal/30"
          : "border-softgrey bg-white text-charcoal/75 hover:text-charcoal"
      }`}
    >{children}</button>
  )
}

function PillBtn({ label, icon, onClick, disabled }: { label: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-1.5 rounded-md border border-softgrey bg-white px-2 py-1.5 text-[11px] font-semibold text-charcoal/75 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] disabled:cursor-not-allowed disabled:opacity-40"
      aria-label={label}
      title={label}
    >
      {icon}<span>{label}</span>
    </button>
  )
}

function SmallSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-softgrey bg-white px-2 py-1 text-[11.5px] font-semibold text-charcoal/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Swatchlet({ color }: { color: string }) {
  return <span className="block h-5 w-5 rounded-md border border-softgrey" style={{ background: color }} aria-hidden />
}

/* ---------- icons ---------- */
const DiceIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.2" fill="currentColor" /><circle cx="16" cy="8" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="8" cy="16" r="1.2" fill="currentColor" /><circle cx="16" cy="16" r="1.2" fill="currentColor" /></svg>)
const UndoIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-4" /></svg>)
const RedoIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h4" /></svg>)
const SaveIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" /></svg>)
const EyeIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>)
const EyeOffIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a19.4 19.4 0 0 1 4.11-5.19"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-4.47"/></svg>)
const MinusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14" /></svg>)
const PlusIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>)
const ExpandIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>)
const DownloadIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13" /><path d="m7 12 5 5 5-5" /><path d="M5 21h14" /></svg>)
const LayersIcon = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 10 6-10 6L2 8Z"/><path d="M2 16l10 6 10-6"/><path d="M2 12l10 6 10-6"/></svg>)
