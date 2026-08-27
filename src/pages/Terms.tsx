import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function Terms() {
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-14 sm:py-20">
        <h1 className="text-[32px] font-bold sm:text-[40px]" style={{ fontFamily: "var(--font-display)" }}>Terms of Service</h1>
        <p className="text-[13px] text-charcoal/50">Last updated: today</p>
        <div className="flex flex-col gap-4 text-[14.5px] leading-relaxed text-charcoal/75">
          <p>By using Palette Preview you agree to the following simple terms.</p>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Fair use</h2>
          <p>Use Palette Preview for design exploration, testing colour palettes, and creating your own products. Don't abuse the service, don't attempt to break it, and don't upload assets you don't have the right to use.</p>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Your content</h2>
          <p>Anything you upload (logos, symbols) stays on your device. You retain all rights to your work. Colours you create belong to you — palettes cannot be copyrighted.</p>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>No warranty</h2>
          <p>Palette Preview is provided as-is. We work hard to make it reliable, but we cannot guarantee it will always be available or free of bugs. Do not rely on it as your only source of truth.</p>

          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Changes</h2>
          <p>These terms may change as the product evolves. Any material change will be highlighted inside the product before it takes effect.</p>

          <p className="mt-4">Questions? Please use the <a href="/contact" className="font-semibold underline">Contact</a> page.</p>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
