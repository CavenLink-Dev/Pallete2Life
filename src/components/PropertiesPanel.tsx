import type React from "react"

type PaletteOption = { id: string; name: string; hex: string }

type Props = {
  onRandomize: () => void
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  canUndo: boolean
  canRedo: boolean
  onFormat: () => void
  formatLabel: string
  onExport: () => void
  onHelp: () => void
  onInsertBrand: () => void
  onFullscreen: () => void
  roleSource: string
  roleTargetId: string
  roleSourceOptions: string[]
  paletteOptions: PaletteOption[]
  onRoleSource: (value: string) => void
  onRoleTarget: (value: string) => void
  onRoleSet: () => void
  roleSetDisabled: boolean
  roleMessage: { text: string; tone: "success" | "error" | "neutral" } | null
}

const UI_FONT = { fontFamily: `Geist, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` } as const
const DISPLAY_FONT = { fontFamily: `"Inter", Geist, ui-sans-serif, system-ui, sans-serif` } as const

export default function PropertiesPanel(p: Props) {
  const selectedTarget = p.paletteOptions.find((option) => option.id === p.roleTargetId)

  return (
    <aside
      className="flex h-auto w-full shrink-0 flex-col border-t border-[#e5e7eb] bg-white text-[#111827] xl:h-full xl:w-[369px] xl:border-l xl:border-t-0"
      aria-label="Palette controls"
      style={UI_FONT}
    >
      <div className="flex flex-col gap-5 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-bold text-[#31343a]" style={DISPLAY_FONT}>Palette controls</h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">Changes are saved automatically.</p>
          </div>
          <button
            type="button"
            onClick={p.onHelp}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
            aria-label="Help"
            title="Help"
          >
            <HelpCircleIcon />
          </button>
        </div>

        <section aria-labelledby="actions-title">
          <h3 id="actions-title" className="mb-2 text-[11px] font-bold uppercase text-[#6b7280]">Actions</h3>
          <button
            type="button"
            onClick={p.onRandomize}
            className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#0e1821] px-4 text-[14px] font-semibold text-white shadow-sm hover:bg-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
          >
            <DiceIcon /> Randomise safely
          </button>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <ActionButton onClick={p.onUndo} disabled={!p.canUndo} icon={<UndoIcon />}>Undo</ActionButton>
            <ActionButton onClick={p.onRedo} disabled={!p.canRedo} icon={<RedoIcon />}>Redo</ActionButton>
            <ActionButton onClick={p.onSave} icon={<SaveIcon />}>Save</ActionButton>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <ActionButton onClick={p.onFormat} icon={<LayersIcon />} strong>{p.formatLabel}</ActionButton>
            <ActionButton onClick={p.onExport} icon={<DownloadIcon />} strong>Export</ActionButton>
          </div>
        </section>

        <div className="h-px bg-[#e5e7eb]" />

        <section aria-labelledby="mapping-title">
          <div className="mb-2">
            <h3 id="mapping-title" className="text-[11px] font-bold uppercase text-[#6b7280]">Global role mapping</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-[#6b7280]">Map a design role to a palette colour. The mapping applies to every preview and follows the colour if you rename it.</p>
          </div>
          <div className="grid gap-2">
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold text-[#4b5563]">Design role</span>
              <select
                value={p.roleSource}
                onChange={(event) => p.onRoleSource(event.target.value)}
                className="h-10 w-full rounded-[7px] border border-[#d7d9dd] bg-white px-3 text-[13px] font-semibold text-[#374151] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
              >
                {p.roleSourceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold text-[#4b5563]">Palette colour</span>
              <span className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-[4px] border border-black/10" style={{ background: selectedTarget?.hex }} />
                <select
                  value={p.roleTargetId}
                  onChange={(event) => p.onRoleTarget(event.target.value)}
                  className="h-10 w-full rounded-[7px] border border-[#d7d9dd] bg-white pl-10 pr-3 text-[13px] font-semibold text-[#374151] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff]"
                >
                  {p.paletteOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                </select>
              </span>
            </label>
            <button
              type="button"
              onClick={p.onRoleSet}
              disabled={p.roleSetDisabled}
              className="mt-1 h-10 rounded-[7px] bg-[#111827] px-4 text-[13px] font-bold text-white hover:bg-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] disabled:cursor-not-allowed disabled:bg-[#e5e7eb] disabled:text-[#9ca3af]"
            >
              Set mapping
            </button>
            {p.roleMessage && (
              <p
                role="status"
                className={`rounded-[7px] px-3 py-2 text-[12px] leading-relaxed ${
                  p.roleMessage.tone === "error"
                    ? "bg-[#fef2f2] text-[#b42318]"
                    : p.roleMessage.tone === "success"
                    ? "bg-[#ecfdf3] text-[#067647]"
                    : "bg-[#f3f4f6] text-[#4b5563]"
                }`}
              >
                {p.roleMessage.text}
              </p>
            )}
          </div>
        </section>

        <div className="h-px bg-[#e5e7eb]" />

        <section aria-labelledby="workspace-title">
          <h3 id="workspace-title" className="mb-2 text-[11px] font-bold uppercase text-[#6b7280]">Preview</h3>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton onClick={p.onInsertBrand} icon={<SparklesIcon />}>Brand</ActionButton>
            <ActionButton onClick={p.onFullscreen} icon={<MaximizeIcon />}>Full screen</ActionButton>
          </div>
        </section>
      </div>
      <div className="border-t border-[#e5e7eb] px-4 py-3 text-[11px] text-[#9ca3af]">
        Palette Preview
      </div>
    </aside>
  )
}

function ActionButton({
  children,
  icon,
  onClick,
  disabled,
  strong,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  strong?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-[7px] border px-2 text-[12px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] disabled:cursor-not-allowed disabled:opacity-40 ${
        strong
          ? "border-[#d7d9dd] bg-[#f3f4f6] text-[#111827] hover:bg-[#e9eaec]"
          : "border-[#e5e7eb] bg-white text-[#4b5563] hover:text-[#111827]"
      }`}
    >
      {icon}<span className="truncate">{children}</span>
    </button>
  )
}

const DiceIcon = () => (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.4" fill="currentColor" /><circle cx="16" cy="8" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="8" cy="16" r="1.4" fill="currentColor" /><circle cx="16" cy="16" r="1.4" fill="currentColor" /></svg>)
const UndoIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-4" /></svg>)
const RedoIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h4" /></svg>)
const SaveIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" /></svg>)
const LayersIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 10 6-10 6L2 8Z"/><path d="M2 16l10 6 10-6"/><path d="M2 12l10 6 10-6"/></svg>)
const DownloadIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13" /><path d="m7 12 5 5 5-5" /><path d="M5 21h14" /></svg>)
const HelpCircleIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17.01V17" /></svg>)
const SparklesIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>)
const MaximizeIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>)
