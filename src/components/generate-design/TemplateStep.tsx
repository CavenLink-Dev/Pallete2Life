import { useMemo, useState } from "react"
import { publicAssetsForCategory } from "../../lib/templateCatalog"
import type { TemplateAsset, TemplateCategory } from "../../lib/templateAssets"
import FlowShell, { FlowButton } from "./FlowShell"

type Props = {
  category: TemplateCategory
  onApply: (asset: TemplateAsset) => void
  onBack: () => void
  onChangeCategory: () => void
}

export default function TemplateStep({ category, onApply, onBack, onChangeCategory }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const assets = publicAssetsForCategory(category)
    const types = Array.from(new Set(assets.map((asset) => asset.type)))
    return types.map((type) => ({ type, assets: assets.filter((asset) => asset.type === type) }))
  }, [category])

  const selectedAsset = selectedId ? grouped.flatMap((group) => group.assets).find((asset) => asset.id === selectedId) ?? null : null

  return (
    <FlowShell labelId="template-title" onClose={onBack} wide>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-ink">Choose a template</p>
          <h2 id="template-title" className="mt-1 text-[24px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>Pick a starting layout</h2>
          <p className="mt-1 text-[13px] text-charcoal/60">Browse and select a template. Nothing changes until you apply it.</p>
        </div>
        <button type="button" onClick={onChangeCategory} className="shrink-0 text-[12px] font-semibold text-brand-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta">
          Change category
        </button>
      </div>

      <div className="mt-4 max-h-[50vh] overflow-y-auto overscroll-contain rounded-lg border border-softgrey p-3">
        {grouped.map(({ type, assets }) => (
          <div key={type} className="mb-4 last:mb-0">
            <p className="mb-2 text-[11px] font-bold uppercase text-charcoal/45">{type}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {assets.map((asset) => {
                const active = selectedId === asset.id
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedId(asset.id)}
                    aria-pressed={active}
                    className={`flex min-h-11 flex-col items-start gap-1.5 rounded-lg border-2 p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-1 ${active ? "border-brand-cta bg-brand-cta/5" : "border-softgrey hover:border-charcoal/25"}`}
                  >
                    <LiveTemplateThumb asset={asset} />
                    <span className="text-[12px] font-semibold leading-tight">{asset.name}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#16A34A]">Live preview</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedAsset && (
        <p className="mt-3 rounded-lg bg-offwhite px-3 py-2 text-[12px] leading-relaxed text-charcoal/65">
          Applying this template keeps your palette and brand settings. You can undo template changes in the editor.
        </p>
      )}

      <div className="mt-5 flex items-center justify-between">
        <FlowButton onClick={onBack}>Cancel</FlowButton>
        <FlowButton primary disabled={!selectedAsset} onClick={() => selectedAsset && onApply(selectedAsset)}>Apply template</FlowButton>
      </div>
    </FlowShell>
  )
}

function LiveTemplateThumb({ asset }: { asset: TemplateAsset }) {
  const isApp = asset.category === "Application"
  const isComponent = asset.category === "Components"
  const accent = "#20B9FA"
  const surface = isApp ? "#111827" : "#FFFFFF"
  const paper = isApp ? "#1F2937" : "#F3F4F6"

  return (
    <div
      className="flex h-16 w-full flex-col overflow-hidden rounded border border-softgrey/80"
      style={{ background: paper }}
      aria-hidden
    >
      <div className="flex items-center gap-1 px-1.5 py-1" style={{ background: surface }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
        <span className="h-1 flex-1 rounded-full bg-charcoal/10" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-1.5">
        <span className="h-1.5 w-2/3 rounded-full bg-charcoal/15" />
        <span className="h-1 w-1/2 rounded-full bg-charcoal/10" />
        {!isComponent && (
          <span className="mt-auto h-3 w-10 rounded" style={{ background: accent, opacity: 0.85 }} />
        )}
        {isComponent && (
          <div className="mt-auto flex gap-1">
            <span className="h-3 flex-1 rounded" style={{ background: accent, opacity: 0.85 }} />
            <span className="h-3 flex-1 rounded border border-charcoal/15 bg-white" />
          </div>
        )}
      </div>
    </div>
  )
}
