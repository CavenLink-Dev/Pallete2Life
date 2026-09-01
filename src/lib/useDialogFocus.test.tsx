import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import ConfirmDialog from "../components/ConfirmDialog"
import { useDialogFocus } from "./useDialogFocus"

function TrapExample() {
  const ref = useDialogFocus<HTMLDivElement>(true)
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="trap-title">
      <h2 id="trap-title">Trap</h2>
      <button type="button">First</button>
      <button type="button">Last</button>
    </div>
  )
}

describe("dialog keyboard behavior", () => {
  it("moves initial focus into the dialog and restores it on close", () => {
    const opener = document.createElement("button")
    opener.textContent = "Open"
    document.body.append(opener)
    opener.focus()

    const { unmount } = render(<TrapExample />)
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus()

    unmount()
    expect(opener).toHaveFocus()
    opener.remove()
  })

  it("cycles Tab from the last control back to the first", () => {
    render(<TrapExample />)
    const first = screen.getByRole("button", { name: "First" })
    const last = screen.getByRole("button", { name: "Last" })
    last.focus()
    fireEvent.keyDown(last, { key: "Tab" })
    expect(first).toHaveFocus()
  })

  it("closes a confirmation dialog with Escape", () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Delete colour?"
        body="You can undo this change."
        confirmLabel="Delete colour"
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    )

    fireEvent.keyDown(window, { key: "Escape" })
    expect(onCancel).toHaveBeenCalled()
  })
})
