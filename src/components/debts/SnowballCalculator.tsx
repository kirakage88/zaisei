import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { useDebts } from "@/hooks/useDebts"
import type { SnowballResult } from "@/lib/snowball"

interface SnowballCalculatorProps {
  extraPayment: number
  onExtraPaymentChange: (value: number) => void
  result: SnowballResult | null
}

export function SnowballCalculator({ extraPayment, onExtraPaymentChange, result }: SnowballCalculatorProps) {
  const { debts } = useDebts()

  const activeDebts = debts.filter((d) => d.isActive).sort((a, b) => a.remainingBalance - b.remainingBalance)
  const totalMinPayment = activeDebts.reduce((s, d) => s + d.minimumPayment, 0)

  if (activeDebts.length === 0) return null

  return (
    <Card>
      <CardContent className="p-5">
        <span className="text-xs text-muted-foreground">Snowball Calculator</span>

        <div className="mt-3">
          <Label htmlFor="extra-payment" className="text-xs text-muted-foreground">
            Extra monthly payment
          </Label>
          <Input
            id="extra-payment"
            type="number"
            min={0}
            value={extraPayment || ""}
            onChange={(e) => onExtraPaymentChange(Number(e.target.value) || 0)}
            placeholder="0"
            className="mt-1"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Total minimum: {formatCurrency(totalMinPayment)}/mo
          </p>
        </div>

        {result && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Months to payoff</p>
                <p className="text-lg font-display font-black tabular-nums">
                  {result.monthsToPayoff}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Interest paid</p>
                <p className="text-lg font-display font-black tabular-nums">
                  {formatCurrency(result.totalInterest)}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-accent-resting/40 max-h-64 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Month</th>
                    {activeDebts.map((d) => (
                      <th key={d.id} className="px-3 py-2 text-right font-medium text-muted-foreground">
                        {d.name}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.timeline
                    .filter(
                      (_, i) =>
                        i === 0 ||
                        i === result.timeline.length - 1 ||
                        i % Math.max(1, Math.floor(result.timeline.length / 12)) === 0
                    )
                    .map((row) => (
                      <tr key={row.month} className="border-b border-border/50">
                        <td className="px-3 py-1.5 tabular-nums">{row.month}</td>
                        {activeDebts.map((d) => {
                          const snap = row.debts.find((s) => s.id === d.id)
                          return (
                            <td key={d.id} className="px-3 py-1.5 text-right tabular-nums">
                              {snap && snap.remaining > 0 ? formatCurrency(snap.remaining) : "—"}
                            </td>
                          )
                        })}
                        <td className="px-3 py-1.5 text-right font-medium tabular-nums">
                          {formatCurrency(row.totalRemaining)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
