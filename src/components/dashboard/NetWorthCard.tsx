import { formatCurrency } from "@/lib/utils"
import { useAccounts } from "@/hooks/useAccounts"

export function NetWorthCard() {
  const { accounts } = useAccounts()

  const totalAssets = accounts
    .filter((a) => !a.isArchived && a.type !== "credit" && a.type !== "loan")
    .reduce((sum, a) => sum + a.balance, 0)

  return (
    <div className="flex flex-col items-center py-10">
      <p className="text-6xl font-display font-black tracking-tight tabular-nums">
        {formatCurrency(totalAssets)}
      </p>
      <div className="w-12 h-0.5 bg-accent-active rounded-full my-5" />
      <span className="text-sm font-medium text-nezumi">Net Worth</span>
    </div>
  )
}
