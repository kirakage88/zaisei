import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useDebts } from "@/hooks/useDebts"

export function SnowballSummary() {
  const { debts } = useDebts()

  const activeDebts = useMemo(
    () => debts.filter((d) => d.isActive).sort((a, b) => a.remainingBalance - b.remainingBalance),
    [debts]
  )

  const totalDebt = activeDebts.reduce((s, d) => s + d.remainingBalance, 0)
  const totalMinPayment = activeDebts.reduce((s, d) => s + d.minimumPayment, 0)
  const totalOriginal = activeDebts.reduce((s, d) => s + d.creditLimit, 0)
  const paidPct = totalOriginal > 0 ? ((totalOriginal - totalDebt) / totalOriginal) * 100 : 0
  const nextTarget = activeDebts[0]

  if (activeDebts.length === 0) {
    return (
      <Card>
        <CardContent className="p-5">
          <span className="text-xs text-muted-foreground">Debt Snowball</span>
          <p className="text-sm text-muted-foreground mt-3">No active debts.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-5">
        <span className="text-xs text-muted-foreground">Debt Snowball</span>
        <p className="text-2xl font-display font-black tracking-tight mt-1 tabular-nums">
          {formatCurrency(totalDebt)}
        </p>
        <div className="mt-3 flex items-end gap-4">
          <div className="flex-1">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-active transition-all duration-500"
                style={{ width: `${paidPct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
              {paidPct.toFixed(1)}% paid off
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground">Min. payment</p>
            <p className="text-xs font-semibold tabular-nums">{formatCurrency(totalMinPayment)}/mo</p>
          </div>
        </div>
        {nextTarget && (
          <div className="mt-3 rounded-lg border border-accent-resting/30 p-2.5">
            <p className="text-[10px] text-muted-foreground">Next target</p>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-sm font-medium">{nextTarget.name}</span>
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(nextTarget.remainingBalance)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
