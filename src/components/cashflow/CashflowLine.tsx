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
import { useTransactions } from "@/hooks/useTransactions"
import { useTheme } from "@/components/theme-provider"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

export type TimeRange = "1d" | "7d" | "30d"

const TIME_RANGE_HOURS: Record<TimeRange, number> = {
  "1d": 24,
  "7d": 168,
  "30d": 720,
}

function formatDayKey(d: Date): string {
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
}

export function useCashflowData(hours: number, filterAccountId?: number) {
  const { transactions } = useTransactions()
  const { theme } = useTheme()

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return useMemo(() => {
    const now = new Date()
    const startDate = new Date(now.getTime() - hours * 60 * 60 * 1000)
    const useHourly = hours <= 24

    const recent = transactions.filter((tx) => {
      if (tx.type === "transfer") return false
      if (filterAccountId !== undefined && tx.accountId !== filterAccountId) return false
      const d = new Date(tx.date)
      return d >= startDate && d <= now
    })

    const buckets: Record<string, number> = {}

    if (useHourly) {
      const startHour = new Date(startDate)
      startHour.setMinutes(0, 0, 0)
      const endHour = new Date(now)
      endHour.setMinutes(59, 59, 999)

      for (let t = startHour.getTime(); t <= endHour.getTime(); t += 60 * 60 * 1000) {
        const h = new Date(t)
        buckets[`${String(h.getHours()).padStart(2, "0")}:00`] = 0
      }
    } else {
      const bucketCount = Math.ceil(hours / 24)
      for (let i = bucketCount - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        buckets[formatDayKey(d)] = 0
      }
    }

    let netTotal = 0
    recent.forEach((tx) => {
      const d = new Date(tx.date)
      let key: string
      if (useHourly) {
        key = `${String(d.getHours()).padStart(2, "0")}:00`
      } else {
        key = formatDayKey(d)
      }
      if (key in buckets) {
        const delta = tx.type === "income" ? tx.amount : -tx.amount
        buckets[key] += delta
        netTotal += delta
      }
    })

    const labels = Object.keys(buckets)
    const values = labels.map((l) => buckets[l])
    const lineColor = isDark ? "#7FA372" : "#6B8F5E"
    const fillColor = isDark ? "rgba(127,163,114,0.1)" : "rgba(107,143,94,0.12)"

    return {
      netTotal,
      chartData: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: lineColor,
            backgroundColor: (ctx: any) => {
              const chart = ctx.chart
              const { ctx: c, chartArea } = chart
              if (!chartArea) return "transparent"
              const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
              g.addColorStop(0, fillColor)
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
  }, [transactions, isDark, hours, filterAccountId])
}

interface CashflowLineProps {
  height?: number
  filterAccountId?: number
  hours: number
}

export function CashflowLine({ height = 120, filterAccountId, hours }: CashflowLineProps) {
  const { chartData } = useCashflowData(hours, filterAccountId)

  return (
    <div style={{ height }}>
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
              backgroundColor: "transparent",
              titleFont: { size: 10 },
              bodyFont: { size: 10 },
              padding: 4,
              cornerRadius: 4,
              displayColors: false,
              callbacks: {
                title: () => "",
                label: (ctx) => `₱${ctx.parsed.y?.toLocaleString() ?? 0}`,
              },
            },
          },
          scales: {
            x: { display: false },
            y: {
              display: false,
              afterDataLimits(scale) {
                const dataMin = scale.min
                const dataMax = scale.max
                const absMax = Math.max(Math.abs(dataMin), Math.abs(dataMax), 1)
                scale.min = -absMax * 1.2
                scale.max = absMax * 1.2
              },
            },
          },
        }}
      />
    </div>
  )
}

export function TimeRangeSelector({
  value,
  onChange,
}: {
  value: TimeRange
  onChange: (v: TimeRange) => void
}) {
  const options: { label: string; value: TimeRange }[] = [
    { label: "1D", value: "1d" },
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
  ]

  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
            value === opt.value
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export { TIME_RANGE_HOURS }
