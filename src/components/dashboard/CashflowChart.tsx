import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { CashflowLine, TimeRangeSelector, useCashflowData, TIME_RANGE_HOURS, type TimeRange } from "@/components/cashflow/CashflowLine"

export function CashflowChart() {
  const [range, setRange] = useState<TimeRange>("30d")
  const { netTotal } = useCashflowData(TIME_RANGE_HOURS[range])

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">Cashflow</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatCurrency(netTotal)}
            </span>
            <TimeRangeSelector value={range} onChange={setRange} />
          </div>
        </div>
        <CashflowLine hours={TIME_RANGE_HOURS[range]} />
      </CardContent>
    </Card>
  )
}
