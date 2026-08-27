import { createContext, useContext, type CSSProperties, type ReactNode } from "react"
import { withAlpha } from "../lib/color"
import { StyledButton, type ButtonProps, type ButtonStyle, type Trio } from "./ButtonPreview"

export type Brand = { name: string; logo: string | null; symbol: string | null }

export type PreviewCtxValue = {
  editMode: boolean
  assignments: Record<string, string>
  requestAssign: (id: string, label: string, currentHex: string) => void
  roleColor: (name: string) => string | undefined
  brand: Brand
  buttonStyle: ButtonStyle
  buttonProps: ButtonProps
  trio: Trio
}

const Ctx = createContext<PreviewCtxValue | null>(null)
export const PreviewProvider = Ctx.Provider
export const usePreview = () => useContext(Ctx)

type EditableProps = {
  id: string
  label: string
  color: string
  prop?: "color" | "background" | "borderColor"
  as?: keyof HTMLElementTagNameMap
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function Editable({ id, label, color, prop = "color", as = "div", className, style, children }: EditableProps) {
  const ctx = usePreview()
  const assignedRole = ctx?.assignments[id]
  const resolved = (assignedRole && ctx?.roleColor(assignedRole)) || color
  const edit = ctx?.editMode
  const Tag = as as any

  const editStyle: CSSProperties = edit
    ? { outline: `1.5px dashed ${withAlpha("#20B9FA", 0.7)}`, outlineOffset: 2, cursor: "pointer", borderRadius: 4 }
    : {}

  return (
    <Tag
      className={className}
      style={{ [prop]: resolved, ...style, ...editStyle } as CSSProperties}
      onClick={(e: React.MouseEvent) => {
        if (edit && ctx) {
          e.preventDefault()
          e.stopPropagation()
          ctx.requestAssign(id, label, resolved)
        }
      }}
      title={edit ? `Edit ${label}` : undefined}
    >
      {children}
    </Tag>
  )
}

/* Interactive button that uses the global button style/props; editable in Edit Mode */
export function PreviewButton({ id, label = "Button", text, size }: { id: string; label?: string; text?: string; size?: ButtonProps["size"] }) {
  const ctx = usePreview()
  if (!ctx) return null
  const props: ButtonProps = { ...ctx.buttonProps, text: text ?? ctx.buttonProps.text, size: size ?? "md" }
  return (
    <StyledButton
      style={ctx.buttonStyle}
      colors={ctx.trio}
      props={props}
      onEditClick={ctx.editMode ? () => ctx.requestAssign(id, label, ctx.trio.primary) : undefined}
    />
  )
}

/* Company logo (wordmark) — falls back to name text */
export function BrandLogo({ color, size = 20 }: { color: string; size?: number }) {
  const ctx = usePreview()
  if (ctx?.brand.logo) {
    return <img src={ctx.brand.logo} alt={ctx.brand.name + " logo"} style={{ height: size * 1.4, maxWidth: 150, objectFit: "contain" }} />
  }
  return (
    <span className="flex items-center gap-2 font-bold" style={{ fontFamily: "var(--font-display)", fontSize: size, color }}>
      <BrandSymbol color={color} size={size + 4} /> {ctx?.brand.name ?? "HueFrame"}
    </span>
  )
}

/* Company symbol / app icon — falls back to a generic mark tile */
export function BrandSymbol({ color, size = 28, rounded = 8 }: { color: string; size?: number; rounded?: number }) {
  const ctx = usePreview()
  if (ctx?.brand.symbol) {
    return <img src={ctx.brand.symbol} alt={(ctx?.brand.name ?? "") + " symbol"} style={{ width: size, height: size, borderRadius: rounded, objectFit: "cover" }} />
  }
  return (
    <span className="flex items-center justify-center" style={{ width: size, height: size, borderRadius: rounded, background: color }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </span>
  )
}
