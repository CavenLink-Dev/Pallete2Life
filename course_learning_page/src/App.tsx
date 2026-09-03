import { useState } from "react";
import DocShell from "./components/DocShell";
import Article from "./views/Article";
import { pages, orderedFor } from "./course/content";

export default function App() {
  const [currentId, setCurrentId] = useState("overview");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const ordered = orderedFor();

  const navigate = (id: string) => {
    if (!pages[id]) return;
    setCurrentId(id);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const toggleComplete = () =>
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentId)) next.delete(currentId);
      else next.add(currentId);
      return next;
    });

  const page = pages[currentId];

  return (
    <DocShell currentId={currentId} onNavigate={navigate} completedIds={completedIds}>
      <Article
        page={page}
        ordered={ordered}
        onNavigate={navigate}
        completed={completedIds.has(currentId)}
        onToggleComplete={toggleComplete}
      />
    </DocShell>
  );
}
