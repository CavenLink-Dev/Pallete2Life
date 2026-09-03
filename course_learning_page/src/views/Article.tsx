import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Block, Page } from "../course/content";
import { pages, BRAND } from "../course/content";
import { Icon, Check } from "../components/ui";

// ---- inline formatting: **bold** and `code` -------------------------------
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      out.push(
        <strong key={k++} className="font-600 text-heading">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else {
      out.push(
        <code
          key={k++}
          className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-ink"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ---- interactive demos ----------------------------------------------------
function EmphasisDemo() {
  const [level, setLevel] = useState(65);
  const size = 15 + (level / 100) * 33;
  const weight = level > 55 ? 700 : level > 30 ? 600 : 500;
  return (
    <figure className="my-7 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid min-h-52 place-items-center bg-surface-2/60 p-8">
        <div className="max-w-sm text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Weekly digest</p>
          <h4
            className="mt-2 font-display leading-[1.08] text-heading transition-all duration-200"
            style={{ fontSize: `${size}px`, fontWeight: weight }}
          >
            Design decisions that ship
          </h4>
          <p className="mt-3 text-[14px] leading-relaxed text-body">
            The same content, re-ranked. Only the emphasis of the headline changes — watch how much the
            hierarchy shifts.
          </p>
        </div>
      </div>
      <figcaption className="flex items-center gap-4 border-t border-border px-5 py-4">
        <label htmlFor="emph" className="text-[13px] font-600 text-heading">
          Emphasis
        </label>
        <input
          id="emph"
          type="range"
          min={0}
          max={100}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="h-1.5 flex-1 accent-[var(--color-ink)]"
        />
        <span className="w-10 text-right font-mono text-[12px] text-muted">{level}</span>
      </figcaption>
    </figure>
  );
}

const CONTRAST = [
  { label: "Body on background", fg: "#d9d9d9", bg: "#1f2329", ratio: "11.2:1", pass: "Passes AA & AAA" },
  { label: "White on card", fg: "#ffffff", bg: "#323944", ratio: "11.4:1", pass: "Passes AA & AAA" },
  { label: "Accent on card", fg: "#13a8e7", bg: "#323944", ratio: "4.6:1", pass: "Passes AA" },
  { label: "Button fill as text", fg: "#0b7baa", bg: "#1f2329", ratio: "2.6:1", pass: "Fails — fill only" },
];

function ContrastDemo() {
  const [i, setI] = useState(0);
  const c = CONTRAST[i];
  const fails = c.pass.startsWith("Fails");
  return (
    <figure className="my-7 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid min-h-40 place-items-center p-8 transition-colors" style={{ background: c.bg }}>
        <p className="text-center text-[22px] font-600" style={{ color: c.fg }}>
          The quick brown fox reads clearly.
        </p>
      </div>
      <div className="border-t border-border px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {CONTRAST.map((opt, idx) => (
            <button
              key={opt.label}
              onClick={() => setI(idx)}
              aria-pressed={i === idx}
              className={`rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${
                i === idx
                  ? "border-ink bg-ink/8 font-600 text-ink"
                  : "border-border text-body hover:border-border-strong"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[13px]">
          <span className="font-mono font-600 text-heading">{c.ratio}</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-600 ${
              fails ? "bg-surface-2 text-body" : "bg-ink/15 text-ink"
            }`}
          >
            <Icon name={fails ? "TriangleAlert" : "CircleCheck"} className="h-3.5 w-3.5" />
            {c.pass}
          </span>
        </div>
      </div>
    </figure>
  );
}

// ---- block renderer -------------------------------------------------------
function BlockView({ block }: { block: Block }) {
  switch (block.k) {
    case "lead":
      return <p className="mb-7 text-[19px] font-400 leading-[1.6] text-body">{inline(block.text)}</p>;
    case "p":
      return <p className="my-5 text-[16px] font-400 leading-[1.7] text-body">{inline(block.text)}</p>;
    case "h2":
      return (
        <h2
          id={slug(block.text)}
          className="mt-14 scroll-mt-20 border-t border-border pt-8 font-display text-[24px] font-700 leading-[1.2] tracking-[-0.01em] text-balance text-heading"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-8 font-display text-[17px] font-600 leading-snug text-heading">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="my-4 space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[15.5px] leading-relaxed text-body">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
              <span>{inline(it)}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="my-4 space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[15.5px] leading-relaxed text-body">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink/10 font-mono text-[11px] font-600 text-ink">
                {i + 1}
              </span>
              <span>{inline(it)}</span>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <figure className="my-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="bg-surface-2">
                {block.head.map((h) => (
                  <th
                    key={h}
                    className="border-b border-border px-4 py-2.5 text-left font-600 text-heading"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="odd:bg-surface even:bg-surface-2/40">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`border-b border-border px-4 py-2.5 align-top leading-snug ${
                        j === 0 ? "font-600 text-heading" : "text-body"
                      }`}
                    >
                      {inline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && (
            <figcaption className="border-t border-border bg-surface px-4 py-2.5 text-[12px] font-500 leading-snug tracking-[0.01em] text-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "code":
      return (
        <div className="my-6 overflow-hidden rounded-xl border border-border bg-charcoal">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">
              {block.lang}
            </span>
          </div>
          <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed">
            <code className="font-mono text-white/90">{block.code}</code>
          </pre>
        </div>
      );
    case "checklist":
      return (
        <div className="my-5 rounded-xl border border-border bg-surface p-5">
          <p className="flex items-center gap-2 font-600 text-heading">
            <Icon name="ShieldCheck" className="h-4 w-4 text-ink" />
            {block.title}
          </p>
          <ul className="mt-3 space-y-2">
            {block.items.map((it, i) => (
              <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed text-body">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border border-ink/40">
                  <Check className="h-3 w-3 text-ink" />
                </span>
                <span>{inline(it)}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "callout": {
      const tone =
        block.tone === "warn"
          ? { icon: "TriangleAlert", cls: "border-[#febc2e]/30 bg-[#febc2e]/10", ic: "text-[#febc2e]" }
          : block.tone === "note"
            ? { icon: "Info", cls: "border-border bg-surface-2/70", ic: "text-ink" }
            : { icon: "Sparkles", cls: "border-ink/25 bg-ink/10", ic: "text-ink" };
      return (
        <div className={`my-6 flex gap-3 rounded-xl border p-5 ${tone.cls}`}>
          <Icon name={tone.icon} className={`mt-0.5 h-5 w-5 shrink-0 ${tone.ic}`} />
          <div>
            {block.title && <p className="font-600 text-heading">{block.title}</p>}
            <p className="mt-1 text-[15px] leading-relaxed text-body">{inline(block.text)}</p>
          </div>
        </div>
      );
    }
    case "links":
      return (
        <ul className="my-5 grid gap-2 sm:grid-cols-2">
          {block.items.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-[14px] text-body transition-colors hover:border-ink/50 hover:text-ink"
              >
                <Icon name="BookMarked" className="h-4 w-4 shrink-0 text-ink" />
                <span className="flex-1">{l.label}</span>
                <Icon name="ArrowUpRight" className="h-4 w-4 shrink-0 text-muted" />
              </a>
            </li>
          ))}
        </ul>
      );
    case "flow":
      return (
        <div className="my-6 flex flex-wrap items-center gap-x-1.5 gap-y-2.5">
          {block.steps.map((s, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] font-500 text-heading">
                {s}
              </span>
              {i < block.steps.length - 1 && <Icon name="ArrowRight" className="h-3.5 w-3.5 text-muted" />}
            </span>
          ))}
        </div>
      );
    case "stat":
      return (
        <div className="my-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {block.items.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-display text-[30px] font-700 leading-none text-ink">{s.value}</p>
              <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      );
    case "interactive":
      return block.kind === "emphasis" ? <EmphasisDemo /> : <ContrastDemo />;
    default:
      return null;
  }
}

// ---- on-page TOC ----------------------------------------------------------
function Toc({ page }: { page: Page }) {
  const headings = useMemo(
    () => page.blocks.filter((b): b is Extract<Block, { k: "h2" }> => b.k === "h2"),
    [page],
  );
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    setActive("");
    const els = headings
      .map((h) => document.getElementById(slug(h.text)))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-72px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;
  return (
    <aside className="sticky top-20 hidden h-fit w-56 shrink-0 xl:block">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">On this page</p>
      <ul className="space-y-1 border-l border-border">
        {headings.map((h) => {
          const id = slug(h.text);
          const on = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`-ml-px block border-l-2 py-1 pl-3 text-[13px] leading-snug transition-colors ${
                  on ? "border-ink font-600 text-ink" : "border-transparent text-muted hover:text-body"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default function Article({
  page,
  ordered,
  onNavigate,
  completed,
  onToggleComplete,
}: {
  page: Page;
  ordered: string[];
  onNavigate: (id: string) => void;
  completed: boolean;
  onToggleComplete: () => void;
}) {
  const idx = ordered.indexOf(page.id);
  const prev = idx > 0 ? pages[ordered[idx - 1]] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? pages[ordered[idx + 1]] : null;

  return (
    <div className="flex gap-10 px-5 py-10 lg:px-10 xl:px-14">
      <article className="min-w-0 max-w-[760px] flex-1">
        <h1 className="font-display text-[clamp(2.15rem,4.8vw,3.15rem)] font-700 leading-[1.06] tracking-[-0.02em] text-balance text-heading">
          {page.title}
        </h1>
        <p className="mt-5 max-w-[58ch] text-[18px] font-400 leading-[1.65] text-pretty text-muted">
          {page.summary}
        </p>

        {page.id === "overview" && (
          <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-border pb-8">
            <button
              onClick={() => onNavigate("overview")}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-[14px] font-600 text-body transition-colors hover:border-border-strong hover:text-heading"
            >
              <Icon name="BookOpen" className="h-4 w-4" />
              Learn the Basics
            </button>
          </div>
        )}

        <div className="mt-8">
          {page.blocks.map((b, i) => (
            <BlockView key={i} block={b} />
          ))}
        </div>

        {/* prev / next */}
        <nav className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
          {prev ? (
            <button
              onClick={() => onNavigate(prev.id)}
              className="group flex flex-col rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-ink/50"
            >
              <span className="flex items-center gap-1.5 text-[12px] text-muted">
                <Icon name="ArrowRight" className="h-3.5 w-3.5 rotate-180" />
                Previous
              </span>
              <span className="mt-1 font-600 text-heading group-hover:text-ink">{prev.title}</span>
            </button>
          ) : (
            <span />
          )}
          {next && (
            <button
              onClick={() => onNavigate(next.id)}
              className="group flex flex-col rounded-xl border border-border bg-surface p-4 text-right transition-colors hover:border-ink/50 sm:col-start-2"
            >
              <span className="flex items-center justify-end gap-1.5 text-[12px] text-muted">
                Next
                <Icon name="ArrowRight" className="h-3.5 w-3.5" />
              </span>
              <span className="mt-1 font-600 text-heading group-hover:text-ink">{next.title}</span>
            </button>
          )}
        </nav>

        <footer className="mt-10 text-[13px] leading-relaxed text-muted">
          Questions about the course? Email{" "}
          <a href={`mailto:${BRAND.supportEmail}`} className="text-ink hover:underline">
            {BRAND.supportEmail}
          </a>
          . Style export is coming soon.
        </footer>
      </article>

      <Toc page={page} />
    </div>
  );
}
