import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useKakeibo, autoCalcAllocations } from "@/hooks/useKakeibo"
import { formatCurrency, formatMonthYear } from "@/lib/utils"
import { KAKEIBO_RATIOS } from "@/lib/constants"

interface KakeiboMonthSetupProps {
  year: number
  month: number
}

function useAutoIncome(year: number, month: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

  return useLiveQuery(async () => {
    const txs = await db.transactions
      .where("date")
      .between(startOfMonth, endOfMonth, true, true)
      .toArray()

    let income = 0
    for (const tx of txs) {
      if (tx.type === "income") income += tx.amount
    }
    return income
  }, [year, month]) ?? 0
}

export function KakeiboMonthSetup({ year, month }: KakeiboMonthSetupProps) {
  const { createMonth } = useKakeibo()
  const autoIncome = useAutoIncome(year, month)
  const [income, setIncome] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const incomeNum = parseFloat(income) || 0
  const allocations = incomeNum > 0 ? autoCalcAllocations(incomeNum) : null

  const useAuto = () => {
    if (autoIncome > 0) setIncome(String(autoIncome))
  }

  const handleCreate = async () => {
    if (!allocations || incomeNum <= 0) return
    setIsCreating(true)
    try {
      await createMonth({
        year,
        month,
        income: incomeNum,
        needsAllocated: allocations.needsAllocated,
        wantsAllocated: allocations.wantsAllocated,
        savingsAllocated: allocations.savingsAllocated,
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="font-display font-black text-lg">
            Set Up {formatMonthYear(year, month)}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your expected monthly income. Allocations will be calculated
            automatically.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Expected Monthly Income</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ₱
            </span>
            <Input
              type="number"
              min="0"
              placeholder="0.00"
              className="pl-8"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </div>
          {autoIncome > 0 && !income && (
            <Button
              variant="outline"
              size="sm"
              onClick={useAuto}
              className="text-xs text-muted-foreground h-6"
            >
              Use computed income: {formatCurrency(autoIncome)}
            </Button>
          )}
        </div>

        {allocations && incomeNum > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Savings ({Math.round(KAKEIBO_RATIOS.savingsRatio * 100)}%)</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(allocations.savingsAllocated)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Needs ({Math.round(KAKEIBO_RATIOS.needsRatio * 100)}%)</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(allocations.needsAllocated)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Wants ({Math.round(KAKEIBO_RATIOS.wantsRatio * 100)}%)</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(allocations.wantsAllocated)}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCurrency(
                  allocations.needsAllocated +
                    allocations.wantsAllocated +
                    allocations.savingsAllocated
                )}
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={handleCreate}
          disabled={!allocations || incomeNum <= 0 || isCreating}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Start This Month"}
        </Button>
      </CardContent>
    </Card>
  )
}
