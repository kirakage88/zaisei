import { useMemo } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"
import type { SnowballResult } from "@/lib/snowball"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface PayoffChartProps {
  result: SnowballResult | null
}

const DEBT_COLORS = [
  "#6B8F5E",
  "#8C9686",
  "#78716C",
  "#B96A4A",
  "#2B5F8A",
  "#D4A04A",
]

export function PayoffChart({ result }: PayoffChartProps) {
  const { theme } = useTheme()
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const chartData = useMemo(() => {
    if (!result || result.timeline.length === 0) return null

    const { timeline } = result

    // Sample up to 24 data points for readability
    const step = Math.max(1, Math.floor(timeline.length / 24))
    const sampled = timeline.filter(
      (_, i) => i % step === 0 || i === timeline.length - 1
    )

    const labels = sampled.map((s) => `Mo ${s.month}`)

    // Get unique debt names from first snapshot that has them
    const debtNames = timeline[0].debts.map((d) => d.name)

    const datasets = debtNames.map((name, i) => ({
      label: name,
      data: sampled.map((s) => {
        const snap = s.debts.find((d) => d.name === name)
        return snap ? snap.remaining : 0
      }),
      borderColor: DEBT_COLORS[i % DEBT_COLORS.length],
      backgroundColor: DEBT_COLORS[i % DEBT_COLORS.length] + "30",
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 3,
      borderWidth: 2,
    }))

    return { labels, datasets }
  }, [result])

  if (!chartData) return null

  return (
    <Card>
      <CardContent className="p-5">
        <span className="text-xs text-muted-foreground">Payoff Timeline</span>
        <div className="h-[200px] mt-3">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: "index", intersect: false },
              animation: { duration: 800, easing: "easeOutQuart" },
              plugins: {
                legend: { display: false },
                tooltip: {
                  enabled: true,
                  backgroundColor: isDark ? "#2A2624" : "#FFFFFF",
                  titleFont: { size: 11 },
                  bodyFont: { size: 11 },
                  padding: 8,
                  cornerRadius: 6,
                  callbacks: {
                    label: (ctx) =>
                      `${ctx.dataset.label}: ₱${(ctx.parsed.y ?? 0).toLocaleString()}`,
                  },
                },
              },
              scales: {
                x: {
                  display: true,
                  grid: { display: false },
                  ticks: { font: { size: 10 }, maxTicksLimit: 8 },
                },
                y: {
                  display: true,
                  grid: { color: isDark ? "#352F2C20" : "#E4E0DB40" },
                  ticks: {
                    font: { size: 10 },
                    callback: (v) => `₱${Number(v).toLocaleString()}`,
                  },
                },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
