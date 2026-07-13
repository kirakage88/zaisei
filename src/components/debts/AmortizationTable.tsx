import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { useDebts } from "@/hooks/useDebts"

export function AmortizationTable() {
  const { debts } = useDebts()
  const activeDebts = useMemo(
    () => debts.filter((d) => d.isActive).sort((a, b) => a.remainingBalance - b.remainingBalance),
    [debts]
  )

  const [selectedId, setSelectedId] = useState<string>("")

  const selectedDebt = activeDebts.find((d) => d.id === Number(selectedId))

  const schedule = useMemo(() => {
    if (!selectedDebt || selectedDebt.minimumPayment <= 0) return []

    const principal = selectedDebt.remainingBalance
    const monthlyRate = selectedDebt.interestRate / 100 / 12
    const payment = selectedDebt.minimumPayment

    if (monthlyRate === 0) {
      // Zero interest — simple division
      const months = Math.ceil(principal / payment)
      return Array.from({ length: months }, (_, i) => {
        const remaining = Math.max(0, principal - payment * (i + 1))
        return {
          payment: i + 1,
          amount: i === months - 1 ? remaining + payment : payment,
          principal: i === months - 1 ? principal - payment * i : payment,
          interest: 0,
          remaining,
        }
      })
    }

    // Standard amortization with interest
    const rows: { payment: number; amount: number; principal: number; interest: number; remaining: number }[] = []
    let balance = principal

    while (balance > 0.01) {
      const interest = balance * monthlyRate
      const principalPaid = Math.min(payment - interest, balance)
      const actualPayment = principalPaid + interest
      balance -= principalPaid

      rows.push({
        payment: rows.length + 1,
        amount: actualPayment,
        principal: principalPaid,
        interest,
        remaining: Math.max(0, balance),
      })

      if (rows.length > 600) break // Safety limit
    }

    return rows
  }, [selectedDebt])

  if (activeDebts.length === 0) return null

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">Amortization Schedule</span>
          <Select
            value={selectedId || activeDebts[0]?.id?.toString() || ""}
            onValueChange={setSelectedId}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Select debt" />
            </SelectTrigger>
            <SelectContent>
              {activeDebts.map((d) => (
                <SelectItem key={d.id} value={d.id!.toString()}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {schedule.length > 0 && (
          <div className="rounded-md border border-accent-resting/40 max-h-72 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Payment</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Principal</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Interest</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.payment} className="border-b border-border/50">
                    <td className="px-3 py-1.5 tabular-nums">{row.payment}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{formatCurrency(row.amount)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{formatCurrency(row.principal)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-nezumi">{formatCurrency(row.interest)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums font-medium">{formatCurrency(row.remaining)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
