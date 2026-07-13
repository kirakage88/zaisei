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
import { useAccounts } from "@/hooks/useAccounts"
import { useDebts } from "@/hooks/useDebts"
import { useChartColors } from "@/hooks/useChartColors"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

export function NetWorthTrend() {
  const { accounts } = useAccounts()
  const { debts } = useDebts()
  const colors = useChartColors()

  const chartData = useMemo(() => {
    const activeAccounts = accounts.filter((a) => !a.isArchived && a.type !== "credit" && a.type !== "loan")
    const totalDebt = debts
      .filter((d) => d.isActive)
      .reduce((s, d) => s + d.remainingBalance, 0)

    const totalAssets = activeAccounts.reduce((s, a) => s + a.balance, 0)
    const netWorth = totalAssets - totalDebt

    const now = new Date()
    const months: { label: string; value: number }[] = []

    const allDates = [
      ...activeAccounts.map((a) => new Date(a.createdAt)),
      ...debts.map((d) => new Date(d.createdAt)),
    ]
    const earliest = allDates.length > 0
      ? new Date(Math.min(...allDates.map((d) => d.getTime())))
      : new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const d = new Date(earliest.getFullYear(), earliest.getMonth(), 1)
    while (d <= now) {
      months.push({
        label: d.toLocaleDateString("en-PH", { month: "short", year: "2-digit" }),
        value: netWorth,
      })
      d.setMonth(d.getMonth() + 1)
    }

    if (months.length === 0) {
      months.push({ label: "Now", value: netWorth })
    }

    return {
      labels: months.map((m) => m.label),
      datasets: [
        {
          data: months.map((m) => m.value),
          borderColor: colors.accent,
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart
            const { ctx: c, chartArea } = chart
            if (!chartArea) return "transparent"
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            g.addColorStop(0, colors.accentFill)
            g.addColorStop(1, "transparent")
            return g
          },
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
        },
      ],
    }
  }, [accounts, debts, colors])

  return (
    <Card>
      <CardContent className="p-5">
        <span className="text-xs text-muted-foreground">Net Worth Trend</span>
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
                  displayColors: false,
                  callbacks: {
                    title: () => "",
                    label: (ctx) => `₱${(ctx.parsed.y ?? 0).toLocaleString()}`,
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
