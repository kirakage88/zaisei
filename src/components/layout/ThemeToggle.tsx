import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  const cycle = () => {
    const root = document.documentElement
    root.classList.add("theme-transition")

    if (mode === "light") setMode("dark")
    else if (mode === "dark") setMode("system")
    else setMode("light")

    setTimeout(() => root.classList.remove("theme-transition"), 350)
  }

  return (
    <Button variant="ghost" size="icon" onClick={cycle} aria-label="Toggle theme">
      <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
