import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useTransactions } from "@/hooks/useTransactions"
import { useAccounts } from "@/hooks/useAccounts"

export function RecentTransactions() {
  const { transactions } = useTransactions()
  const { accounts } = useAccounts()

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const getAccountName = (id: number) =>
    accounts.find((a) => a.id === id)?.name || "Unknown"

  return (
    <Card>
      <CardContent className="p-5">
        <span className="text-xs text-muted-foreground">Recent Transactions</span>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-4">No transactions yet.</p>
        ) : (
          <div className="mt-3 space-y-0.5">
            {recent.map((tx) => {
              const isExpense = tx.type === "expense"
              const isTransfer = tx.type === "transfer"
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">{tx.description}</span>
                      {tx.kakeiboTag && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">
                          {tx.kakeiboTag}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatDate(new Date(tx.date))} · {getAccountName(tx.accountId)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium tabular-nums ${
                      isExpense ? "text-nezumi" : ""
                    }`}
                  >
                    {isExpense ? "-" : isTransfer ? "" : "+"}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
