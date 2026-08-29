import type { Theme } from "../lib/color"
import type { TemplateAsset } from "../lib/templateAssets"
import { BrandLogo, BrandSymbol, Editable, PreviewButton } from "./PreviewCtx"

export default function BuiltInTemplatePreview({ asset, theme }: { asset: TemplateAsset; theme: Theme }) {
  if (asset.category === "Application") return <ApplicationTemplate asset={asset} theme={theme} />
  if (asset.category === "Components") return <ComponentTemplate asset={asset} theme={theme} />
  return <WebsiteTemplate asset={asset} theme={theme} />
}

function WebsiteTemplate({ asset, theme }: { asset: TemplateAsset; theme: Theme }) {
  const alternate = asset.variant.toLowerCase().includes("premium") || asset.variant.toLowerCase().includes("editorial") || asset.variant.toLowerCase().includes("bold")
  return (
    <div className="h-full min-h-[620px] w-full overflow-auto" style={{ background: theme.paper, color: theme.ink }}>
      <nav className="flex items-center justify-between border-b px-7 py-5" style={{ background: theme.surface, borderColor: theme.border }}>
        <BrandLogo color={theme.ink} size={17} />
        <div className="flex items-center gap-2">
          {["Overview", "Features", "Pricing"].map((item, index) => (
            <Editable key={item} id={`nav-${index}`} label={`Navigation item: ${item}`} kind="navigation" as="span" color={theme.inkSoft} className="text-sm font-semibold">
              {item}
            </Editable>
          ))}
        </div>
      </nav>

      <main className={`mx-auto grid max-w-6xl gap-10 px-8 py-16 ${alternate ? "lg:grid-cols-[0.82fr_1.18fr]" : "lg:grid-cols-[1.12fr_0.88fr]"}`}>
        <div className={alternate ? "lg:order-2" : ""}>
          <Editable id="eyebrow" label="Eyebrow text" kind="text" as="p" color={theme.accent} className="text-sm font-semibold uppercase">
            {asset.type}
          </Editable>
          <Editable id="heading" label="Page heading" kind="text" as="h1" color={theme.ink} className="mt-4 text-[52px] font-bold leading-[1.04]" style={{ fontFamily: "var(--font-display)" }}>
            {headlineFor(asset)}
          </Editable>
          <Editable id="body" label="Body text" kind="text" as="p" color={theme.inkSoft} className="mt-5 max-w-xl text-base leading-7">
            A clean, token-led starting point that keeps your palette at the centre of every design decision.
          </Editable>
          <div className="mt-8 flex flex-wrap gap-3">
            <PreviewButton id="primary-action" label="Primary button" text="Get started" />
            <Editable id="secondary-action" label="Secondary navigation item" kind="navigation" as="span" color={theme.ink} className="inline-flex items-center text-sm font-semibold">
              View details
            </Editable>
          </div>
        </div>

        <Editable id="feature-card" label="Feature card" kind="card" color={theme.surface} prop="background" className={`flex min-h-80 flex-col ${alternate ? "lg:order-1" : ""}`}>
          <div className="flex items-center justify-between">
            <BrandSymbol color={theme.accent} size={44} rounded={10} />
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: theme.paper, color: theme.inkSoft }}>{asset.variant}</span>
          </div>
          <div className="mt-auto grid grid-cols-3 gap-3">
            {["Colour", "Type", "Space"].map((label, index) => (
              <Editable key={label} id={`mini-card-${index}`} label={`${label} card`} kind="card" color={theme.paper} prop="background" className="flex min-h-28 flex-col justify-end">
                <span className="mb-3 h-2 w-9 rounded-full" style={{ background: index === 1 ? theme.secondary : theme.accent }} />
                <span className="text-sm font-bold">{label}</span>
              </Editable>
            ))}
          </div>
        </Editable>
      </main>
    </div>
  )
}

function ApplicationTemplate({ asset, theme }: { asset: TemplateAsset; theme: Theme }) {
  return (
    <div className="flex h-full min-h-[640px] w-full items-start justify-center overflow-auto p-8" style={{ background: theme.surface }}>
      <div className="flex min-h-[680px] w-full max-w-[390px] flex-col overflow-hidden rounded-[34px] border-[7px] shadow-2xl" style={{ background: theme.paper, borderColor: theme.ink, color: theme.ink }}>
        <div className="flex items-center justify-between px-6 pb-3 pt-6">
          <BrandSymbol color={theme.accent} size={42} rounded={12} />
          <Editable id="profile-nav" label="Navigation item: Profile" kind="navigation" as="span" color={theme.inkSoft} className="text-xs font-semibold">Profile</Editable>
        </div>
        <div className="flex flex-1 flex-col px-6 py-4">
          <Editable id="app-caption" label="App caption" kind="text" as="p" color={theme.inkSoft} className="text-xs">{asset.variant}</Editable>
          <Editable id="app-heading" label="App heading" kind="text" as="h1" color={theme.ink} className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{asset.type}</Editable>

          <Editable id="summary-card" label="Summary card" kind="card" color={theme.surface} prop="background" className="mt-5 flex flex-col">
            <span className="text-xs" style={{ color: theme.inkSoft }}>Weekly summary</span>
            <span className="mt-2 text-3xl font-bold">8,420</span>
            <div className="mt-5 flex h-20 items-end gap-2">
              {[42, 66, 53, 82, 61, 94, 74].map((height, index) => <span key={index} className="flex-1 rounded-t-sm" style={{ height: `${height}%`, background: index === 5 ? theme.secondary : theme.accent }} />)}
            </div>
          </Editable>

          <div className="mt-4 grid gap-3">
            {["Design review", "Team update", "Next milestone"].map((label, index) => (
              <Editable key={label} id={`app-card-${index}`} label={`${label} card`} kind="card" color={theme.surface} prop="background" className="flex items-center">
                <span className="h-9 w-9 rounded-lg" style={{ background: index === 0 ? theme.accent : theme.secondary }} />
                <Editable id={`app-card-text-${index}`} label={`${label} text`} kind="text" as="span" color={theme.ink} className="min-w-0 flex-1 text-sm font-semibold">{label}</Editable>
              </Editable>
            ))}
          </div>
          <div className="mt-auto pt-5"><PreviewButton id="app-action" label="App button" text="Continue" /></div>
        </div>
        <div className="grid grid-cols-3 border-t p-3" style={{ borderColor: theme.border }}>
          {["Home", "Activity", "Settings"].map((label, index) => (
            <Editable key={label} id={`tab-${index}`} label={`Navigation item: ${label}`} kind="navigation" as="span" color={index === 0 ? theme.accent : theme.inkSoft} className="text-center text-[11px] font-semibold">{label}</Editable>
          ))}
        </div>
      </div>
    </div>
  )
}

function ComponentTemplate({ asset, theme }: { asset: TemplateAsset; theme: Theme }) {
  return (
    <div className="h-full min-h-[620px] w-full overflow-auto p-8" style={{ background: theme.surface, color: theme.ink }}>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Editable id="component-caption" label="Component caption" kind="text" as="p" color={theme.accent} className="text-xs font-semibold uppercase">Component collection</Editable>
            <Editable id="component-heading" label="Component heading" kind="text" as="h1" color={theme.ink} className="mt-2 text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{asset.name}</Editable>
          </div>
          <PreviewButton id="component-action" label="Component button" text="Primary action" size="sm" />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Editable id="component-card-primary" label="Primary card" kind="card" color={theme.paper} prop="background" className="flex min-h-72 flex-col">
            <BrandLogo color={theme.ink} size={16} />
            <Editable id="card-heading" label="Card heading" kind="text" as="h2" color={theme.ink} className="mt-8 text-xl font-bold">Build with reusable decisions.</Editable>
            <Editable id="card-body" label="Card body" kind="text" as="p" color={theme.inkSoft} className="mt-2 text-sm leading-6">Tokens keep the same intent connected across every component state.</Editable>
            <div className="mt-auto flex gap-2 pt-6"><PreviewButton id="card-action" label="Card button" text="Confirm" size="sm" /><Editable id="card-nav" label="Navigation item: Cancel" kind="navigation" as="span" color={theme.inkSoft} className="inline-flex items-center text-xs font-semibold">Cancel</Editable></div>
          </Editable>

          <div className="grid gap-4">
            {["Default state", "Active state"].map((label, index) => (
              <Editable key={label} id={`state-card-${index}`} label={`${label} card`} kind="card" color={theme.paper} prop="background" className="flex items-center">
                <span className="h-11 w-11 rounded-lg" style={{ background: index === 0 ? theme.secondary : theme.accent }} />
                <div className="min-w-0 flex-1">
                  <Editable id={`state-heading-${index}`} label={`${label} heading`} kind="text" as="p" color={theme.ink} className="font-bold">{label}</Editable>
                  <Editable id={`state-body-${index}`} label={`${label} body text`} kind="text" as="p" color={theme.inkSoft} className="text-xs">{asset.type} / {asset.variant}</Editable>
                </div>
                <Editable id={`state-nav-${index}`} label={`Navigation item: ${index ? "Active" : "Open"}`} kind="navigation" as="span" color={theme.accent} className="text-xs font-semibold">{index ? "Active" : "Open"}</Editable>
              </Editable>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function headlineFor(asset: TemplateAsset) {
  if (asset.type === "Error Page") return "The page moved. Your design system did not."
  if (asset.type === "Blog") return "Stories with a system behind them."
  if (asset.type === "Ecommerce") return "A storefront built for confident choices."
  if (asset.type === "Dashboard") return "See the signal. Act on what matters."
  return "Turn a strong palette into a complete direction."
}
