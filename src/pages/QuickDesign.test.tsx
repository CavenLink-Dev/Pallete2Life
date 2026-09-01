import { beforeEach, describe, expect, it } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ToastProvider } from "../components/Toast"
import QuickDesign from "./QuickDesign"

const STORE_KEY = "hueframe:v1"

function renderQuickDesign() {
  return render(
    <ToastProvider>
      <QuickDesign />
    </ToastProvider>,
  )
}

function writeWorkspace(value: Record<string, unknown>) {
  localStorage.setItem(STORE_KEY, JSON.stringify(value))
}

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, "", "/quick-design")
})

describe("QuickDesign", () => {
  it("exposes undo and redo keyboard shortcuts to assistive tech", () => {
    renderQuickDesign()

    expect(screen.getByRole("button", { name: "Undo" }).getAttribute("aria-keyshortcuts")).toBe("Meta+Z Control+Z")
    expect(screen.getByRole("button", { name: "Redo" }).getAttribute("aria-keyshortcuts")).toBe("Meta+Shift+Z Control+Shift+Z Control+Y")
  })

  it("persists the selected preview and restores it after refresh", async () => {
    const first = renderQuickDesign()

    fireEvent.click(screen.getByRole("tab", { name: "Basic App" }))

    await waitFor(() => {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}")
      expect(raw.preferences.quickPreview).toBe("app")
    })
    expect(screen.getByRole("tab", { name: "Basic App" }).getAttribute("aria-selected")).toBe("true")

    first.unmount()
    renderQuickDesign()

    expect(screen.getByRole("tab", { name: "Basic App" }).getAttribute("aria-selected")).toBe("true")
  })

  it("confirms reset and keeps it undoable, including preview selection", async () => {
    const view = renderQuickDesign()

    fireEvent.click(screen.getByRole("tab", { name: "Basic App" }))
    fireEvent.click(screen.getByRole("button", { name: "Add colour" }))
    expect(view.container.querySelectorAll('input[type="color"]')).toHaveLength(6)

    fireEvent.click(screen.getByRole("button", { name: "Reset" }))
    fireEvent.click(screen.getByRole("button", { name: "Reset palette" }))

    await waitFor(() => {
      expect(view.container.querySelectorAll('input[type="color"]')).toHaveLength(5)
    })
    expect(screen.getByRole("tab", { name: "Basic Website" }).getAttribute("aria-selected")).toBe("true")

    fireEvent.click(screen.getByRole("button", { name: "Undo" }))

    expect(view.container.querySelectorAll('input[type="color"]')).toHaveLength(6)
    expect(screen.getByRole("tab", { name: "Basic App" }).getAttribute("aria-selected")).toBe("true")
  })

  it("confirms delete and keeps it undoable", async () => {
    const view = renderQuickDesign()

    expect(view.container.querySelectorAll('input[type="color"]')).toHaveLength(5)
    fireEvent.click(screen.getByRole("button", { name: "Delete Pale Sky Blue" }))
    fireEvent.click(screen.getByRole("button", { name: "Delete colour" }))

    await waitFor(() => {
      expect(view.container.querySelectorAll('input[type="color"]')).toHaveLength(4)
    })

    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    expect(view.container.querySelectorAll('input[type="color"]')).toHaveLength(5)
  })

  it("updates auto-generated names, preserves manual names, and ignores undo shortcuts while typing", async () => {
    renderQuickDesign()

    fireEvent.click(screen.getByRole("button", { name: "Add colour" }))

    const nameInputs = screen.getAllByLabelText("Colour name")
    const hexInputs = screen.getAllByLabelText("Hex colour")
    const roleSelect = screen.getByLabelText("Background colour")

    fireEvent.change(hexInputs[5]!, { target: { value: "#F46B5E" } })
    fireEvent.blur(hexInputs[5]!)
    await waitFor(() => {
      expect((screen.getAllByLabelText("Colour name")[5] as HTMLInputElement).value).toBe("Red")
    })

    fireEvent.change(screen.getAllByLabelText("Colour name")[5]!, { target: { value: "Brand Blue" } })
    fireEvent.blur(screen.getAllByLabelText("Colour name")[5]!)
    fireEvent.change(screen.getAllByLabelText("Hex colour")[5]!, { target: { value: "#102A43" } })
    fireEvent.blur(screen.getAllByLabelText("Hex colour")[5]!)
    expect((screen.getAllByLabelText("Colour name")[5] as HTMLInputElement).value).toBe("Brand Blue")

    fireEvent.click(screen.getByRole("button", { name: "Lock Pale Sky Blue" }))
    expect(screen.getByRole("button", { name: "Undo" }).hasAttribute("disabled")).toBe(false)

    fireEvent.keyDown(nameInputs[0]!, { key: "z", ctrlKey: true })
    fireEvent.keyDown(roleSelect, { key: "z", ctrlKey: true })
    expect(screen.getByRole("button", { name: "Unlock Pale Sky Blue" })).toBeTruthy()

    fireEvent.keyDown(window, { key: "z", ctrlKey: true })
    expect(screen.getByRole("button", { name: "Lock Pale Sky Blue" })).toBeTruthy()

    fireEvent.keyDown(window, { key: "y", ctrlKey: true })
    expect(screen.getByRole("button", { name: "Unlock Pale Sky Blue" })).toBeTruthy()
  })

  it("re-disambiguates auto-generated names after a manual rename", async () => {
    renderQuickDesign()

    fireEvent.click(screen.getByRole("button", { name: "Add colour" }))

    fireEvent.change(screen.getAllByLabelText("Hex colour")[5]!, { target: { value: "#F46B5E" } })
    fireEvent.blur(screen.getAllByLabelText("Hex colour")[5]!)
    await waitFor(() => {
      expect((screen.getAllByLabelText("Colour name")[5] as HTMLInputElement).value).toBe("Red")
    })

    fireEvent.change(screen.getAllByLabelText("Colour name")[0]!, { target: { value: "Red" } })
    fireEvent.blur(screen.getAllByLabelText("Colour name")[0]!)

    expect((screen.getAllByLabelText("Colour name")[0] as HTMLInputElement).value).toBe("Red")
    expect((screen.getAllByLabelText("Colour name")[5] as HTMLInputElement).value).toBe("Red 2")

    fireEvent.change(screen.getAllByLabelText("Hex colour")[0]!, { target: { value: "#102A43" } })
    fireEvent.blur(screen.getAllByLabelText("Hex colour")[0]!)
    expect((screen.getAllByLabelText("Colour name")[0] as HTMLInputElement).value).toBe("Red")
  })

  it("shows visible accessibility guidance and focuses the relevant role control", () => {
    writeWorkspace({
      schemaVersion: 2,
      palette: [
        { id: "bg", name: "Background", hex: "#FFFFFF", autoNamed: false },
        { id: "surface", name: "Surface", hex: "#FFFFFF", autoNamed: false },
        { id: "button", name: "Button", hex: "#FFFFFF", autoNamed: false },
        { id: "text", name: "Text", hex: "#FFFFFF", autoNamed: false },
        { id: "border", name: "Border", hex: "#FFFFFF", autoNamed: false },
      ],
      selection: { group: "website", sub: "landing-page" },
      roleBindings: {
        "Page Background": "bg",
        "App Background": "bg",
        "Secondary Background": "surface",
        "Brand Primary": "button",
        "Body Text": "text",
        Border: "border",
        Accent: "button",
      },
      preferences: { paletteOpen: true, customiseOpen: true, quickPreview: "website" },
    })

    renderQuickDesign()

    expect(screen.getByText("Darken the text or lighten its background.")).toBeTruthy()

    fireEvent.click(screen.getAllByRole("button", { name: "Adjust role for Text" })[0]!)
    expect(document.activeElement).toBe(screen.getByLabelText("Text colour"))
  })
})
