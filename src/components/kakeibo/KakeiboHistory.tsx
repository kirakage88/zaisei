import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatMonthYear } from "@/lib/utils"
import type { KakeiboMonth } from "@/types/kakeibo"

interface KakeiboHistoryProps {
  months: KakeiboMonth[]
}

export function KakeiboHistory({ months }: KakeiboHistoryProps) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const closed = months
    .filter((m) => m.isClosed)
    .sort((a, b) => b.year - a.year || b.month - a.month)

  if (closed.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-display font-black text-lg">History</h3>
      {closed.map((m) => {
        const isOpen = expanded === m.id
        const totalAllocated = m.needsAllocated + m.wantsAllocated + m.savingsAllocated
        const totalSpent = m.needsSpent + m.wantsSpent + m.savingsSpent
        return (
          <Card key={m.id}>
            <CardContent className="p-4">
              <button
                onClick={() => setExpanded(isOpen ? null : (m.id ?? null))}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {formatMonthYear(m.year, m.month)}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatCurrency(totalSpent)} spent
                  </span>
                </div>
              </button>
              {isOpen && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Income</span>
                    <span className="tabular-nums">{formatCurrency(m.income)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Allocated</span>
                    <span className="tabular-nums">{formatCurrency(totalAllocated)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="tabular-nums">{formatCurrency(totalSpent)}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Needs</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCurrency(m.needsSpent)} / {formatCurrency(m.needsAllocated)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Wants</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCurrency(m.wantsSpent)} / {formatCurrency(m.wantsAllocated)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Savings</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCurrency(m.savingsSpent)} / {formatCurrency(m.savingsAllocated)}
                    </span>
                  </div>
                  {m.savingsAllocated - m.savingsSpent > 0 && (
                    <p className="text-[11px] text-accent-active">
                      Saved {formatCurrency(m.savingsAllocated - m.savingsSpent)}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
