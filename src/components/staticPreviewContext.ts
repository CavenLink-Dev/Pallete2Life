import { useMemo } from "react"
import { deriveTheme, type Swatch } from "../lib/color"
import { createTokenSystem, semanticColour, semanticKeyForRole } from "../lib/tokenSystem"
import { DEFAULT_BUTTON_PROPS, paletteToTrio } from "./ButtonPreview"
import type { Brand, PreviewCtxValue } from "./PreviewCtx"

const NOOP_BRAND: Brand = { name: "", logo: null, symbol: null }

/**
 * Builds a read-only PreviewCtxValue from a plain palette so BuiltInTemplatePreview
 * (and the Editable/PreviewButton primitives inside it) can render fully styled,
 * non-interactive previews outside the Builder — used by the inspiration gallery's
 * thumbnails and detail view. editMode is always false, so click handlers no-op.
 */
export function useStaticPreviewContext(palette: Swatch[]): PreviewCtxValue {
  return useMemo(() => {
    const theme = deriveTheme(palette)
    const tokenSystem = createTokenSystem(palette)
    const trio = paletteToTrio(palette)
    return {
      editMode: false,
      assignments: {},
      roleColor: () => undefined,
      tokenColor: (role: string) => {
        const key = semanticKeyForRole(role)
        return key ? semanticColour(tokenSystem, palette, key, theme.accent) : theme.accent
      },
      brand: NOOP_BRAND,
      buttonStyle: "flat",
      buttonProps: DEFAULT_BUTTON_PROPS,
      trio,
      selectedElement: null,
      elementOverrides: {},
      tokenSystem,
      selectElement: () => {},
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette])
}
