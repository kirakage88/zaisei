import { useMemo, useState } from "react"
import { useTransactions } from "@/hooks/useTransactions"
import { useKakeibo } from "@/hooks/useKakeibo"
import { SpendingCategoryDonut } from "@/components/reports/SpendingCategoryDonut"
import { SpendingEnvelopeDonut } from "@/components/reports/SpendingEnvelopeDonut"
import { IncomeExpenseBar } from "@/components/reports/IncomeExpenseBar"
import { NetWorthTrend } from "@/components/reports/NetWorthTrend"
import { DateRangeFilter } from "@/components/reports/DateRangeFilter"
import { DrillDownTable } from "@/components/reports/DrillDownTable"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EXPENSE_CATEGORIES } from "@/lib/constants"

export default function ReportsPage() {
  const { transactions } = useTransactions()
  const { months } = useKakeibo()

  const now = new Date()
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    new Date(now.getFullYear(), now.getMonth() - 5, 1)
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(now)
  const [drillCategory, setDrillCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.type === "transfer") return false
      const d = new Date(tx.date)
      if (dateFrom && d < dateFrom) return false
      if (dateTo) {
        const endOfDay = new Date(dateTo)
        endOfDay.setHours(23, 59, 59, 999)
        if (d > endOfDay) return false
      }
      return true
    })
  }, [transactions, dateFrom, dateTo])

  const drillTransactions = useMemo(() => {
    if (!drillCategory) return []
    return filtered.filter((tx) => tx.category === drillCategory)
  }, [filtered, drillCategory])

  const activeMonth = months.find(
    (m) => m.year === now.getFullYear() && m.month === now.getMonth() + 1 && !m.isClosed
  )

  const drillLabel = EXPENSE_CATEGORIES.find((c) => c.value === drillCategory)?.label ?? drillCategory

  return (
    <div>
      <h1 className="text-2xl font-display font-black accent-underline">Reports</h1>

      <div className="mt-6">
        <DateRangeFilter dateFrom={dateFrom} dateTo={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t) }} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="animate-card-in stagger-1">
          <SpendingCategoryDonut
            transactions={filtered}
            onCategoryClick={(cat) => setDrillCategory(drillCategory === cat ? null : cat)}
          />
        </div>
        <div className="animate-card-in stagger-2">
          {activeMonth ? (
            <SpendingEnvelopeDonut month={activeMonth} />
          ) : (
            <Card>
              <CardContent className="p-5">
                <span className="text-xs text-muted-foreground">Spending by Envelope</span>
                <p className="text-sm text-muted-foreground mt-3">No active Kakeibo month.</p>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="animate-card-in stagger-3">
          <IncomeExpenseBar dateFrom={dateFrom} dateTo={dateTo} />
        </div>
        <div className="animate-card-in stagger-4">
          <NetWorthTrend />
        </div>
      </div>

      {drillCategory && (
        <div className="mt-6 animate-page-in">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-black text-lg">
                  {drillLabel}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDrillCategory(null)}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
              <DrillDownTable transactions={drillTransactions} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
