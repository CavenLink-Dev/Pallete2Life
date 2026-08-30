import { createContext, useContext, type CSSProperties, type ReactNode } from "react"
import { readableOn, withAlpha } from "../lib/color"
import { StyledButton, type ButtonProps, type ButtonStyle, type Trio } from "./ButtonPreview"
import {
  buttonPadding,
  elementOverrideStyle,
  elementTokens,
  elementTokenStyle,
  type ElementOverrides,
  type InspectorKind,
  type InspectorSelection,
} from "../lib/designTokens"
import { buttonMainElementTokens, cardDefaultElementTokens, semanticLabel, type DesignTokenSystem } from "../lib/tokenSystem"

export type Brand = { name: string; logo: string | null; symbol: string | null }

export type PreviewCtxValue = {
  editMode: boolean
  assignments: Record<string, string>
  roleColor: (name: string) => string | undefined
  tokenColor: (role: string) => string
  brand: Brand
  buttonStyle: ButtonStyle
  buttonProps: ButtonProps
  trio: Trio
  selectedElement: InspectorSelection | null
  elementOverrides: ElementOverrides
  tokenSystem: DesignTokenSystem
  selectElement: (element: InspectorSelection) => void
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
  kind?: InspectorKind
}

export function Editable({ id, label, color, prop = "color", as = "div", className, style, children, kind }: EditableProps) {
  const ctx = usePreview()
  const scope = useScope()
  const fullId = scope ? `${scope}:${id}` : id
  const assignedRole = ctx?.assignments[fullId]
  const resolved = (assignedRole && ctx?.roleColor(assignedRole)) || color
  const edit = ctx?.editMode
  const Tag = as as any
  const inferredKind: InspectorKind = kind
    ?? (prop === "background" ? "card" : label.toLowerCase().includes("nav") || label.toLowerCase().includes("tab") ? "navigation" : "text")
  const override = ctx?.elementOverrides[fullId]
  const inherited = ctx && inferredKind === "card" ? cardDefaultElementTokens(ctx.tokenSystem) : undefined
  const resolvedTokens = inherited ? { ...inherited, ...override } : override
  const inheritedCardStyle: CSSProperties = ctx && inferredKind === "card" ? {
    background: ctx.tokenColor(String(resolvedTokens?.background ?? "Surface")),
    borderRadius: ctx.tokenSystem.primitive.radius[String(resolvedTokens?.radius)] ?? 12,
    padding: ctx.tokenSystem.primitive.spacing[String(ctx.tokenSystem.component.cardDefault.padding)] ?? 16,
    gap: ctx.tokenSystem.primitive.gaps[String(ctx.tokenSystem.component.cardDefault.gap)] ?? 12,
    borderWidth: ctx.tokenSystem.primitive.borders[String(resolvedTokens?.border)] ?? 1,
    borderStyle: "solid",
    borderColor: ctx.tokenColor("Border"),
    boxShadow: ctx.tokenSystem.primitive.shadows[String(resolvedTokens?.shadow)] ?? "none",
  } : {}
  const tokenStyle = ctx ? { ...inheritedCardStyle, ...elementOverrideStyle(inferredKind, override, ctx.tokenColor) } : {}
  const selected = ctx?.selectedElement?.id === fullId
  const content = inferredKind === "text" && typeof children === "string" && String(override?.textContent || "")
    ? String(override?.textContent)
    : inferredKind === "navigation" && typeof children === "string" && String(override?.label || "")
    ? String(override?.label)
    : children

  const editStyle: CSSProperties = edit
    ? { outline: `${selected ? 2 : 1.5}px ${selected ? "solid" : "dashed"} ${withAlpha("#20B9FA", selected ? 0.95 : 0.7)}`, outlineOffset: 2, cursor: "pointer", borderRadius: 4 }
    : {}

  return (
    <Tag
      className={className}
      data-token={inferredKind === "card" ? "component.card.default" : undefined}
      style={{ [prop]: resolved, ...style, ...tokenStyle, ...editStyle } as CSSProperties}
      onClick={(e: React.MouseEvent) => {
        if (edit && ctx) {
          e.preventDefault()
          e.stopPropagation()
          ctx.selectElement({
            id: fullId,
            kind: inferredKind,
            label,
            defaults: inferredKind === "text" && typeof children === "string"
              ? { textContent: children }
              : inferredKind === "navigation" && typeof children === "string"
              ? { label: children }
              : undefined,
          })
        }
      }}
      title={edit ? `Edit ${label}` : undefined}
    >
      {content}
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
  const override = ctx.elementOverrides[fullId]
  const inherited = buttonMainElementTokens(ctx.tokenSystem)
  const resolvedTokens = { ...inherited, ...override }
  const values = elementTokens("button", resolvedTokens)
  const tokenStyle = elementOverrideStyle("button", resolvedTokens, ctx.tokenColor)
  const primary = resolvedTokens.colourRole
    ? ctx.tokenColor(String(values.colourRole))
    : (assigned && ctx.roleColor(assigned)) || ctx.trio.primary
  const buttonTextToken = ctx.tokenSystem.component.buttonMain.text
  const buttonText = buttonTextToken === "textInverse" ? readableOn(primary) : ctx.tokenColor(semanticLabel(buttonTextToken))
  const colors = { ...ctx.trio, primary, text: buttonText }
  const tokenSize = String(values.size ?? "size.md")
  const resolvedSize: ButtonProps["size"] = tokenSize === "size.sm" ? "sm" : tokenSize === "size.lg" ? "lg" : "md"
  const props: ButtonProps = {
    ...ctx.buttonProps,
    text: String(override?.text ?? text ?? ctx.buttonProps.text),
    size: resolvedSize,
    radius: Number(elementTokenStyle("button", values, ctx.tokenColor).borderRadius),
    outline: String(values.border) === "border.strong" ? 2 : String(values.border) === "border.subtle" ? 1 : 0,
  }
  const selected = ctx.selectedElement?.id === fullId
  const buttonType = String(values.buttonType ?? "solid")
  const style: ButtonStyle = resolvedTokens.buttonType
    ? buttonType === "outline" || buttonType === "ghost"
      ? "outline"
      : buttonType === "glass"
      ? "glass"
      : "flat"
    : ctx.buttonStyle
  return (
    <StyledButton
      style={style}
      colors={colors}
      props={props}
      className="preview-token-button"
      tokenTag="component.button.main"
      styleOverride={{
        ...tokenStyle,
        ...buttonPadding(String(values.padding), tokenSize),
        paddingInline: ctx.tokenSystem.primitive.spacing[ctx.tokenSystem.component.buttonMain.paddingInline] ?? 16,
        borderRadius: ctx.tokenSystem.primitive.radius[String(values.radius)] ?? tokenStyle.borderRadius,
        gap: ctx.tokenSystem.primitive.gaps[ctx.tokenSystem.component.buttonMain.gap] ?? tokenStyle.gap,
        minHeight: ctx.tokenSystem.primitive.sizing[ctx.tokenSystem.component.buttonMain.height] ?? 44,
        transitionDuration: `${ctx.tokenSystem.state.motionDuration.normal}ms`,
        transitionTimingFunction: ctx.tokenSystem.state.motionEasing.standard,
        ["--token-focus-colour" as string]: ctx.tokenColor(String(ctx.tokenSystem.state.focusRing.colour)),
        ["--token-focus-width" as string]: `${ctx.tokenSystem.state.focusRing.width}px`,
        ["--token-focus-offset" as string]: `${ctx.tokenSystem.state.focusRing.offset}px`,
        ["--token-disabled-opacity" as string]: ctx.tokenSystem.state.disabledOpacity,
        ["--token-hover-opacity" as string]: ctx.tokenSystem.state.hoverOpacity,
        outline: selected ? "2px solid #20B9FA" : undefined,
        outlineOffset: selected ? 3 : undefined,
      }}
      onEditClick={ctx.editMode ? () => ctx.selectElement({ id: fullId, kind: "button", label, defaults: { text: text ?? ctx.buttonProps.text } }) : undefined}
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
      <BrandSymbol color={color} size={size + 4} /> {ctx?.brand.name ?? "Palette Preview"}
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
