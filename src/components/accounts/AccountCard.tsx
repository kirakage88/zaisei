import { useState } from "react"
import { Wallet, CreditCard, Banknote, Building2, PiggyBank, Landmark, CircleDollarSign, Coins, ChevronDown, GripVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Archive, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import { CashflowLine, TimeRangeSelector, useCashflowData, TIME_RANGE_HOURS, type TimeRange } from "@/components/cashflow/CashflowLine"
import type { Account } from "@/types/account"

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Wallet,
  CreditCard,
  Banknote,
  Building2,
  PiggyBank,
  Landmark,
  CircleDollarSign,
  Coins,
}

interface AccountCardProps {
  account: Account
  onEdit: (account: Account) => void
  onArchive: (id: number) => void
  onDelete: (id: number) => void
  dragHandleProps?: Record<string, unknown>
  isDragging?: boolean
}

export function AccountCard({
  account,
  onEdit,
  onArchive,
  onDelete,
  dragHandleProps,
  isDragging,
}: AccountCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [range, setRange] = useState<TimeRange>("30d")
  const { netTotal } = useCashflowData(TIME_RANGE_HOURS[range], account.id!)
  const Icon = iconMap[account.icon] || Wallet

  return (
    <Card className={`relative overflow-hidden ${isDragging ? "opacity-50" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {dragHandleProps && (
              <button
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
                {...dragHandleProps}
              >
                <GripVertical className="size-4" />
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-3 cursor-pointer"
            >
              {/* Brand-color exception: account.color is user-chosen and may be a
                  real-world brand color. Scoped to this icon badge only — all other
                  UI elements use theme accent tokens. See AccountForm.tsx for the
                  full exception rule. */}
              <div
                className="flex size-10 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110"
                style={{ backgroundColor: account.color + "20" }}
              >
                <Icon className="size-5" style={{ color: account.color }} />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{account.name}</p>
                <Badge variant="secondary" className="text-[10px] mt-0.5">
                  {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                </Badge>
              </div>
              <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(account)}>
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(account.id!)}>
                <Archive className="size-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(account.id!)}
                className="text-destructive"
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4">
          <p className="text-2xl font-display font-black tabular-nums">{formatCurrency(account.balance)}</p>
        </div>

        {expanded && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground tabular-nums">
                Net: {formatCurrency(netTotal)}
              </span>
              <TimeRangeSelector value={range} onChange={setRange} />
            </div>
            <CashflowLine height={80} filterAccountId={account.id!} hours={TIME_RANGE_HOURS[range]} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
