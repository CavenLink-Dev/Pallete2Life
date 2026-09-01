type Props = {
  onClose: () => void
  className?: string
}

export default function InspectorShell({ onClose, className = "" }: Props) {
  return (
    <aside className={`flex min-h-0 flex-col bg-white ${className}`} aria-label="Inspector">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-softgrey px-3">
        <h2 className="text-[13px] font-bold">Inspector</h2>
        <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-[7px] text-charcoal/55 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta" aria-label="Collapse inspector" title="Collapse inspector">
          <CollapseIcon />
        </button>
      </header>
      <div className="p-4">
        <p className="text-[12px] leading-5 text-charcoal/55">Click any element in the preview to edit its tokens.</p>
      </div>
    </aside>
  )
}

const CollapseIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /><path d="M20 4v16" /></svg>
