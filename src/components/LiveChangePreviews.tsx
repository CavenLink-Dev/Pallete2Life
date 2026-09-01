import { readableOn } from "../lib/color"
import type { Brand } from "./PreviewCtx"

export type LivePreviewKind = "website" | "app" | "components"
export type LiveRole = "background" | "surface" | "button" | "text" | "border" | "accent"
export type LiveRoleColors = Record<LiveRole, string>

export function LiveChangePreview({ kind, colours, brand }: { kind: LivePreviewKind; colours: LiveRoleColors; brand: Brand }) {
  if (kind === "app") return <BasicApp colours={colours} brand={brand} />
  if (kind === "components") return <BasicComponents colours={colours} brand={brand} />
  return <BasicWebsite colours={colours} brand={brand} />
}

function BasicWebsite({ colours, brand }: { colours: LiveRoleColors; brand: Brand }) {
  const buttonText = readableOn(colours.button)
  return (
    <div className="min-h-[500px]" style={{ background: colours.background, color: colours.text }}>
      <nav className="flex items-center justify-between border-b px-5 py-4 sm:px-8" style={{ background: colours.surface, borderColor: colours.border }}>
        <BrandName brand={brand} colour={colours.text} accent={colours.accent} />
        <div className="flex items-center gap-4 text-xs font-semibold opacity-65 sm:text-sm">
          <span>Work</span><span>About</span><span>Contact</span>
        </div>
      </nav>
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: colours.accent }}>Designed to move</span>
          <h3 className="mt-3 max-w-xl text-[36px] font-bold leading-[1.08] sm:text-[52px]" style={{ fontFamily: "var(--font-display)" }}>
            A clear idea deserves a clear launch.
          </h3>
          <p className="mt-5 max-w-lg text-sm leading-7 opacity-65 sm:text-base">
            Build a focused experience with a palette that stays consistent from the first screen to the final action.
          </p>
          <div className="mt-7 inline-flex rounded-lg px-5 py-3 text-sm font-bold" style={{ background: colours.button, color: buttonText }} aria-hidden>
            Start a project
          </div>
        </div>
        <div className="grid min-h-64 grid-cols-2 gap-3 rounded-lg border p-3" style={{ background: colours.surface, borderColor: colours.border }}>
          <div className="rounded-md" style={{ background: colours.accent }} />
          <div className="grid gap-3">
            <div className="rounded-md border" style={{ background: colours.background, borderColor: colours.border }} />
            <div className="rounded-md" style={{ background: colours.button }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function BasicApp({ colours, brand }: { colours: LiveRoleColors; brand: Brand }) {
  return (
    <div className="flex min-h-[540px] items-center justify-center p-6 sm:p-10" style={{ background: colours.background }}>
      <div className="w-full max-w-[310px] overflow-hidden rounded-[28px] border-[6px] shadow-xl" style={{ background: colours.surface, borderColor: colours.text, color: colours.text }}>
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <BrandIcon brand={brand} accent={colours.accent} size={38} />
          <span className="h-9 w-9 rounded-full border" style={{ borderColor: colours.border, background: colours.background }} />
        </div>
        <div className="px-5 py-3">
          <p className="text-xs opacity-50">Welcome back</p>
          <h3 className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{brand.name || "Your company"}</h3>
          <div className="mt-5 rounded-lg p-4" style={{ background: colours.button, color: readableOn(colours.button) }}>
            <p className="text-xs opacity-70">This month</p>
            <p className="mt-1 text-3xl font-bold">$8,420</p>
            <div className="mt-5 flex h-14 items-end gap-1.5">
              {[38, 62, 46, 78, 56, 92, 72].map((height, index) => <span key={index} className="flex-1 rounded-t-sm" style={{ height: `${height}%`, background: index === 5 ? colours.accent : "currentColor", opacity: index === 5 ? 1 : 0.3 }} />)}
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {["Design subscription", "Cloud storage", "Team workspace"].map((label, index) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border px-3 py-3" style={{ borderColor: colours.border, background: colours.background }}>
                <span className="h-8 w-8 rounded-md" style={{ background: index === 0 ? colours.accent : colours.button }} />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold">{label}</span>
                <span className="text-xs opacity-55">${[24, 12, 18][index]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 border-t px-4 py-3 text-center text-[10px] font-semibold" style={{ borderColor: colours.border }}>
          <span style={{ color: colours.accent }}>Home</span><span className="opacity-45">Activity</span><span className="opacity-45">Profile</span>
        </div>
      </div>
    </div>
  )
}

function BasicComponents({ colours, brand }: { colours: LiveRoleColors; brand: Brand }) {
  const buttonText = readableOn(colours.button)
  return (
    <div className="min-h-[500px] p-5 sm:p-10" style={{ background: colours.background, color: colours.text }}>
      <div className="mx-auto max-w-4xl">
        <BrandName brand={brand} colour={colours.text} accent={colours.accent} />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-lg border p-5" style={{ background: colours.surface, borderColor: colours.border }}>
            <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Create project</h3>
            <label className="mt-5 block text-xs font-semibold opacity-60">Project name</label>
            <div className="mt-2 w-full rounded-md border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: colours.border, color: colours.text }}>New direction</div>
            <label className="mt-4 block text-xs font-semibold opacity-60">Workspace</label>
            <div className="mt-2 flex items-center justify-between rounded-md border px-3 py-2.5 text-sm" style={{ borderColor: colours.border }}><span>Design team</span><span className="opacity-45">⌄</span></div>
            <div className="mt-5 w-full rounded-md px-4 py-3 text-center text-sm font-bold" style={{ background: colours.button, color: buttonText }} aria-hidden>Create project</div>
          </section>
          <div className="space-y-4">
            <section className="rounded-lg border p-5" style={{ background: colours.surface, borderColor: colours.border }}>
              <div className="flex items-start gap-3">
                <BrandIcon brand={brand} accent={colours.accent} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">Ready to publish</p>
                  <p className="mt-1 text-sm leading-6 opacity-55">Your latest changes are saved and ready for the team.</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: colours.background }}><span className="block h-full w-4/5 rounded-full" style={{ background: colours.accent }} /></div>
            </section>
            <section className="rounded-lg border p-5" style={{ background: colours.surface, borderColor: colours.border }}>
              <div className="flex flex-wrap gap-2">
                {["Active", "Review", "Draft"].map((label, index) => <span key={label} className="rounded-full border px-3 py-1 text-xs font-semibold" style={index === 0 ? { background: colours.accent, borderColor: colours.accent, color: readableOn(colours.accent) } : { borderColor: colours.border }}>{label}</span>)}
              </div>
              <div className="mt-5 flex gap-2">
                <div className="rounded-md px-4 py-2.5 text-sm font-bold" style={{ background: colours.button, color: buttonText }} aria-hidden>Primary</div>
                <div className="rounded-md border px-4 py-2.5 text-sm font-bold" style={{ borderColor: colours.border }} aria-hidden>Secondary</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandName({ brand, colour, accent }: { brand: Brand; colour: string; accent: string }) {
  if (brand.logo) return <img src={brand.logo} alt={`${brand.name} logo`} className="max-h-9 max-w-40 object-contain" />
  return (
    <span className="flex min-w-0 items-center gap-2 text-sm font-bold" style={{ color: colour, fontFamily: "var(--font-display)" }}>
      <BrandIcon brand={brand} accent={accent} size={28} />
      <span className="truncate">{brand.name || "Your company"}</span>
    </span>
  )
}

function BrandIcon({ brand, accent, size }: { brand: Brand; accent: string; size: number }) {
  if (brand.symbol) return <img src={brand.symbol} alt={`${brand.name} app icon`} className="shrink-0 object-cover" style={{ width: size, height: size, borderRadius: Math.min(9, size / 4) }} />
  return <span className="flex shrink-0 items-center justify-center text-xs font-bold text-white" style={{ width: size, height: size, borderRadius: Math.min(9, size / 4), background: accent }}>{(brand.name || "P").trim().charAt(0).toUpperCase()}</span>
}
