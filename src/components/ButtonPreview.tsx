import { useState, type CSSProperties } from "react"
import { BRAND, luminance, readableOn, shade, withAlpha, type Swatch } from "../lib/color"
import { ContrastBadge } from "./PalettePanel"

/* ------------------------------------------------------------------ */
/* Style definitions — each binds palette roles to button parts        */
/* ------------------------------------------------------------------ */

export const BUTTON_STYLES = ["flat", "depth", "elevated", "outline", "glass", "gradient"] as const
export type ButtonStyle = (typeof BUTTON_STYLES)[number]

export type RolePart = { role: string; part: string }

export const STYLE_META: Record<ButtonStyle, { label: string; blurb: string; roles: RolePart[] }> = {
  flat: { label: "Flat", blurb: "Clean, no depth", roles: [{ role: "Primary", part: "Background" }, { role: "Secondary", part: "Border" }, { role: "Text", part: "Text" }] },
  depth: { label: "3D depth", blurb: "Solid pushable base", roles: [{ role: "Primary", part: "Front face" }, { role: "Secondary", part: "Depth" }, { role: "Tertiary", part: "Edge" }, { role: "Text", part: "Text" }] },
  elevated: { label: "Elevated", blurb: "Floats on shadow", roles: [{ role: "Primary", part: "Background" }, { role: "Secondary", part: "Shadow" }, { role: "Text", part: "Text" }] },
  outline: { label: "Outline", blurb: "Border-led, fills on press", roles: [{ role: "Primary", part: "Border & text" }, { role: "Secondary", part: "Press fill" }, { role: "Tertiary", part: "Background" }] },
  glass: { label: "Glass", blurb: "Frosted & translucent", roles: [{ role: "Primary", part: "Tint" }, { role: "Secondary", part: "Edge glow" }, { role: "Text", part: "Text" }] },
  gradient: { label: "Gradient", blurb: "Blends two colours", roles: [{ role: "Primary", part: "Gradient top" }, { role: "Secondary", part: "Gradient base" }, { role: "Text", part: "Text" }] },
}

export type Trio = { primary: string; secondary: string; tertiary: string; text: string }

export type ButtonProps = { text: string; radius: number; size: "sm" | "md" | "lg"; outline: number; shadow: boolean }
export const DEFAULT_BUTTON_PROPS: ButtonProps = { text: "Get started", radius: 14, size: "lg", outline: 1.5, shadow: true }

const SIZES: Record<ButtonProps["size"], { padX: number; padY: number; font: number }> = {
  sm: { padX: 20, padY: 10, font: 14 },
  md: { padX: 32, padY: 14, font: 17 },
  lg: { padX: 44, padY: 20, font: 22 },
}

type State = { hover: boolean; pressed: boolean; disabled: boolean }

function styleCss(style: ButtonStyle, c: Trio, s: State, p: ButtonProps): CSSProperties {
  const { primary: pri, secondary: sec, tertiary: ter, text } = c
  const shadowOn = p.shadow
  const base: CSSProperties = {
    transition: "all 0.16s cubic-bezier(0.22,1,0.36,1)",
    cursor: s.disabled ? "not-allowed" : "pointer",
    border: `${p.outline}px solid transparent`,
    borderRadius: p.radius,
  }
  if (s.disabled) {
    return {
      ...base,
      background: style === "outline" || style === "glass" ? "transparent" : withAlpha(pri, 0.25),
      color: withAlpha("#0E1821", 0.4),
      border: `${p.outline}px solid ${withAlpha("#0E1821", 0.12)}`,
      boxShadow: "none",
      transform: "none",
    }
  }
  const pressBg = shade(pri, -0.12)
  const hoverBg = luminance(pri) > 0.5 ? shade(pri, -0.06) : shade(pri, 0.1)
  const sh = (v: string) => (shadowOn ? v : "none")

  switch (style) {
    case "flat":
      return { ...base, background: s.pressed ? pressBg : s.hover ? hoverBg : pri, color: text, border: `${p.outline}px solid ${sec}`, transform: s.pressed ? "scale(0.97)" : "none" }
    case "depth": {
      const d = s.pressed ? 3 : 9
      return { ...base, background: s.hover && !s.pressed ? shade(pri, 0.06) : pri, color: text, border: `${p.outline}px solid ${withAlpha(ter, 0.9)}`, boxShadow: `0 ${d}px 0 ${sec}, 0 ${d + 5}px ${d + 10}px ${withAlpha(sec, 0.35)}`, transform: s.pressed ? "translateY(6px)" : "none" }
    }
    case "elevated":
      return { ...base, background: s.pressed ? pressBg : s.hover ? hoverBg : pri, color: text, boxShadow: sh(s.pressed ? `0 3px 8px ${withAlpha(sec, 0.35)}` : s.hover ? `0 20px 40px ${withAlpha(sec, 0.5)}, 0 4px 10px ${withAlpha(sec, 0.3)}` : `0 14px 30px ${withAlpha(sec, 0.42)}, 0 3px 7px ${withAlpha(sec, 0.22)}`), transform: s.pressed ? "translateY(1px)" : s.hover ? "translateY(-3px)" : "none" }
    case "outline":
      return { ...base, background: s.pressed ? sec : s.hover ? withAlpha(pri, 0.1) : ter, color: s.pressed ? readableOn(sec) : pri, border: `${Math.max(p.outline, 1.5)}px solid ${pri}`, transform: s.pressed ? "scale(0.98)" : "none" }
    case "glass":
      return { ...base, background: withAlpha(pri, s.hover ? 0.55 : 0.4), color: text, border: `${p.outline}px solid ${withAlpha(sec, 0.7)}`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: sh(`inset 0 1px 0 ${withAlpha("#FFFFFF", 0.55)}, 0 12px 30px ${withAlpha(pri, 0.3)}`), transform: s.pressed ? "scale(0.98)" : "none" }
    case "gradient":
      return { ...base, background: `linear-gradient(135deg, ${s.pressed ? shade(pri, -0.1) : pri}, ${sec})`, color: text, boxShadow: sh(s.pressed ? `0 4px 12px ${withAlpha(sec, 0.4)}` : `0 14px 34px ${withAlpha(sec, s.hover ? 0.55 : 0.42)}`), transform: s.pressed ? "translateY(1px)" : s.hover ? "translateY(-3px)" : "none" }
  }
}

/* ------------------------------------------------------------------ */
/* Reusable interactive button                                         */
/* ------------------------------------------------------------------ */
export function StyledButton({
  style,
  colors,
  props,
  disabled = false,
  onEditClick,
  className,
  styleOverride,
  tokenTag,
}: {
  style: ButtonStyle
  colors: Trio
  props: ButtonProps
  disabled?: boolean
  onEditClick?: () => void
  className?: string
  styleOverride?: CSSProperties
  tokenTag?: string
}) {
  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)
  const sz = SIZES[props.size]
  return (
    <button
      type="button"
      disabled={disabled}
      data-token={tokenTag}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={(e) => { if (onEditClick) { e.preventDefault(); e.stopPropagation(); onEditClick() } }}
      className={"select-none font-semibold " + (className ?? "")}
      style={{ fontFamily: "var(--font-display)", paddingLeft: sz.padX, paddingRight: sz.padX, paddingTop: sz.padY, paddingBottom: sz.padY, fontSize: sz.font, ...styleCss(style, colors, { hover, pressed, disabled }, props), ...styleOverride }}
    >
      {props.text}
    </button>
  )
}

/* Small thumbnail of a style for the compact strip */
export function styleThumb(style: ButtonStyle, colors: Trio) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-md bg-[#FCFCFB]">
      <span className="rounded px-2 py-1 text-[9px] font-semibold" style={{ fontFamily: "var(--font-display)", ...styleCss(style, colors, { hover: false, pressed: false, disabled: false }, { ...DEFAULT_BUTTON_PROPS, size: "sm", radius: 6 }) }}>
        Button
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Components > Button lab — big preview + property controls           */
/* ------------------------------------------------------------------ */
export function ButtonLab({
  colors,
  style,
  props,
  setProps,
}: {
  colors: Trio
  style: ButtonStyle
  props: ButtonProps
  setProps: (p: ButtonProps) => void
}) {
  const [disabled, setDisabled] = useState(false)
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden rounded-t-3xl bg-[#FCFCFB]">
        <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(14,24,33,0.06) 1px, transparent 0)", backgroundSize: "26px 26px" }} />
        <div className="relative z-10">
          <StyledButton style={style} colors={colors} props={props} disabled={disabled} />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-2.5">
          <ContrastBadge fg={colors.text} bg={colors.primary} label="Button text" />
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-charcoal/50" style={{ fontFamily: "var(--font-mono)" }}>
            <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} className="h-3.5 w-3.5 accent-brand-cta" />
            preview disabled state
          </label>
        </div>
      </div>

      {/* property controls */}
      <div className="grid grid-cols-2 gap-4 border-t border-softgrey bg-white p-4 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Label>Label</Label>
          <input value={props.text} onChange={(e) => setProps({ ...props, text: e.target.value })} className="w-full rounded-lg border border-softgrey px-3 py-2 text-sm outline-none focus:border-brand-cta" />
        </div>
        <div>
          <Label>Size</Label>
          <div className="flex gap-1">
            {(["sm", "md", "lg"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setProps({ ...props, size: s })} className="min-h-11 flex-1 rounded-lg py-2 text-xs font-semibold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta" style={props.size === s ? { background: BRAND.cta, color: "#fff" } : { background: "#F1F2F4", color: "#0E1821" }}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <Label>Radius · {props.radius}px</Label>
          <input type="range" min={0} max={28} value={props.radius} onChange={(e) => setProps({ ...props, radius: +e.target.value })} className="w-full accent-brand-cta" />
        </div>
        <div>
          <Label>Outline · {props.outline}px</Label>
          <input type="range" min={0} max={4} step={0.5} value={props.outline} onChange={(e) => setProps({ ...props, outline: +e.target.value })} className="w-full accent-brand-cta" />
          <label className="mt-1.5 flex cursor-pointer items-center gap-1.5 text-[11px] text-charcoal/55">
            <input type="checkbox" checked={props.shadow} onChange={(e) => setProps({ ...props, shadow: e.target.checked })} className="h-3 w-3 accent-brand-cta" /> shadow
          </label>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-charcoal/45">{children}</label>
}

/* Map an arbitrary palette to the four button roles */
export function paletteToTrio(palette: Swatch[]): Trio {
  const h = palette.map((p) => p.hex)
  const primary = h[0] ?? BRAND.brand
  const secondary = h[1] ?? shade(primary, -0.4)
  const tertiary = h[2] ?? "#FFFFFF"
  return { primary, secondary, tertiary, text: readableOn(primary) }
}

/* Default export: palette-driven button preview with property controls */
export default function ButtonPreview({ palette, style }: { palette: Swatch[]; style: ButtonStyle }) {
  const [props, setProps] = useState<ButtonProps>(DEFAULT_BUTTON_PROPS)
  return <ButtonLab colors={paletteToTrio(palette)} style={style} props={props} setProps={setProps} />
}
