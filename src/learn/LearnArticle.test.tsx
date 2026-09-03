import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import LearnArticle from "./LearnArticle"
import type { Page } from "./content"

const page: Page = {
  id: "activity-test",
  icon: "Sparkles",
  kicker: "Test",
  title: "Activity test",
  summary: "A small page for checking lesson activities.",
  blocks: [
    {
      k: "practice",
      title: "Open the visual challenge",
      prompt: "Compare two versions.",
      steps: ["Create the first version", "Create the second version"],
      twists: ["Use long content", "Use a narrow screen"],
      evidence: "The stronger version is supported by evidence.",
    },
    {
      k: "quiz",
      question: "Which answer is strongest?",
      options: ["Guess", "Use evidence", "Copy a trend"],
      answer: 1,
      explanation: "Evidence connects the decision to the intended result.",
    },
    {
      k: "details",
      title: "Go deeper",
      text: "Ask another question.",
      items: ["Check a different context"],
    },
  ],
}

describe("LearnArticle activities", () => {
  it("reveals a visual task and rotates its creative constraint", () => {
    render(
      <LearnArticle
        page={page}
        ordered={[page.id]}
        onNavigate={vi.fn()}
        completed={false}
        onToggleComplete={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByText("Open the visual challenge"))
    expect(screen.getByText("Use long content")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "New constraint" }))
    expect(screen.getByText("Use a narrow screen")).toBeTruthy()
  })

  it("gives immediate quiz feedback and allows another answer", () => {
    render(
      <LearnArticle
        page={page}
        ordered={[page.id]}
        onNavigate={vi.fn()}
        completed={false}
        onToggleComplete={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByText("Which answer is strongest?"))
    fireEvent.click(screen.getByRole("button", { name: /Guess/ }))
    expect(screen.getByText("Try another answer")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: /Use evidence/ }))
    expect(screen.getByText("Correct")).toBeTruthy()
    expect(screen.getByText(/Evidence connects the decision/)).toBeTruthy()
  })
})
