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
    // Disabled state renders as a non-interactive element (role="img") so keyboard users aren't trapped
    expect(screen.getByRole("img", { name: "Disabled button preview" })).toBeTruthy()
  })

  it("opens and dismisses the accessible navigation menu", () => {
    render(<Home />)

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }))
    expect(screen.getByRole("navigation", { name: "HueSet menu" })).toBeTruthy()

    fireEvent.keyDown(window, { key: "Escape" })
    expect(screen.queryByRole("navigation", { name: "HueSet menu" })).toBeNull()
  })

  it("uses the requested action colours and one consistent brand lockup", () => {
    render(<Home />)

    expect(screen.getByRole("button", { name: "Edit Primary hex value" }).textContent).toBe("#13A8E7")
    expect(screen.getByRole("button", { name: "Edit Secondary hex value" }).textContent).toBe("#178ABA")
    expect(screen.getByRole("button", { name: "Edit Text hex value" }).textContent).toBe("#FFFFFF")

    const brandLinks = screen.getAllByRole("link", { name: "HueSet home" })
    expect(brandLinks).toHaveLength(2)
    brandLinks.forEach((link) => {
      expect(link.querySelector(".home-brand-icon")).toBeTruthy()
      expect(link.querySelector(".home-brand-wordmark")).toBeTruthy()
    })
  })
})
