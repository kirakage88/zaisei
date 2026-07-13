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
import { useChartColors } from "@/hooks/useChartColors"
import type { SnowballResult } from "@/lib/snowball"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface PayoffChartProps {
  result: SnowballResult | null
}

export function PayoffChart({ result }: PayoffChartProps) {
  const colors = useChartColors()

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
      borderColor: colors.debtPalette[i % colors.debtPalette.length],
      backgroundColor: colors.debtPalette[i % colors.debtPalette.length] + "30",
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 3,
      borderWidth: 2,
    }))

    return { labels, datasets }
  }, [result, colors])

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
                  backgroundColor: colors.card,
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
                  grid: { color: colors.gridColor },
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
