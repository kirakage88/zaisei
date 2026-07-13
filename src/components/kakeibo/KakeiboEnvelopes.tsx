import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { useKakeibo, autoCalcAllocations } from "@/hooks/useKakeibo"
import type { KakeiboMonth } from "@/types/kakeibo"

interface KakeiboEnvelopesProps {
  month: KakeiboMonth
  onCloseMonth: () => void
  isClosing: boolean
}

function useAutoIncome(month: KakeiboMonth) {
  const startOfMonth = new Date(month.year, month.month - 1, 1)
  const endOfMonth = new Date(month.year, month.month, 0, 23, 59, 59, 999)

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
  }, [month.year, month.month]) ?? 0
}

function useAutoSpent(month: KakeiboMonth) {
  const startOfMonth = new Date(month.year, month.month - 1, 1)
  const endOfMonth = new Date(month.year, month.month, 0, 23, 59, 59, 999)

  const spent = useLiveQuery(async () => {
    const txs = await db.transactions
      .where("date")
      .between(startOfMonth, endOfMonth, true, true)
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
  }, [month.year, month.month])

  return spent ?? { needs: month.needsSpent, wants: month.wantsSpent, savings: month.savingsSpent }
}

export function KakeiboEnvelopes({ month, onCloseMonth, isClosing }: KakeiboEnvelopesProps) {
  const { updateMonth } = useKakeibo()
  const spent = useAutoSpent(month)
  const autoIncome = useAutoIncome(month)
  const [isEditingIncome, setIsEditingIncome] = useState(false)
  const [incomeDraft, setIncomeDraft] = useState("")
  const [isSavingIncome, setIsSavingIncome] = useState(false)

  const displayIncome = autoIncome > 0 ? autoIncome : month.income

  useEffect(() => {
    if (autoIncome > 0 && month.id && autoIncome !== month.income) {
      const allocs = autoCalcAllocations(autoIncome)
      updateMonth(month.id, {
        income: autoIncome,
        needsAllocated: allocs.needsAllocated,
        wantsAllocated: allocs.wantsAllocated,
        savingsAllocated: allocs.savingsAllocated,
      })
    }
  }, [autoIncome, month.id, month.income])

  const startEditIncome = () => {
    setIncomeDraft(String(displayIncome || ""))
    setIsEditingIncome(true)
  }

  const saveIncome = async () => {
    const newIncome = parseFloat(incomeDraft) || 0
    if (newIncome <= 0 || !month.id) {
      setIsEditingIncome(false)
      return
    }
    setIsSavingIncome(true)
    try {
      const allocs = autoCalcAllocations(newIncome)
      const changes: Partial<KakeiboMonth> = {
        needsAllocated: allocs.needsAllocated,
        wantsAllocated: allocs.wantsAllocated,
        savingsAllocated: allocs.savingsAllocated,
      }
      if (autoIncome === 0) {
        changes.income = newIncome
      }
      await updateMonth(month.id, changes)
      setIsEditingIncome(false)
    } finally {
      setIsSavingIncome(false)
    }
  }

  const envelopes = [
    {
      label: "Needs",
      allocated: month.needsAllocated,
      spent: spent.needs,
      color: "bg-sumi",
    },
    {
      label: "Wants",
      allocated: month.wantsAllocated,
      spent: spent.wants,
      color: "bg-nezumi",
    },
    {
      label: "Savings",
      allocated: month.savingsAllocated,
      spent: spent.savings,
      color: "bg-accent-active",
    },
  ]

  const totalAllocated =
    month.needsAllocated + month.wantsAllocated + month.savingsAllocated
  const totalSpent = spent.needs + spent.wants + spent.savings

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-lg">Envelopes</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {isEditingIncome ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">₱</span>
                  <Input
                    type="number"
                    min="0"
                    className="h-6 w-28 text-xs"
                    value={incomeDraft}
                    onChange={(e) => setIncomeDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveIncome(); if (e.key === "Escape") setIsEditingIncome(false) }}
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={saveIncome} disabled={isSavingIncome}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setIsEditingIncome(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  onClick={startEditIncome}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Income: {formatCurrency(displayIncome)}
                  {autoIncome > 0 && (
                    <span className="ml-1 text-[10px]">(auto)</span>
                  )}
                  <span className="ml-1 underline decoration-dotted">edit</span>
                </button>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground tabular-nums">
            {formatCurrency(totalSpent)} / {formatCurrency(totalAllocated)}
          </div>
        </div>

        <div className="space-y-4">
          {envelopes.map((env) => {
            const pct = env.allocated > 0 ? Math.min((env.spent / env.allocated) * 100, 100) : 0
            const remaining = env.allocated - env.spent
            const isOver = remaining < 0
            const overPct = isOver && env.allocated > 0
              ? Math.min(((env.spent - env.allocated) / env.allocated) * 100, 50)
              : 0
            return (
              <div key={env.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{env.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatCurrency(env.spent)} / {formatCurrency(env.allocated)}
                  </span>
                </div>
                {isOver ? (
                  <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className="absolute inset-0 stripe-pattern rounded-full" />
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-negative rounded-r-full flex items-center justify-center"
                      style={{ width: `${overPct}%` }}
                    >
                      {overPct > 12 && (
                        <span className="text-[7px] font-bold text-white tracking-wider">OVER</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${env.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
                  {isOver
                    ? `Over by ${formatCurrency(Math.abs(remaining))}`
                    : `${formatCurrency(remaining)} left`}
                </p>
              </div>
            )
          })}
        </div>

        <Button
          variant="outline"
          onClick={onCloseMonth}
          disabled={isClosing}
          className="w-full"
        >
          {isClosing ? "Closing..." : "Close Month"}
        </Button>
      </CardContent>
    </Card>
  )
}
