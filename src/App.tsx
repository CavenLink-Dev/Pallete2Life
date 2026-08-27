import { useRoute } from "./lib/router"
import { ToastProvider } from "./components/Toast"
import Home from "./pages/Home"
import Builder from "./pages/Builder"
import Pricing from "./pages/Pricing"
import Help from "./pages/Help"
import Privacy from "./pages/Privacy"
import Terms from "./pages/Terms"
import Contact from "./pages/Contact"

export default function App() {
  const [route] = useRoute()

  let page: React.ReactNode
  switch (route) {
    case "/builder":  page = <Builder />;  break
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
