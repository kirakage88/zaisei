import { createContext, useContext, useEffect, useState, useCallback } from "react"

type Mode = "dark" | "light" | "system"
type Palette = "sumi" | "sakura"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultMode?: Mode
  defaultPalette?: Palette
  modeStorageKey?: string
  paletteStorageKey?: string
}

interface ThemeProviderState {
  mode: Mode
  palette: Palette
  setMode: (mode: Mode) => void
  setPalette: (palette: Palette) => void
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  mode: "system",
  palette: "sumi",
  setMode: () => null,
  setPalette: () => null,
})

function applyClasses(mode: Mode, palette: Palette) {
  const root = document.documentElement
  root.classList.remove("light", "dark", "sakura")

  // Resolve system preference
  const resolved =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode

  root.classList.add(resolved)
  if (palette === "sakura") root.classList.add("sakura")
}

export function ThemeProvider({
  children,
  defaultMode = "system",
  defaultPalette = "sumi",
  modeStorageKey = "zaisei-ui-theme",
  paletteStorageKey = "zaisei-ui-palette",
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<Mode>(
    () => (localStorage.getItem(modeStorageKey) as Mode) || defaultMode
  )
  const [palette, setPaletteState] = useState<Palette>(
    () => (localStorage.getItem(paletteStorageKey) as Palette) || defaultPalette
  )

  // Apply classes on every mode/palette change
  useEffect(() => {
    applyClasses(mode, palette)
  }, [mode, palette])

  // Also listen for OS preference changes when mode is "system"
  useEffect(() => {
    if (mode !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyClasses(mode, palette)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [mode, palette])

  const setMode = useCallback(
    (newMode: Mode) => {
      localStorage.setItem(modeStorageKey, newMode)
      setModeState(newMode)
    },
    [modeStorageKey]
  )

  const setPalette = useCallback(
    (newPalette: Palette) => {
      localStorage.setItem(paletteStorageKey, newPalette)
      setPaletteState(newPalette)
    },
    [paletteStorageKey]
  )

  return (
    <ThemeProviderContext.Provider value={{ mode, palette, setMode, setPalette }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
