import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

type Kind = "info" | "success" | "error"
type ToastItem = { id: number; kind: Kind; message: string }
type ToastAPI = { push: (message: string, kind?: Kind) => void }

const Ctx = createContext<ToastAPI | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const push = useCallback((message: string, kind: Kind = "info") => {
    const id = ++idRef.current
    setItems((v) => [...v, { id, kind, message }])
    window.setTimeout(() => setItems((v) => v.filter((t) => t.id !== id)), 3200)
  }, [])

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto animate-pop-in max-w-[92vw] rounded-full px-4 py-2 text-[13px] font-semibold shadow-lg"
            style={
              t.kind === "success"
                ? { background: "#0E8A4E", color: "#fff" }
                : t.kind === "error"
                ? { background: "#C22F2F", color: "#fff" }
                : { background: "#0E1821", color: "#fff" }
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>")
  return ctx
}

/** Small hook: run once on mount, useful for "Welcome back" first-load messages */
export function useOnce(fn: () => void) {
  const ran = useRef(false)
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    fn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
