import { useState } from "react"
import type { TemplateCategory } from "../../lib/templateAssets"
import FlowShell, { FlowButton } from "./FlowShell"

type CategoryOption = { label: string; category: TemplateCategory; description: string; icon: React.ReactNode }

const OPTIONS: CategoryOption[] = [
  { label: "Website", category: "Website", description: "Landing pages, pricing, authentication, and marketing layouts.", icon: <WebIcon /> },
  { label: "App", category: "Application", description: "Mobile screens such as dashboards, messaging, and settings.", icon: <AppIcon /> },
  { label: "Components", category: "Components", description: "Buttons, cards, forms, and other UI building blocks.", icon: <OtherIcon /> },
]

type Props = {
  onContinue: (category: TemplateCategory) => void
  onBack: () => void
}

export default function CategoryStep({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState<TemplateCategory | null>(null)

  return (
    <FlowShell labelId="category-title" onClose={onBack}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#20B9FA]">Full design system</p>
      <h2 id="category-title" className="mt-1 text-[24px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>What do you want to design?</h2>
      <p className="mt-2 text-[14px] text-charcoal/65">Filter templates by format. This only narrows the list — it won&apos;t change your current work.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((option) => {
          const active = selected === option.category
          return (
            <button
              key={option.category}
              type="button"
              onClick={() => setSelected(option.category)}
              aria-pressed={active}
              className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20B9FA] focus-visible:ring-offset-2 ${active ? "border-[#20B9FA] bg-[#20B9FA]/5" : "border-softgrey hover:border-charcoal/25"}`}
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-offwhite text-charcoal/50">{option.icon}</span>
              <span className="text-[14px] font-bold">{option.label}</span>
              <span className="text-[12px] leading-relaxed text-charcoal/60">{option.description}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <FlowButton onClick={onBack}>Cancel</FlowButton>
        <FlowButton primary disabled={!selected} onClick={() => selected && onContinue(selected)}>Continue</FlowButton>
      </div>
    </FlowShell>
  )
}

function WebIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
}
function AppIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M12 18h.01" /></svg>
}
function OtherIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
}
