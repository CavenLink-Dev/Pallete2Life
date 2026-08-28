/* Change Template — quick access panel that sits in the top-right white
 * space above the Properties sidebar. Contains the Design Variant
 * segmented control and the Design Layout 3x2 grid. */

type Props = {
  variant: string
  variants: string[]
  onVariant: (v: string) => void
  layout: string
  layouts: string[]
  onLayout: (v: string) => void
}

const UI_FONT = { fontFamily: `Geist, "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif` } as const
const DISPLAY_FONT = { fontFamily: `"Inter", Geist, ui-sans-serif, system-ui, sans-serif` } as const

export default function ChangeTemplatePanel({ variant, variants, onVariant, layout, layouts, onLayout }: Props) {
  return (
    <div
      className="flex w-[337px] shrink-0 flex-col gap-3 rounded-[12px] border border-[#e5e7eb] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      aria-label="Change Template"
      style={UI_FONT}
    >
      <p className="text-[13px] font-extrabold tracking-tight text-[#111827]" style={DISPLAY_FONT}>CHANGE TEMPLATE</p>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24px] text-[#9ca3af]">Design Variant</span>
        <div className="flex h-[34px] w-full rounded-[9px] border border-[#e5e7eb] bg-[#f3f4f6] p-[2px]">
          {variants.map((v) => {
            const active = v === variant
            return (
              <button
                key={v}
                type="button"
                onClick={() => onVariant(v)}
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
    </div>
  )
}
