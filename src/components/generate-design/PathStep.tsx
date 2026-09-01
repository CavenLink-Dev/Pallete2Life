import FlowShell, { FlowButton } from "./FlowShell"

export type DesignPath = "quick" | "full"

type Props = {
  onContinue: (path: DesignPath) => void
  onCancel: () => void
}

const OPTIONS: {
  path: DesignPath
  title: string
  timing: string
  description: string
  primary?: boolean
}[] = [
  {
    path: "quick",
    title: "Preview My Palette",
    timing: "About 30 seconds",
    description: "Pick colours, assign roles, and see them on three live previews. Best for a fast palette check.",
    primary: true,
  },
  {
    path: "full",
    title: "Build a Full Design System",
    timing: "About 3–5 minutes · Beta",
    description: "Choose a template, customise typography and components, then export tokens.",
  },
]

export default function PathStep({ onContinue, onCancel }: Props) {
  return (
    <FlowShell labelId="path-title" onClose={onCancel}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-ink">Get started</p>
      <h2 id="path-title" className="mt-1 text-[24px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
        How would you like to begin?
      </h2>
      <p className="mt-2 text-[14px] text-charcoal/65">Both paths are skippable later — you can switch anytime from the home page.</p>

      <div className="mt-5 grid gap-3">
        {OPTIONS.map((option) => (
          <button
            key={option.path}
            type="button"
            onClick={() => onContinue(option.path)}
            className={`flex min-h-11 flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2 ${
              option.primary
                ? "border-brand-cta bg-brand-cta/5 hover:bg-brand-cta/10"
                : "border-softgrey hover:border-charcoal/25"
            }`}
          >
            <span className="text-[15px] font-bold">{option.title}</span>
            <span className="text-[12px] font-semibold text-brand-ink">{option.timing}</span>
            <span className="text-[12px] leading-relaxed text-charcoal/60">{option.description}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <FlowButton onClick={onCancel}>Cancel</FlowButton>
      </div>
    </FlowShell>
  )
}
