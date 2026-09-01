import { describe, it, expect } from "vitest"
import {
  applyQuickRoleToBindings,
  migrateLiveRolesToBindings,
  quickRolesFromBindings,
} from "./quickRoleBridge"

describe("quickRoleBridge", () => {
  const palette = [
    { id: "a", name: "A", hex: "#111111" },
    { id: "b", name: "B", hex: "#222222" },
    { id: "c", name: "C", hex: "#333333" },
  ]

  it("migrates legacy liveRoles into roleBindings", () => {
    const bindings = migrateLiveRolesToBindings(
      { background: "a", button: "c", text: "b" },
      new Set(["a", "b", "c"]),
    )
    expect(bindings["Page Background"]).toBe("a")
    expect(bindings["Brand Primary"]).toBe("c")
    expect(bindings["Body Text"]).toBe("b")
  })

  it("reads quick roles from shared roleBindings", () => {
    const roles = quickRolesFromBindings(
      { "Page Background": "b", "Brand Primary": "c" },
      palette,
    )
    expect(roles.background).toBe("b")
    expect(roles.button).toBe("c")
  })

  it("writes quick role changes into roleBindings", () => {
    const { roleBindings } = applyQuickRoleToBindings("accent", "a", {}, [])
    expect(roleBindings.Accent).toBe("a")
  })
})
