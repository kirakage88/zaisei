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
import { useTransactions } from "@/hooks/useTransactions"
import { useTheme } from "@/components/theme-provider"
import { formatCurrency } from "@/lib/utils"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

export function CashflowChart() {
  const { transactions } = useTransactions()
  const { theme } = useTheme()

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const { chartData, incomeTotal, expenseTotal } = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recent = transactions.filter((tx) => {
      if (tx.type === "transfer") return false
      const d = new Date(tx.date)
      return d >= thirtyDaysAgo && d <= now
    })

    let incomeTotal = 0
    let expenseTotal = 0

    const daily: Record<string, { income: number; expense: number }> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
      daily[key] = { income: 0, expense: 0 }
    }

    recent.forEach((tx) => {
      const key = new Date(tx.date).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      })
      if (daily[key]) {
        if (tx.type === "income") {
          daily[key].income += tx.amount
          incomeTotal += tx.amount
        } else {
          daily[key].expense += tx.amount
          expenseTotal += tx.amount
        }
      }
    })

    const labels = Object.keys(daily)
    const incomeColor = isDark ? "#7FA372" : "#6B8F5E"
    const expenseColor = isDark ? "#A8A29E" : "#78716C"
    const incomeFill = isDark ? "rgba(127,163,114,0.1)" : "rgba(107,143,94,0.12)"
    const expenseFill = isDark ? "rgba(168,162,158,0.06)" : "rgba(120,113,108,0.08)"

    return {
      incomeTotal,
      expenseTotal,
      chartData: {
        labels,
        datasets: [
          {
            data: labels.map((l) => daily[l].income),
            borderColor: incomeColor,
            backgroundColor: (ctx: any) => {
              const chart = ctx.chart
              const { ctx: c, chartArea } = chart
              if (!chartArea) return "transparent"
              const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
              g.addColorStop(0, incomeFill)
              g.addColorStop(1, "transparent")
              return g
            },
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
          },
          {
            data: labels.map((l) => daily[l].expense),
            borderColor: expenseColor,
            backgroundColor: (ctx: any) => {
              const chart = ctx.chart
              const { ctx: c, chartArea } = chart
              if (!chartArea) return "transparent"
              const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
              g.addColorStop(0, expenseFill)
              g.addColorStop(1, "transparent")
              return g
            },
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
          },
        ],
      },
    }
  }, [transactions, isDark])

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">Cashflow</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent-active" />
              {formatCurrency(incomeTotal)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-nezumi" />
              {formatCurrency(expenseTotal)}
            </span>
          </div>
        </div>
        <div className="h-[120px]">
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
                  displayColors: false,
                  callbacks: {
                    title: () => "",
                    label: (ctx) => `₱${ctx.parsed.y?.toLocaleString() ?? 0}`,
                  },
                },
              },
              scales: {
                x: { display: false },
                y: { display: false },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
