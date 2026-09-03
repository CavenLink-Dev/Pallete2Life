import BuiltInTemplatePreview from "./BuiltInTemplatePreview"
import { deriveTheme } from "../lib/color"
import { PreviewProvider, ScopeProvider } from "./PreviewCtx"
import { useStaticPreviewContext } from "./staticPreviewContext"
import { curatedPaletteAsSwatches, type InspirationItem } from "../lib/inspirationCatalog"

/**
 * Renders a real, styled BuiltInTemplatePreview scaled down to fit a gallery
 * card. The full preview is rendered at its natural size inside a fixed-height,
 * clipped, scaled wrapper — the same trick used for design-tool card thumbnails —
 * so the mini shot looks like the real thing instead of a schematic mock-up.
 */
export default function InspirationThumbnail({ item }: { item: InspirationItem }) {
  const swatches = curatedPaletteAsSwatches(item.palette)
  const theme = deriveTheme(swatches)
  const ctx = useStaticPreviewContext(swatches)

  const phone = item.template.layout === "phone"
  const natural = phone ? 620 : item.template.layout === "component" ? 620 : 620
  const scale = phone ? 0.34 : 0.24

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: theme.paper }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          width: `${100 / scale}%`,
          height: `${(natural / scale)}px`,
          transform: `scale(${scale})`,
        }}
      >
        <PreviewProvider value={ctx}>
          <ScopeProvider value={`inspiration:${item.id}`}>
            <BuiltInTemplatePreview asset={item.template} theme={theme} />
          </ScopeProvider>
        </PreviewProvider>
      </div>
    </div>
  )
}
