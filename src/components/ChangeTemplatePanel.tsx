/* Change Template — quick access panel in the top-right white space.
 * Three levels of navigation, Apple-style compact:
 *   1. TEMPLATE  — Website / Mobile / Components (top-level group)
 *   2. LAYOUT    — sub-pages of the selected template
 *   3. VARIANT   — visual variants of the selected layout
 * The panel is always visible but stays compact — segmented controls
 * for two of the three levels keeps clutter low. */

type Props = {
  template: string
  templates: string[]
  onTemplate: (v: string) => void

  variant: string
  variants: string[]
  onVariant: (v: string) => void

  layout: string
  layouts: string[]
  onLayout: (v: string) => void
}

const UI_FONT = { fontFamily: `Geist, "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif` } as const
const DISPLAY_FONT = { fontFamily: `"Inter", Geist, ui-sans-serif, system-ui, sans-serif` } as const

export default function ChangeTemplatePanel({
  template, templates, onTemplate,
  variant, variants, onVariant,
  layout, layouts, onLayout,
}: Props) {
  return (
    <div
      className="flex w-[337px] shrink-0 flex-col gap-3 rounded-[12px] border border-[#e5e7eb] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      aria-label="Change Template"
      style={UI_FONT}
    >
      <p className="text-[13px] font-extrabold tracking-tight text-[#111827]" style={DISPLAY_FONT}>CHANGE TEMPLATE</p>

      <SegmentedGroup
        label="Template"
        value={template}
        options={templates}
        onChange={onTemplate}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24px] text-[#9ca3af]">Design Layout</span>
        <div className="grid grid-cols-3 gap-1.5">
          {layouts.map((l) => {
            const active = l === layout
            return (
              <button
                key={l}
                type="button"
                onClick={() => onLayout(l)}
                className={`flex h-[30px] items-center justify-center rounded-[7px] border text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] ${
                  active
                    ? "border-[#cecfd0] bg-white text-[#111827]"
                    : "border-[#e5e7eb] bg-[#f3f4f6] text-[#7b7b7b] hover:text-[#111827]"
                }`}
                aria-pressed={active}
              >{l}</button>
            )
          })}
        </div>
      </div>

      <SegmentedGroup
        label="Design Variant"
        value={variant}
        options={variants}
        onChange={onVariant}
      />
    </div>
  )
}

function SegmentedGroup({
  label, value, options, onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.24px] text-[#9ca3af]">{label}</span>
      <div className="flex h-[34px] w-full rounded-[9px] border border-[#e5e7eb] bg-[#f3f4f6] p-[2px]">
        {options.map((v) => {
          const active = v === value
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`flex flex-1 items-center justify-center rounded-[7px] text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f9eff] ${
                active
                  ? "border border-[#cecfd0] bg-white font-bold text-[#111827] shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                  : "font-semibold text-[#7b7b7b] hover:text-[#111827]"
              }`}
              aria-pressed={active}
            >{v}</button>
          )
        })}
      </div>
    </div>
  )
}
