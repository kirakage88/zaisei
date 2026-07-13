import { useMemo, useState } from "react"
import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { EXPENSE_CATEGORIES } from "@/lib/constants"
import { useChartColors } from "@/hooks/useChartColors"
import type { Transaction } from "@/types/transaction"

ChartJS.register(ArcElement, Tooltip, Legend)

interface SpendingCategoryDonutProps {
  transactions: Transaction[]
  onCategoryClick?: (category: string) => void
}

export function SpendingCategoryDonut({ transactions, onCategoryClick }: SpendingCategoryDonutProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const colors = useChartColors()

  const { labels, data, total } = useMemo(() => {
    const byCategory: Record<string, number> = {}
    transactions.forEach((tx) => {
      if (tx.type !== "expense") return
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount
    })

    const sorted = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])

    const catLabels = sorted.map(([cat]) => {
      const found = EXPENSE_CATEGORIES.find((c) => c.value === cat)
      return found?.label ?? cat
    })
    const catData = sorted.map(([, v]) => v)
    const total = catData.reduce((s, v) => s + v, 0)

    return { labels: catLabels, data: catData, total }
  }, [transactions])

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-5">
          <span className="text-xs text-muted-foreground">Spending by Category</span>
          <p className="text-sm text-muted-foreground mt-3">No expenses in this period.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">Spending by Category</span>
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
                    backgroundColor: colors.categoryPalette.slice(0, data.length),
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
                onHover: (_, elements) => {
                  setHoveredIndex(elements.length > 0 ? elements[0].index : null)
                },
                onClick: (_, elements) => {
                  if (elements.length > 0 && onCategoryClick) {
                    const idx = elements[0].index
                    const catKey = Object.entries(
                      transactions.reduce((acc: Record<string, number>, tx) => {
                        if (tx.type === "expense") {
                          acc[tx.category] = (acc[tx.category] || 0) + tx.amount
                        }
                        return acc
                      }, {})
                    ).sort((a, b) => b[1] - a[1])[idx]?.[0]
                    if (catKey) onCategoryClick(catKey)
                  }
                },
              }}
            />
          </div>
          <div className="flex-1 space-y-1.5 min-w-0">
            {labels.map((label, i) => {
              const pct = total > 0 ? ((data[i] / total) * 100).toFixed(1) : 0
              return (
                <div
                  key={label}
                  className={`flex items-center justify-between text-xs cursor-pointer rounded px-1 py-0.5 transition-colors ${
                    hoveredIndex === i ? "bg-muted" : ""
                  }`}
                  onClick={() => onCategoryClick?.(
                    Object.entries(
                      transactions.reduce((acc: Record<string, number>, tx) => {
                        if (tx.type === "expense") {
                          acc[tx.category] = (acc[tx.category] || 0) + tx.amount
                        }
                        return acc
                      }, {})
                    ).sort((a, b) => b[1] - a[1])[i]?.[0] ?? ""
                  )}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: colors.categoryPalette[i] }}
                    />
                    <span className="truncate">{label}</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground ml-2">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
