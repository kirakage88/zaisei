import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return
      }

      // Don't trigger if modifier keys are held (except shift for ?)
      if (e.ctrlKey || e.metaKey || e.altKey) return

      switch (e.key) {
        case "d":
          e.preventDefault()
          navigate("/")
          break
        case "a":
          e.preventDefault()
          navigate("/accounts")
          break
        case "t":
          e.preventDefault()
          navigate("/transactions")
          break
        case "b":
          e.preventDefault()
          navigate("/debts")
          break
        case "k":
          e.preventDefault()
          navigate("/kakeibo")
          break
        case "r":
          e.preventDefault()
          navigate("/reports")
          break
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [navigate])
}
