import { useMemo } from "react"
import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from "chart.js"
import { Card, CardContent } from "@/components/ui/card"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import type { KakeiboMonth } from "@/types/kakeibo"

ChartJS.register(ArcElement, Tooltip)

interface SpendingEnvelopeDonutProps {
  month: KakeiboMonth
}

const ENVELOPE_COLORS: Record<string, string> = {
  Needs: "#1C1917",
  Wants: "#78716C",
  Savings: "#6B8F5E",
}
const ENVELOPE_COLORS_DARK: Record<string, string> = {
  Needs: "#FAFAF9",
  Wants: "#A8A29E",
  Savings: "#7FA372",
}

function useAutoSpent(year: number, month: number) {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59, 999)

  return useLiveQuery(async () => {
    const txs = await db.transactions
      .where("date")
      .between(start, end, true, true)
      .toArray()

    let needs = 0
    let wants = 0
    let savings = 0

    for (const tx of txs) {
      if (tx.type !== "expense") continue
      if (tx.kakeiboTag === "needs") needs += tx.amount
      else if (tx.kakeiboTag === "wants") wants += tx.amount
      else if (tx.kakeiboTag === "savings") savings += tx.amount
    }

    return { needs, wants, savings }
  }, [year, month]) ?? { needs: 0, wants: 0, savings: 0 }
}

export function SpendingEnvelopeDonut({ month }: SpendingEnvelopeDonutProps) {
  const spent = useAutoSpent(month.year, month.month)
  const isDark = document.documentElement.classList.contains("dark")

  const { labels, data, total, colors } = useMemo(() => {
    const envs = [
      { label: "Needs", value: spent.needs, allocated: month.needsAllocated },
      { label: "Wants", value: spent.wants, allocated: month.wantsAllocated },
      { label: "Savings", value: spent.savings, allocated: month.savingsAllocated },
    ]
    const total = envs.reduce((s, e) => s + e.value, 0)
    return {
      labels: envs.map((e) => e.label),
      data: envs.map((e) => e.value),
      total,
      colors: envs.map((e) =>
        isDark ? ENVELOPE_COLORS_DARK[e.label] : ENVELOPE_COLORS[e.label]
      ),
    }
  }, [spent, month, isDark])

  if (total === 0) {
    return (
      <Card>
        <CardContent className="p-5">
          <span className="text-xs text-muted-foreground">Spending by Envelope</span>
          <p className="text-sm text-muted-foreground mt-3">No tagged expenses this month.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">Spending by Envelope</span>
          <span className="text-xs font-medium tabular-nums">{formatCurrency(total)}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-[140px] h-[140px] shrink-0">
            <Doughnut
              data={{
                labels,
                datasets: [
                  {
                    data,
                    backgroundColor: colors,
                    borderColor: "transparent",
                    borderWidth: 0,
                    hoverOffset: 6,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                cutout: "62%",
                animation: { duration: 800, easing: "easeOutQuart" },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0,0,0,0.8)",
                    titleFont: { size: 11 },
                    bodyFont: { size: 11 },
                    padding: 8,
                    cornerRadius: 6,
                    callbacks: {
                      label: (ctx) => {
                        const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0
                        return `₱${ctx.parsed.toLocaleString()} (${pct}%)`
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <div className="flex-1 space-y-1.5 min-w-0">
            {labels.map((label, i) => {
              const pct = total > 0 ? ((data[i] / total) * 100).toFixed(1) : 0
              return (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: colors[i] }}
                    />
                    {label}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
