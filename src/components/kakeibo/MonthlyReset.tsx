import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatMonthYear } from "@/lib/utils"
import type { KakeiboMonth } from "@/types/kakeibo"

interface MonthlyResetProps {
  month: KakeiboMonth
  spent: { needs: number; wants: number; savings: number }
  onConfirm: () => void
  isClosing: boolean
}

export function MonthlyReset({ month, spent, onConfirm, isClosing }: MonthlyResetProps) {
  const envelopes = [
    { label: "Needs", allocated: month.needsAllocated, spent: spent.needs },
    { label: "Wants", allocated: month.wantsAllocated, spent: spent.wants },
    { label: "Savings", allocated: month.savingsAllocated, spent: spent.savings },
  ]

  const totalAllocated = envelopes.reduce((s, e) => s + e.allocated, 0)
  const totalSpent = envelopes.reduce((s, e) => s + e.spent, 0)
  const unspentSavings = month.savingsAllocated - spent.savings

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div>
          <h3 className="font-display font-black text-lg">Close Month</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatMonthYear(month.year, month.month)} Summary
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Income</span>
            <span className="font-medium tabular-nums">{formatCurrency(month.income)}</span>
          </div>
          {envelopes.map((env) => (
            <div key={env.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{env.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCurrency(env.spent)} / {formatCurrency(env.allocated)}
                </span>
              </div>
            </div>
          ))}
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total Spent</span>
            <span className="tabular-nums">{formatCurrency(totalSpent)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Allocated</span>
            <span className="tabular-nums text-muted-foreground">{formatCurrency(totalAllocated)}</span>
          </div>
        </div>

        {unspentSavings > 0 && (
          <div className="rounded-lg bg-accent-active/10 p-3 text-sm">
            <span className="font-medium text-accent-active">
              {formatCurrency(unspentSavings)}
            </span>{" "}
            in unspent savings will roll into next month.
          </div>
        )}

        <Button
          onClick={onConfirm}
          disabled={isClosing}
          className="w-full"
        >
          {isClosing ? "Closing..." : "Close This Month"}
        </Button>
      </CardContent>
    </Card>
  )
}
