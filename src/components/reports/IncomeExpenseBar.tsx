import { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js"
import { Card, CardContent } from "@/components/ui/card"
import { useTransactions } from "@/hooks/useTransactions"
import { useTheme } from "@/components/theme-provider"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface IncomeExpenseBarProps {
  dateFrom?: Date
  dateTo?: Date
}

export function IncomeExpenseBar({ dateFrom, dateTo }: IncomeExpenseBarProps) {
  const { transactions } = useTransactions()
  const { theme } = useTheme()

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const chartData = useMemo(() => {
    const now = new Date()
    const from = dateFrom ?? new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const to = dateTo ?? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const months: { label: string; income: number; expense: number }[] = []
    const d = new Date(from.getFullYear(), from.getMonth(), 1)
    while (d <= to) {
      months.push({
        label: d.toLocaleDateString("en-PH", { month: "short", year: "2-digit" }),
        income: 0,
        expense: 0,
      })
      d.setMonth(d.getMonth() + 1)
    }

    transactions.forEach((tx) => {
      if (tx.type === "transfer") return
      const txDate = new Date(tx.date)
      if (txDate < from || txDate > to) return

      const key = txDate.toLocaleDateString("en-PH", { month: "short", year: "2-digit" })
      const entry = months.find((m) => m.label === key)
      if (entry) {
        if (tx.type === "income") entry.income += tx.amount
        else entry.expense += tx.amount
      }
    })

    const incomeColor = isDark ? "#7FA372" : "#6B8F5E"
    const expenseColor = isDark ? "#A8A29E" : "#78716C"

    return {
      labels: months.map((m) => m.label),
      datasets: [
        {
          label: "Income",
          data: months.map((m) => m.income),
          backgroundColor: incomeColor + "CC",
          borderRadius: 4,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
        {
          label: "Expenses",
          data: months.map((m) => m.expense),
          backgroundColor: expenseColor + "99",
          borderRadius: 4,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
      ],
    }
  }, [transactions, isDark, dateFrom, dateTo])

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">Income vs Expenses</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent-active" />
              Income
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-nezumi" />
              Expenses
            </span>
          </div>
        </div>
        <div className="h-[200px]">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
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
                  grid: { display: false },
                  ticks: { font: { size: 10 } },
                },
                y: {
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
