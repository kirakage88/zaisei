import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAccounts } from "@/hooks/useAccounts"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants"
import type { SortMode } from "@/pages/Transactions"

const SORT_LABELS: Record<SortMode, string> = {
  "date-desc": "Date ↓",
  "date-asc": "Date ↑",
  "amount-desc": "Amount ↓",
  "amount-asc": "Amount ↑",
}

const SORT_CYCLE: SortMode[] = ["date-desc", "date-asc", "amount-desc", "amount-asc"]

interface TransactionFiltersProps {
  filters: {
    search: string
    accountFilter: string
    categoryFilter: string
    sortMode: SortMode
    filterDate: string
  }
  onFilterChange: (filters: TransactionFiltersProps["filters"]) => void
}

export function TransactionFilters({
  filters,
  onFilterChange,
}: TransactionFiltersProps) {
  const { accounts } = useAccounts()
  const activeAccounts = accounts.filter((a) => !a.isArchived)

  const allCategories = [
    ...EXPENSE_CATEGORIES,
    ...INCOME_CATEGORIES,
  ]

  const cycleSort = () => {
    const idx = SORT_CYCLE.indexOf(filters.sortMode)
    const next = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length]
    onFilterChange({ ...filters, sortMode: next })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-9"
          value={filters.search}
          onChange={(e) =>
            onFilterChange({ ...filters, search: e.target.value })
          }
        />
      </div>

      <Select
        value={filters.accountFilter}
        onValueChange={(v) =>
          onFilterChange({ ...filters, accountFilter: v })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All accounts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All accounts</SelectItem>
          {activeAccounts.map((a) => (
            <SelectItem key={a.id} value={String(a.id)}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.categoryFilter}
        onValueChange={(v) =>
          onFilterChange({ ...filters, categoryFilter: v })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {allCategories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        type="date"
        value={filters.filterDate}
        onChange={(e) => onFilterChange({ ...filters, filterDate: e.target.value })}
        className="h-9 rounded-md border border-input bg-background px-3 text-xs tabular-nums"
      />

      <Button variant="outline" size="sm" onClick={cycleSort} className="gap-1">
        {SORT_LABELS[filters.sortMode]}
      </Button>
    </div>
  )
}
