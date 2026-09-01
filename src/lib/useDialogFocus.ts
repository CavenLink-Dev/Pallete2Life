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

export function useDialogFocus<T extends HTMLElement>(open: boolean, onEscape?: () => void) {
  const dialogRef = useRef<T | null>(null)

  useEffect(() => {
    if (!open || !dialogRef.current) return
    const dialog = dialogRef.current
    const returnTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const frame = window.requestAnimationFrame(() => {
      const preferred = dialog.querySelector<HTMLElement>("[data-dialog-initial-focus]")
      ;(preferred ?? dialog.querySelector<HTMLElement>(FOCUSABLE))?.focus()
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        onEscape?.()
        return
      }
      if (event.key !== "Tab") return
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((control) => {
        if (control.hasAttribute("disabled") || control.getAttribute("aria-hidden") === "true") return false
        if (control.getClientRects().length > 0) return true
        const style = window.getComputedStyle(control)
        return style.display !== "none" && style.visibility !== "hidden"
      })
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

    document.addEventListener("keydown", onKeyDown, true)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener("keydown", onKeyDown, true)
      document.body.style.overflow = previousOverflow
      returnTarget?.focus()
    }
  }, [open, onEscape])

  return dialogRef
}
