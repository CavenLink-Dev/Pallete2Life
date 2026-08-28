import type React from "react"

/* Pixel-close rebuild of the Figma "prev_official_1" Properties sidebar.
 * Uses the exact colours, spacing, radii and typography noted in the
 * design (Geist as the UI font, Inter fallback via system stack). */

type Props = {
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
}

const UI_FONT = { fontFamily: `Geist, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` } as const
const DISPLAY_FONT = { fontFamily: `"Inter", Geist, ui-sans-serif, system-ui, sans-serif` } as const

export default function PropertiesPanel(p: Props) {
  return (
    <aside
      className="relative flex h-full w-[369px] shrink-0 flex-col border-l border-[#e5e7eb] bg-white text-[#111827]"
      aria-label="Palette Preview properties"
      style={UI_FONT}
    >
      {/* Scrolling body */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-4">
      {/* PROPERTIES header (top of sidebar — logo removed) */}
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-bold tracking-tight text-[#515357]" style={DISPLAY_FONT}>PROPERTIES</h2>
        <button
          type="button"
          onClick={p.onHelp}
          className="flex items-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-white px-2.5 py-2 text-[13px] font-semibold text-[#6b7280] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
        >
          <HelpCircleIcon /> Help
        </button>
      </div>

      <div className="h-px w-full bg-[#e5e7eb]" />

      <Section label="Tools" info>
        <ChipRow>
          <Chip active={p.editActive} onClick={p.onToggleEdit}>Edit</Chip>
          <Chip onClick={p.onCreateElement}>Create Element</Chip>
        </ChipRow>
      </Section>

      <div className="h-px w-full bg-[#e5e7eb]" />

      <Section label="Edit">
        <ChipRow>
          <Chip disabled={!p.hasSelection} onClick={p.onDelete}>Delete</Chip>
          <Chip disabled={!p.hasSelection} onClick={p.onCopy}>Copy</Chip>
          <Chip disabled={!p.hasClipboard} onClick={p.onPaste}>Paste</Chip>
          <Chip disabled={!p.hasSelection} onClick={p.onDuplicate}>Duplicate</Chip>
        </ChipRow>
      </Section>

      <div className="h-px w-full bg-[#e5e7eb]" />

      <Section label="Colour Roles" info>
        <ChipRow>
          <Chip onClick={p.onSelectRole}>Select</Chip>
          <Chip onClick={p.onCreateRole}>Create  +</Chip>
          <Chip onClick={p.onRemoveRole}>Remove  -</Chip>
        </ChipRow>
      </Section>

      <Section label="Available Roles">
        <ChipRow>
          {p.availableRoles.map((r) => (
            <ComponentChip key={r} label={r} />
          ))}
        </ChipRow>
      </Section>

      <div className="h-px w-full bg-[#e5e7eb]" />

      <Section label="Assign Hierarchy" info>
        <div className="flex items-center gap-2">
          <SplitSelect
            leftValue={p.hierarchySource}
            rightValue={p.hierarchyTarget}
            leftOptions={p.hierarchyOptions}
            rightOptions={p.hierarchyOptions}
            onLeftChange={p.onHierarchySource}
            onRightChange={p.onHierarchyTarget}
            leftSwatchColor={p.currentHex}
          />
          <button
            type="button"
            onClick={p.onHierarchySet}
            className="rounded-[5px] border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-1.5 text-[11px] font-semibold text-[#4b5563] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
          >Set</button>
        </div>
      </Section>

      <div className="h-px w-full bg-[#e5e7eb]" />

      <Section label="Colour">
        <div className="flex items-center gap-2">
          <ColourPill hex={p.currentHex} onOpen={p.onOpenColorEditor} />
          <AlphaPill value={p.currentAlpha} />
          <IconMiniBtn onClick={p.onToggleVisible} title={p.visible ? "Hide" : "Show"}>
            {p.visible ? <EyeIcon /> : <EyeOffIcon />}
          </IconMiniBtn>
          <IconMiniBtn title="Remove"><MinusIcon /></IconMiniBtn>
        </div>
      </Section>

      <div className="h-px w-full bg-[#e5e7eb]" />

      {/* Variant + Layout moved to the Change Template panel in the top-right */}

      <Section label="Brand" info>
        <button
          type="button"
          onClick={p.onInsertBrand}
          className="flex h-[36px] w-[129px] items-center gap-2 rounded-[5px] border border-[#e5e7eb] bg-[#f3f4f6] px-3 text-[13px] font-semibold text-[#7b7b7b] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
        >
          <SparklesIcon /> Insert Brand
        </button>
      </Section>

      <div className="h-px w-full bg-[#e5e7eb]" />

      <Section label="View">
        <button
          type="button"
          onClick={p.onFullscreen}
          className="flex h-[36px] w-[129px] items-center gap-2 rounded-[5px] border border-[#e5e7eb] bg-[#f3f4f6] px-3 text-[13px] font-semibold text-[#7b7b7b] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
        >
          <MaximizeIcon /> Full screen
        </button>
      </Section>

      <div className="h-px w-full bg-[#e5e7eb]" />

      <Section label="Export">
        <button
          type="button"
          onClick={p.onExport}
          className="flex h-[40px] w-full items-center justify-center gap-2 rounded-[5px] bg-[#111827] px-4 text-[13px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
        >
          <DownloadIcon /> Export Assets
        </button>
      </Section>
      </div>

      {/* Sticky footer: Randomise + Undo/Save/Redo (was previously at the sidebar top) */}
      <div className="shrink-0 border-t border-[#e5e7eb] bg-white p-3">
        <button
          type="button"
          onClick={p.onRandomize}
          className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#0e1821] px-4 text-white shadow-sm transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
        >
          <DiceIcon />
          <span className="text-[15px] font-semibold" style={UI_FONT}>Randomise</span>
        </button>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <PillBtn onClick={p.onUndo} disabled={!p.canUndo} label="Undo" icon={<UndoIcon />} />
          <PillBtn onClick={p.onSave} label="Save" icon={<SaveIcon />} />
          <PillBtn onClick={p.onRedo} disabled={!p.canRedo} label="Redo" icon={<RedoIcon />} />
        </div>
      </div>

      {/* Tiny brand mark tucked at the very bottom, subdued */}
      <div className="shrink-0 border-t border-[#e5e7eb] bg-white px-4 py-2 text-right">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24px] text-[#9ca3af]" style={UI_FONT}>Palette Preview</span>
      </div>
    </aside>
  )
}

/* ---------- helpers ---------- */

function Section({ label, info, children }: { label: string; info?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.24px] text-[#4b5563]" style={UI_FONT}>{label}</span>
        {info && <InfoDot />}
      </div>
      {children}
    </div>
  )
}

function InfoDot() {
  return (
    <span className="grid h-[15px] w-[15px] place-items-center rounded-full bg-[#1f9eff] text-[10px] font-bold italic text-white" aria-hidden>
      i
    </span>
  )
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>
}

function Chip({
  children, active, disabled, onClick,
}: { children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[5px] border px-2.5 py-1.5 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] ${
        active
          ? "border-[#0e1821] bg-[#0e1821] text-white"
          : disabled
          ? "cursor-not-allowed border-[#eef0f2] bg-[#fafafa] text-[#c7c9cc]"
          : "border-[#e5e7eb] bg-[#f3f4f6] text-[#7b7b7b] hover:text-[#111827]"
      }`}
      style={UI_FONT}
    >{children}</button>
  )
}

function ComponentChip({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2 rounded-[7.776px] border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-1.5 text-[15px] font-semibold text-[#7b7b7b]" style={UI_FONT}>
      <LayersIcon />{label}
    </span>
  )
}

function SplitSelect({
  leftValue, rightValue, leftOptions, rightOptions, onLeftChange, onRightChange, leftSwatchColor,
}: {
  leftValue: string
  rightValue: string
  leftOptions: string[]
  rightOptions: string[]
  onLeftChange: (v: string) => void
  onRightChange: (v: string) => void
  leftSwatchColor: string
}) {
  return (
    <div className="flex h-[35px] items-center">
      {/* left half */}
      <label className="relative flex h-[35px] w-[130px] items-center gap-2 rounded-l-[7.776px] border border-[#d7d9dd] bg-white pl-1 pr-2">
        <span className="block h-[25px] w-[25px] shrink-0 rounded-[2px]" style={{ background: leftSwatchColor }} aria-hidden />
        <select
          value={leftValue}
          onChange={(e) => onLeftChange(e.target.value)}
          className="w-full min-w-0 appearance-none bg-transparent pr-3 text-[11px] font-semibold text-[#4b5563] focus:outline-none"
          style={UI_FONT}
        >
          {ensure(leftOptions, leftValue).map((o) => <option key={o}>{o}</option>)}
        </select>
        <CaretDown />
      </label>
      {/* right half */}
      <label className="relative flex h-[35px] w-[95px] items-center gap-1 rounded-r-[7.776px] border-y border-r border-[#d7d9dd] bg-white pl-2 pr-2">
        <select
          value={rightValue}
          onChange={(e) => onRightChange(e.target.value)}
          className="w-full min-w-0 appearance-none bg-transparent pr-2 text-[11px] font-semibold text-[#4b5563] focus:outline-none"
          style={UI_FONT}
        >
          {ensure(rightOptions, rightValue).map((o) => <option key={o}>{o}</option>)}
        </select>
        <CaretDown />
      </label>
    </div>
  )
}

function ensure(options: string[], value: string): string[] {
  return options.includes(value) ? options : [value, ...options]
}

function ColourPill({ hex, onOpen }: { hex: string; onOpen: () => void }) {
  const clean = hex.replace("#", "").toUpperCase()
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-[35px] items-center gap-2 rounded-l-[7.776px] border border-[#d7d9dd] bg-white pl-[5px] pr-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
      aria-label="Edit colour"
      title="Open colour editor"
    >
      <span className="block h-[25px] w-[25px] rounded-[4px]" style={{ background: `#${clean}` }} aria-hidden />
      <span className="text-[13px] font-medium text-[#111827] tracking-tight" style={UI_FONT}>{clean}</span>
    </button>
  )
}

function AlphaPill({ value }: { value: number }) {
  return (
    <span className="flex h-[35px] items-center gap-1 rounded-r-[7.776px] border-y border-r border-[#d7d9dd] bg-white px-2 text-[#111827]" style={UI_FONT}>
      <span className="text-[13px] font-medium">{Math.round(value * 100)}</span>
      <span className="text-[13px] font-semibold text-[#5c5757]">%</span>
    </span>
  )
}

function IconMiniBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title ?? ""}
      className="grid h-[28px] w-[28px] place-items-center rounded-[5px] border border-[#e5e7eb] bg-white text-[#4b5563] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
    >{children}</button>
  )
}

function PillBtn({ label, icon, onClick, disabled }: { label: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[36px] items-center justify-center gap-1.5 rounded-[8px] border border-[#d7d9dd] bg-white px-2 text-[12px] font-semibold text-[#4b5563] transition-colors hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] disabled:cursor-not-allowed disabled:opacity-40"
      aria-label={label}
      title={label}
      style={DISPLAY_FONT}
    >
      {icon}<span>{label}</span>
    </button>
  )
}

/* ---------- icons ---------- */
const DiceIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.4" fill="currentColor" /><circle cx="16" cy="8" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="8" cy="16" r="1.4" fill="currentColor" /><circle cx="16" cy="16" r="1.4" fill="currentColor" /></svg>)
const UndoIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-4" /></svg>)
const RedoIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h4" /></svg>)
const SaveIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" /></svg>)
const HelpCircleIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17.01V17" /></svg>)
const EyeIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>)
const EyeOffIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a19.4 19.4 0 0 1 4.11-5.19"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-4.47"/></svg>)
const MinusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14" /></svg>)
const SparklesIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>)
const MaximizeIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>)
const DownloadIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13" /><path d="m7 12 5 5 5-5" /><path d="M5 21h14" /></svg>)
const LayersIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 10 6-10 6L2 8Z"/><path d="M2 16l10 6 10-6"/><path d="M2 12l10 6 10-6"/></svg>)
const CaretDown = () => (<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4b5563]"><path d="m6 9 6 6 6-6"/></svg>)
