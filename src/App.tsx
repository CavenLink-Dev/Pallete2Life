import { useMemo, useState } from "react"
import { BRAND, deriveTheme, randomHex, readableOn, uid, withAlpha, type Swatch } from "./lib/color"
import PalettePanel from "./components/PalettePanel"
import {
  BUTTON_STYLES,
  ButtonLab,
  DEFAULT_BUTTON_PROPS,
  STYLE_META,
  paletteToTrio,
  styleThumb,
  type ButtonProps,
  type ButtonStyle,
} from "./components/ButtonPreview"
import StyleStrip from "./components/StyleStrip"
import {
  GROUPS,
  TemplateThumb,
  renderComponentPreview,
  type GroupKey,
} from "./components/Previews"
import { PreviewProvider, type Brand, type PreviewCtxValue } from "./components/PreviewCtx"
import BrandUpload from "./components/BrandUpload"

type Selection = { group: GroupKey; sub: string }

const START_NAMES = ["Primary", "Secondary", "Tertiary", "Quaternary", "Quinary", "Senary"]

const initialPalette: Swatch[] = [
  { id: uid(), name: "Primary", hex: BRAND.brand },
  { id: uid(), name: "Secondary", hex: BRAND.charcoal },
  { id: uid(), name: "Tertiary", hex: BRAND.offwhite },
]

const GROUP_ICONS: Record<GroupKey, string> = { website: "▦", mobile: "▯", components: "◉" }

export default function App() {
  const [palette, setPalette] = useState<Swatch[]>(initialPalette)
  const [sel, setSel] = useState<Selection>({ group: "website", sub: "landing" })
  const [tplBySub, setTplBySub] = useState<Record<string, string>>({})
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>("depth")
  const [buttonProps, setButtonProps] = useState<ButtonProps>(DEFAULT_BUTTON_PROPS)

  // Edit mode: click any element in a preview to bind it to a palette colour.
  const [editMode, setEditMode] = useState(false)
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [assignTarget, setAssignTarget] = useState<{ id: string; label: string } | null>(null)

  const theme = useMemo(() => deriveTheme(palette), [palette])
  const trio = useMemo(() => paletteToTrio(palette), [palette])

  // Brand assets shown inside previews (logo / app icon), editable via the Brand modal.
  const [brand, setBrand] = useState<Brand>({ name: "HueFrame", logo: null, symbol: null })
  const [brandOpen, setBrandOpen] = useState(false)

  const currentGroup = GROUPS.find((g) => g.key === sel.group)!
  const currentSub = currentGroup.subs.find((s) => s.key === sel.sub) ?? currentGroup.subs[0]
  const templates = currentSub.templates
  const tpl = tplBySub[sel.sub] ?? templates[0]?.key ?? ""
  const isButton = sel.group === "components" && sel.sub === "button"

  const change = (id: string, hex: string) => setPalette((p) => p.map((s) => (s.id === id ? { ...s, hex } : s)))
  const add = () =>
    setPalette((p) => [...p, { id: uid(), name: START_NAMES[p.length] ?? `Colour ${p.length + 1}`, hex: randomHex() }])
  const remove = (id: string) =>
    setPalette((p) => (p.length > 1 ? p.filter((s) => s.id !== id) : p))
  const randomize = () => setPalette((p) => p.map((s) => (s.locked ? s : { ...s, hex: randomHex() })))
  const toggleLock = (id: string) => setPalette((p) => p.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s)))

  const selectTpl = (key: string) => setTplBySub((m) => ({ ...m, [sel.sub]: key }))

  // Button lab maps the first swatches onto the active style's parts.
  const roleLabels = isButton ? STYLE_META[buttonStyle].roles.map((r) => r.part) : undefined

  const ctx: PreviewCtxValue = {
    editMode,
    assignments,
    requestAssign: (id, label) => setAssignTarget({ id, label }),
    roleColor: (name) => palette.find((s) => s.name === name)?.hex,
    brand,
    buttonStyle,
    buttonProps,
    trio,
  }

  return (
    <div className="flex h-full flex-col bg-offwhite text-charcoal">
      {/* ---------- Header ---------- */}
      <header className="flex items-center justify-between gap-3 border-b border-softgrey bg-white/70 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: BRAND.brand }}>
            <span className="text-white" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>H</span>
          </div>
          <div className="leading-tight">
            <h1 className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Hue<span style={{ color: BRAND.brand }}>Frame</span>
            </h1>
            <p className="text-[11px] text-charcoal/50">See your colours behave across real products</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setBrandOpen(true)}
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors"
          style={{ background: "#fff", color: BRAND.medgrey, border: `1px solid ${BRAND.softgrey}` }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.5-4.5L7 20" /></svg>
          Brand
        </button>
        <button
          type="button"
          onClick={() => setEditMode((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors"
          style={editMode
            ? { background: BRAND.brand, color: "#fff" }
            : { background: "#fff", color: BRAND.medgrey, border: `1px solid ${BRAND.softgrey}` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: editMode ? "#fff" : BRAND.brand }} />
          {editMode ? "Editing — click any element" : "Edit elements"}
        </button>
        </div>
      </header>

      {/* ---------- Palette section (prominent) ---------- */}
      <section className="border-b border-softgrey bg-white px-6 py-5">
        <PalettePanel
          palette={palette}
          onChange={change}
          onAdd={add}
          onRemove={remove}
          onRandomize={randomize}
          onToggleLock={toggleLock}
          brand={BRAND.brand}
          roleLabels={roleLabels}
          caption={
            isButton
              ? `Each colour drives one part of the ${STYLE_META[buttonStyle].label.toLowerCase()} button — edit it to customise.`
              : "Edit any colour and watch it flow through every preview."
          }
        />
      </section>

      {/* ---------- Body ---------- */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[210px_1fr]">
        {/* navigation rail */}
        <aside className="hidden flex-col gap-4 overflow-auto border-r border-softgrey bg-white/60 p-3 lg:flex">
          {GROUPS.map((g) => (
            <div key={g.key}>
              <p className="flex items-center gap-2 px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-charcoal/40">
                <span>{GROUP_ICONS[g.key]}</span>{g.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {g.subs.map((s) => {
                  const on = sel.group === g.key && sel.sub === s.key
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSel({ group: g.key, sub: s.key })}
                      className="rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors"
                      style={on ? { background: withAlpha(BRAND.brand, 0.12), color: BRAND.brandDark } : { color: BRAND.medgrey }}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* stage */}
        <main className="min-w-0 overflow-auto p-4 sm:p-8">
          {/* mobile selector */}
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {GROUPS.flatMap((g) => g.subs.map((s) => ({ g, s }))).map(({ g, s }) => {
              const on = sel.group === g.key && sel.sub === s.key
              return (
                <button
                  key={g.key + s.key}
                  type="button"
                  onClick={() => setSel({ group: g.key, sub: s.key })}
                  className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold"
                  style={on ? { background: BRAND.brand, color: "#fff" } : { background: "#fff", color: BRAND.medgrey, border: `1px solid ${BRAND.softgrey}` }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>

          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-charcoal/40">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND.brand }} />
              Live preview · driven by your palette
            </div>

            {/* main preview */}
            <PreviewProvider value={ctx}>
              {isButton ? (
                <div className="h-[420px] rounded-3xl border border-softgrey bg-white shadow-sm sm:h-[52vh] sm:min-h-[420px]">
                  <ButtonLab colors={trio} style={buttonStyle} props={buttonProps} setProps={setButtonProps} />
                </div>
              ) : (
                <div key={sel.sub + tpl} className="animate-pop-in h-[440px] min-h-[400px] overflow-hidden rounded-3xl border border-softgrey bg-white shadow-sm sm:h-[56vh] sm:min-h-[440px]">
                  {renderComponentPreview(sel.group, sel.sub, tpl, theme)}
                </div>
              )}
            </PreviewProvider>

            {/* secondary style / template selector */}
            {isButton ? (
              <StyleStrip
                title="Button style"
                active={buttonStyle}
                onSelect={(k) => setButtonStyle(k as ButtonStyle)}
                items={BUTTON_STYLES.map((s) => ({ key: s, label: STYLE_META[s].label, thumb: styleThumb(s, trio) }))}
              />
            ) : (
              templates.length > 1 && (
                <StyleStrip
                  title="Template"
                  active={tpl}
                  onSelect={selectTpl}
                  items={templates.map((t) => ({ key: t.key, label: t.label, thumb: <TemplateThumb theme={theme} layout={t.layout} /> }))}
                />
              )
            )}
          </div>
        </main>
      </div>

      {/* ---------- Brand assets modal ---------- */}
      {brandOpen && (
        <BrandUpload brand={brand} onChange={setBrand} onClose={() => setBrandOpen(false)} />
      )}

      {/* ---------- Assign-colour modal (edit mode) ---------- */}
      {assignTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4"
          onClick={() => setAssignTarget(null)}
        >
          <div
            className="animate-pop-in w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Assign a colour</p>
            <p className="mt-0.5 text-xs text-charcoal/55">Bind “{assignTarget.label}” to one of your palette colours.</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {palette.map((s) => {
                const on = assignments[assignTarget.id] === s.name
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setAssignments((a) => ({ ...a, [assignTarget.id]: s.name }))
                      setAssignTarget(null)
                    }}
                    className="flex flex-col gap-1.5 rounded-xl p-1.5 text-left transition-transform hover:-translate-y-0.5"
                    style={{ outline: on ? `2px solid ${BRAND.brand}` : "1px solid " + BRAND.softgrey }}
                  >
                    <span className="h-10 w-full rounded-lg" style={{ background: s.hex, boxShadow: `inset 0 0 0 1px ${withAlpha(readableOn(s.hex), 0.12)}` }} />
                    <span className="text-[11px] font-semibold text-charcoal/70">{s.name}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setAssignments((a) => {
                    const next = { ...a }
                    delete next[assignTarget.id]
                    return next
                  })
                  setAssignTarget(null)
                }}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-charcoal/55 hover:text-charcoal"
              >
                Reset to default
              </button>
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                className="rounded-lg border border-softgrey px-3 py-2 text-xs font-semibold text-charcoal/70 hover:text-charcoal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
