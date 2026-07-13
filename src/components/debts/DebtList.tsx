import { useMemo } from "react"
import { Plus, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDebts } from "@/hooks/useDebts"
import { DebtCard } from "@/components/debts/DebtCard"
import type { Debt } from "@/types/debt"

interface DebtListProps {
  onAdd: () => void
  onEdit: (debt: Debt) => void
}

export function DebtList({ onAdd, onEdit }: DebtListProps) {
  const { debts, deleteDebt } = useDebts()

  const activeDebts = useMemo(
    () =>
      debts
        .filter((d) => d.isActive)
        .sort((a, b) => a.remainingBalance - b.remainingBalance),
    [debts]
  )

  if (activeDebts.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <TrendingDown className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No active debts</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add a debt to start tracking your payoff journey.
        </p>
        <Button size="sm" className="mt-4" onClick={onAdd}>
          <Plus className="size-4 mr-1" />
          Add Debt
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {activeDebts.length} active {activeDebts.length === 1 ? "debt" : "debts"} — sorted by balance (snowball)
        </p>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="size-4 mr-1" />
          Add
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeDebts.map((debt) => (
          <DebtCard
            key={debt.id}
            debt={debt}
            onEdit={onEdit}
            onDelete={deleteDebt}
          />
        ))}
      </div>
    </div>
  )
}
