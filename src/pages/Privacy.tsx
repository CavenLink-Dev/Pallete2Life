import PublicHeader from "../components/PublicHeader"
import PublicFooter from "../components/PublicFooter"

export default function Privacy() {
  return (
    <div className="flex min-h-full flex-col bg-offwhite">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-14 sm:py-20">
        <h1 className="text-[32px] font-bold sm:text-[40px]" style={{ fontFamily: "var(--font-display)" }}>Privacy Policy</h1>
        <p className="text-[13px] text-charcoal/50">Last updated: today</p>
        <div className="flex flex-col gap-4 text-[14.5px] leading-relaxed text-charcoal/75">
          <p><b>Short version.</b> Pallet Preview is a browser tool. Your palettes, uploaded logos and edit-mode assignments live only on your device (localStorage). We do not collect them, we cannot see them, and clearing your browser data deletes them.</p>
          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>What we store</h2>
          <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: "disc" }}>
            <li>Your current palette, brand assets, button style choices and element assignments — kept in your browser's <code>localStorage</code>.</li>
            <li>Basic technical logs on the server (page requests, error reports) for keeping the site running.</li>
          </ul>
          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>What we don't do</h2>
          <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: "disc" }}>
            <li>No accounts, no email lists, no marketing tracking today.</li>
            <li>No selling or sharing of personal data.</li>
            <li>No third-party ad networks.</li>
          </ul>
          <h2 className="mt-4 text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>If that changes</h2>
          <p>If we add accounts or optional analytics later, this page will be updated first and the change will be clearly communicated inside the product.</p>
          <p className="mt-4">Questions? Please use the <a href="/contact" className="font-semibold underline">Contact</a> page.</p>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
