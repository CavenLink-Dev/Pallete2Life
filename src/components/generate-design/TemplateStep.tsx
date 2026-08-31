import { useMemo, useState } from "react"
import { templateAssets, type TemplateAsset, type TemplateCategory } from "../../lib/templateAssets"
import FlowShell, { FlowButton } from "./FlowShell"

type Props = {
  category: TemplateCategory
  onContinue: (asset: TemplateAsset) => void
  onBack: () => void
  onChangeCategory: () => void
}

export default function TemplateStep({ category, onContinue, onBack, onChangeCategory }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const assets = templateAssets.filter((a) => a.category === category)
    const types = Array.from(new Set(assets.map((a) => a.type)))
    return types.map((type) => ({ type, assets: assets.filter((a) => a.type === type) }))
  }, [category])

  const selectedAsset = selectedId ? templateAssets.find((a) => a.id === selectedId) ?? null : null

  return (
    <FlowShell labelId="template-title" onClose={onBack} wide>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#20B9FA]">Step 2</p>
          <h2 id="template-title" className="mt-1 text-[24px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>Choose a template</h2>
          <p className="mt-1 text-[13px] text-charcoal/60">Start with a design that is already structured, then customise the visual style.</p>
        </div>
        <button type="button" onClick={onChangeCategory} className="shrink-0 text-[12px] font-semibold text-[#20B9FA] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA]">
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
                    className={`flex flex-col items-start gap-1.5 rounded-lg border-2 p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-1 ${active ? "border-[#20B9FA] bg-[#20B9FA]/5" : "border-softgrey hover:border-charcoal/25"}`}
                  >
                    <TemplateThumbSmall asset={asset} />
                    <span className="text-[12px] font-semibold leading-tight">{asset.name}</span>
                    <span className="text-[10px] text-charcoal/50">{asset.type}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <FlowButton onClick={onBack}>Back</FlowButton>
        <FlowButton primary disabled={!selectedAsset} onClick={() => selectedAsset && onContinue(selectedAsset)}>Continue</FlowButton>
      </div>
    </FlowShell>
  )
}

function TemplateThumbSmall({ asset }: { asset: TemplateAsset }) {
  if (asset.renderer === "svg" && asset.thumbnail && !asset.thumbnail.startsWith("builtin://")) {
    return <img src={asset.thumbnail} alt="" className="h-16 w-full rounded object-cover object-top" loading="lazy" />
  }
  const isApp = asset.category === "Application"
  return (
    <div className={`flex h-16 w-full items-center justify-center rounded bg-offwhite ${isApp ? "" : ""}`}>
      <span className="text-[10px] font-semibold text-charcoal/35">{asset.variant}</span>
    </div>
  )
}
