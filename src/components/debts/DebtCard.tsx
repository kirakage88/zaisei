import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import { DEBT_TYPES } from "@/lib/constants"
import type { Debt } from "@/types/debt"

interface DebtCardProps {
  debt: Debt
  onEdit: (debt: Debt) => void
  onDelete: (id: number) => void
}

export function DebtCard({ debt, onEdit, onDelete }: DebtCardProps) {
  const typeLabel = DEBT_TYPES.find((t) => t.value === debt.type)?.label || debt.type
  const utilization = debt.creditLimit > 0 ? (debt.remainingBalance / debt.creditLimit) * 100 : 0
  const utilColor =
    utilization >= 80 ? "bg-negative" : "bg-accent-active"

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="text-left">
            <p className="font-medium text-sm">{debt.name}</p>
            <Badge variant="secondary" className="text-[10px] mt-0.5">
              {typeLabel}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(debt)}>
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(debt.id!)}
                className="text-destructive"
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4">
          <p className="text-2xl font-display font-black tabular-nums">
            {formatCurrency(debt.remainingBalance)}
          </p>
        </div>

        {debt.creditLimit > 0 && (
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${utilColor}`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
              {utilization.toFixed(0)}% utilized
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          {debt.interestRate > 0 && (
            <span>
              <span className="font-medium text-foreground">{debt.interestRate}%</span> APR
            </span>
          )}
          <span>
            Min <span className="font-medium text-foreground tabular-nums">{formatCurrency(debt.minimumPayment)}</span>/mo
          </span>
          <span>
            Due <span className="font-medium text-foreground">{debt.dueDay}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
