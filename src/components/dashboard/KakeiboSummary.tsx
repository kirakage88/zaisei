import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useKakeibo } from "@/hooks/useKakeibo"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"

function useAutoSpent(year: number, month: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

  return useLiveQuery(async () => {
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
  }, [year, month]) ?? { needs: 0, wants: 0, savings: 0 }
}

export function KakeiboSummary() {
  const { months } = useKakeibo()

  const now = new Date()
  const currentMonth = months.find(
    (m) => m.year === now.getFullYear() && m.month === now.getMonth() + 1 && !m.isClosed
  )

  const spent = useAutoSpent(
    currentMonth?.year ?? now.getFullYear(),
    currentMonth?.month ?? now.getMonth() + 1
  )

  if (!currentMonth) {
    return (
      <Card>
        <CardContent className="p-5">
          <span className="text-xs text-muted-foreground">Kakeibo</span>
          <p className="text-sm text-muted-foreground mt-3">
            No active month.
          </p>
        </CardContent>
      </Card>
    )
  }

  const envelopes = [
    {
      label: "Needs",
      allocated: currentMonth.needsAllocated,
      spent: spent.needs,
      color: "bg-sumi",
    },
    {
      label: "Wants",
      allocated: currentMonth.wantsAllocated,
      spent: spent.wants,
      color: "bg-nezumi",
    },
    {
      label: "Savings",
      allocated: currentMonth.savingsAllocated,
      spent: spent.savings,
      color: "bg-accent-active",
    },
  ]

  return (
    <Card>
      <CardContent className="p-5">
        <span className="text-xs text-muted-foreground">Kakeibo</span>
        <div className="mt-3 space-y-3">
          {envelopes.map((env) => {
            const pct = env.allocated > 0 ? Math.min((env.spent / env.allocated) * 100, 100) : 0
            const remaining = env.allocated - env.spent
            const isOver = remaining < 0
            const overPct = isOver && env.allocated > 0
              ? Math.min(((env.spent - env.allocated) / env.allocated) * 100, 50)
              : 0
            return (
              <div key={env.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{env.label}</span>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {formatCurrency(env.spent)} / {formatCurrency(env.allocated)}
                  </span>
                </div>
                {isOver ? (
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${env.color}`}
                      style={{ width: "100%" }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-negative rounded-r-full flex items-center justify-center"
                      style={{ width: `${overPct}%` }}
                    >
                      {overPct > 12 && (
                        <span className="text-[6px] font-bold text-white tracking-wider">OVER</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${env.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                  {isOver ? `Over by ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} left`}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
