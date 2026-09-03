import { useState } from "react"
import LearnShell from "../learn/LearnShell"
import LearnArticle from "../learn/LearnArticle"
import { pages, orderedFor } from "../learn/content"

export default function Learn() {
  const [currentId, setCurrentId] = useState("overview")
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const ordered = orderedFor()

  const navigate = (id: string) => {
    if (!pages[id]) return
    setCurrentId(id)
    window.scrollTo({ top: 0, behavior: "auto" })
  }

  const toggleComplete = () =>
    setCompletedIds(prev => {
      const next = new Set(prev)
      if (next.has(currentId)) next.delete(currentId)
      else next.add(currentId)
      return next
    })

  const page = pages[currentId]

  return (
    <LearnShell currentId={currentId} onNavigate={navigate} completedIds={completedIds}>
      <LearnArticle
        page={page}
        ordered={ordered}
        onNavigate={navigate}
        completed={completedIds.has(currentId)}
        onToggleComplete={toggleComplete}
      />
    </LearnShell>
  )
}
