import { createContext, useContext, type CSSProperties, type ReactNode } from "react"
import { readableOn, withAlpha } from "../lib/color"
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

/* Scope namespaces element ids per template so assignments never leak
   between previews (e.g. the landing CTA vs the paywall CTA). */
const ScopeCtx = createContext<string>("")
export const ScopeProvider = ScopeCtx.Provider
export const useScope = () => useContext(ScopeCtx)

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
  const scope = useScope()
  const fullId = scope ? `${scope}:${id}` : id
  const assignedRole = ctx?.assignments[fullId]
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
          ctx.requestAssign(fullId, label, resolved)
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
  const scope = useScope()
  if (!ctx) return null
  const fullId = scope ? `${scope}:${id}` : id
  const assigned = ctx.assignments[fullId]
  const primary = (assigned && ctx.roleColor(assigned)) || ctx.trio.primary
  const colors = primary === ctx.trio.primary ? ctx.trio : { ...ctx.trio, primary, text: readableOn(primary) }
  const props: ButtonProps = { ...ctx.buttonProps, text: text ?? ctx.buttonProps.text, size: size ?? "md" }
  return (
    <StyledButton
      style={ctx.buttonStyle}
      colors={colors}
      props={props}
      onEditClick={ctx.editMode ? () => ctx.requestAssign(fullId, label, colors.primary) : undefined}
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
      <BrandSymbol color={color} size={size + 4} /> {ctx?.brand.name ?? "Pallet Preview"}
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
