import { useState } from "react"
import FlowShell, { FlowButton, FlowProgress } from "./FlowShell"
import { markGuideSeen } from "../../lib/generateFlowStore"

const STAGES = ["Palette", "Typography", "Components", "Finalise"] as const

const CONTENT: Record<typeof STAGES[number], { title: string; body: React.ReactNode }> = {
  Palette: {
    title: "Set your colours",
    body: (
      <>
        <p>Create the colour system for your design. Change colours, assign roles, lock the colours you like, or let HueSet generate a new palette.</p>
        <ul className="mt-3 flex flex-col gap-1.5 pl-5" style={{ listStyle: "disc" }}>
          <li>Click a colour to edit it</li>
          <li>Drag colours to reorder them</li>
          <li>Lock colours before regenerating again</li>
          <li>Assign roles such as Background, Brand, Text and Accent</li>
          <li>Changes appear on the template immediately</li>
        </ul>
      </>
    ),
  },
  Typography: {
    title: "Style your typography",
    body: (
      <>
        <p>Select text directly from the design to customise how it looks.</p>
        <ul className="mt-3 flex flex-col gap-1.5 pl-5" style={{ listStyle: "disc" }}>
          <li>Font family, size and weight</li>
          <li>Bold, italic and underline</li>
          <li>Line height and letter spacing</li>
          <li>Text alignment and colour</li>
        </ul>
        <p className="mt-2 text-charcoal/55">Only relevant controls appear inside the Customise panel.</p>
      </>
    ),
  },
  Components: {
    title: "Customise components",
    body: (
      <>
        <p>Select buttons, cards, navigation and other supported components to quickly adjust their visual style.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-[12px] font-bold">Buttons</p>
            <p className="text-[11px] text-charcoal/55">Style preset, size, corner radius, fill, text and border.</p>
          </div>
          <div>
            <p className="text-[12px] font-bold">Cards</p>
            <p className="text-[11px] text-charcoal/55">Background, radius, border, shadow and padding.</p>
          </div>
          <div>
            <p className="text-[12px] font-bold">Navigation</p>
            <p className="text-[11px] text-charcoal/55">Text/label, colour and active state.</p>
          </div>
        </div>
      </>
    ),
  },
  Finalise: {
    title: "Finalise your design",
    body: (
      <>
        <p>Your design is ready to explore. Make changes, generate new styles, switch templates, check accessibility and export when you are happy.</p>
        <ul className="mt-3 flex flex-col gap-1.5 pl-5" style={{ listStyle: "disc" }}>
          <li><b>Randomise</b> — generate a new coherent style</li>
          <li><b>Change Template</b> — try a different layout</li>
          <li><b>Customise</b> — fine-tune individual elements</li>
          <li><b>Second Opinion</b> — check contrast and accessibility</li>
          <li><b>Full Screen</b> — expand the preview</li>
          <li><b>Export</b> — download your work</li>
        </ul>
      </>
    ),
  },
}

type Props = {
  onStartDesigning: () => void
  onBack: () => void
  onSkip: () => void
}

export default function GuideStep({ onStartDesigning, onBack, onSkip }: Props) {
  const [stage, setStage] = useState(0)

  const finish = () => {
    markGuideSeen()
    onStartDesigning()
  }

  const stageKey = STAGES[stage]
  const { title, body } = CONTENT[stageKey]
  const isLast = stage === STAGES.length - 1

  return (
    <FlowShell labelId="guide-title" onClose={onSkip}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-ink">Quick guide</p>
        <FlowProgress steps={[...STAGES]} current={stage} />
      </div>

      <h2 id="guide-title" className="mt-3 text-[22px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      <div className="mt-3 text-[13.5px] leading-relaxed text-charcoal/70">{body}</div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          <FlowButton onClick={stage === 0 ? onBack : () => setStage(stage - 1)}>Back</FlowButton>
          <FlowButton onClick={() => { markGuideSeen(); onSkip() }}>Skip</FlowButton>
        </div>
        {isLast ? (
          <FlowButton primary autoFocus onClick={finish}>Start Designing</FlowButton>
        ) : (
          <FlowButton primary onClick={() => setStage(stage + 1)}>Next</FlowButton>
        )}
      </div>
    </FlowShell>
  )
}

export function GuideWalkthrough({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage] = useState(0)

  if (!open) return null

  const stageKey = STAGES[stage]
  const { title, body } = CONTENT[stageKey]
  const isLast = stage === STAGES.length - 1

  return (
    <FlowShell labelId="guide-replay-title" onClose={onClose}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-ink">HueSet Guide</p>
        <FlowProgress steps={[...STAGES]} current={stage} />
      </div>

      <h2 id="guide-replay-title" className="mt-3 text-[22px] font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      <div className="mt-3 text-[13.5px] leading-relaxed text-charcoal/70">{body}</div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          {stage > 0 && <FlowButton onClick={() => setStage(stage - 1)}>Back</FlowButton>}
          <FlowButton onClick={onClose}>Close</FlowButton>
        </div>
        {isLast ? (
          <FlowButton primary autoFocus onClick={onClose}>Done</FlowButton>
        ) : (
          <FlowButton primary onClick={() => setStage(stage + 1)}>Next</FlowButton>
        )}
      </div>
    </FlowShell>
  )
}
