import { useEffect, useRef } from "react"

const FOCUSABLE = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "summary",
].join(",")

export function useDialogFocus<T extends HTMLElement>(open: boolean) {
  const dialogRef = useRef<T | null>(null)

  useEffect(() => {
    if (!open || !dialogRef.current) return
    const dialog = dialogRef.current
    const returnTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const frame = window.requestAnimationFrame(() => {
      dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    })

    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((control) => control.offsetParent !== null)
      if (!controls.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", keepFocusInside)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener("keydown", keepFocusInside)
      returnTarget?.focus()
    }
  }, [open])

  return dialogRef
}
