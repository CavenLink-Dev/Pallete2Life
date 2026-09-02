import { beforeEach, describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import Home from "./Home"

beforeEach(() => {
  window.history.replaceState(null, "", "/")
})

describe("Home", () => {
  it("updates the live button style and preview state", () => {
    render(<Home />)

    fireEvent.click(screen.getByRole("radio", { name: "3D" }))
    expect(screen.getByRole("radio", { name: "3D" }).getAttribute("aria-checked")).toBe("true")
    expect(screen.getAllByRole("button", { name: "Example" })[0].getAttribute("data-style")).toBe("3d")

    fireEvent.click(screen.getByRole("button", { name: /^Disabled/ }))
    expect(screen.getByRole("button", { name: /^Disabled/ }).getAttribute("aria-pressed")).toBe("true")
    expect(screen.getAllByRole("button", { name: "Example" })[1].hasAttribute("disabled")).toBe(true)
  })

  it("opens and dismisses the accessible navigation menu", () => {
    render(<Home />)

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }))
    expect(screen.getByRole("navigation", { name: "HueSet menu" })).toBeTruthy()

    fireEvent.keyDown(window, { key: "Escape" })
    expect(screen.queryByRole("navigation", { name: "HueSet menu" })).toBeNull()
  })
})
