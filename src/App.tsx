import { useEffect } from "react"
import { replaceRoute, useRoute } from "./lib/router"
import { ToastProvider } from "./components/Toast"
import Home from "./pages/Home"
import Builder from "./pages/Builder"
import Pricing from "./pages/Pricing"
import Help from "./pages/Help"
import Privacy from "./pages/Privacy"
import Terms from "./pages/Terms"
import Contact from "./pages/Contact"
import QuickDesign from "./pages/QuickDesign"
import GenerateDesign from "./pages/GenerateDesign"

export default function App() {
  const [route] = useRoute()

  useEffect(() => {
    if (route === "/preview" || route === "/builder") replaceRoute("/app")
    if (route === "/live-changes") replaceRoute("/quick-design")
  }, [route])

  let page: React.ReactNode
  switch (route) {
    case "/generate":
      page = <GenerateDesign />
      break
    case "/app":
      page = <Builder />
      break
    case "/preview":
    case "/builder":
      page = null
      break
    case "/quick-design":
    case "/live-changes": page = <QuickDesign />; break
    case "/pricing":  page = <Pricing />;  break
    case "/help":     page = <Help />;     break
    case "/privacy":  page = <Privacy />;  break
    case "/terms":    page = <Terms />;    break
    case "/contact":  page = <Contact />;  break
    case "/":
    default:          page = <Home />;     break
  }

  return <ToastProvider>{page}</ToastProvider>
}
