import { useMemo } from "react"
import { useTheme } from "@/components/theme-provider"

/*
 * Palette-aware chart colors for Chart.js.
 *
 * Chart.js requires hex/rgba strings — it cannot consume CSS variables directly.
 * We define the full palette here (mirroring index.css) so chart colors swap
 * correctly when the user switches between Sumi and Sakura, light and dark.
 */

interface ChartPalette {
  accent: string
  accentFill: string
  nezumi: string
  sumi: string
  negative: string
  positive: string
  card: string
  border: string
  gridColor: string
  categoryPalette: string[]
  debtPalette: string[]
}

const SUMI_LIGHT: ChartPalette = {
  accent: "#6B8F5E",
  accentFill: "rgba(107,143,94,0.12)",
  nezumi: "#78716C",
  sumi: "#1C1917",
  negative: "#B96A4A",
  positive: "#6B8F5E",
  card: "#FFFFFF",
  border: "#E4E0DB",
  gridColor: "rgba(228,224,219,0.25)",
  categoryPalette: [
    "#6B8F5E", "#8C9686", "#B96A4A", "#2B5F8A", "#D4A04A",
    "#78716C", "#5B8C5A", "#C73E3E", "#4A8FC7", "#8FA84A",
    "#BE4B3B",
  ],
  debtPalette: ["#6B8F5E", "#8C9686", "#78716C", "#B96A4A", "#2B5F8A", "#D4A04A"],
}

const SUMI_DARK: ChartPalette = {
  accent: "#7FA372",
  accentFill: "rgba(127,163,114,0.1)",
  nezumi: "#A8A29E",
  sumi: "#FAFAF9",
  negative: "#B96A4A",
  positive: "#7FA372",
  card: "#231F1E",
  border: "#352F2C",
  gridColor: "rgba(53,47,44,0.125)",
  categoryPalette: [
    "#7FA372", "#8C9686", "#B96A4A", "#4A8FC7", "#D4A04A",
    "#A8A29E", "#5B8C5A", "#C73E3E", "#4A8FC7", "#8FA84A",
    "#BE4B3B",
  ],
  debtPalette: ["#7FA372", "#8C9686", "#A8A29E", "#B96A4A", "#4A8FC7", "#D4A04A"],
}

const SAKURA_LIGHT: ChartPalette = {
  accent: "#E8899C",
  accentFill: "rgba(232,137,156,0.12)",
  nezumi: "#A8919A",
  sumi: "#2B1E22",
  negative: "#E4767B",
  positive: "#A8C3A0",
  card: "#FFFFFF",
  border: "#F0D6DA",
  gridColor: "rgba(240,214,218,0.25)",
  categoryPalette: [
    "#E8899C", "#C4545A", "#A8919A", "#D4A04A", "#F2A3B3",
    "#8B5E6B", "#BE4B3B", "#7B8174", "#4A8FC7", "#C9A84A",
    "#B07090",
  ],
  debtPalette: ["#E8899C", "#C4545A", "#A8919A", "#D4A04A", "#F2A3B3", "#8B5E6B"],
}

const SAKURA_DARK: ChartPalette = {
  accent: "#F2A3B3",
  accentFill: "rgba(242,163,179,0.1)",
  nezumi: "#C4AAB2",
  sumi: "#FAF0F2",
  negative: "#E4767B",
  positive: "#A8C3A0",
  card: "#47323A",
  border: "#563E48",
  gridColor: "rgba(86,62,72,0.125)",
  categoryPalette: [
    "#F2A3B3", "#C4545A", "#C4AAB2", "#D4A04A", "#E8899C",
    "#8B5E6B", "#BE4B3B", "#7B8174", "#4A8FC7", "#C9A84A",
    "#B07090",
  ],
  debtPalette: ["#F2A3B3", "#C4545A", "#C4AAB2", "#D4A04A", "#E8899C", "#8B5E6B"],
}

export function useChartColors(): ChartPalette {
  const { palette, mode } = useTheme()

  const isDark =
    mode === "dark" ||
    (mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return useMemo(() => {
    return palette === "sakura"
      ? isDark ? SAKURA_DARK : SAKURA_LIGHT
      : isDark ? SUMI_DARK : SUMI_LIGHT
  }, [palette, mode, isDark])
}
