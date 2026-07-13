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
import { ArrowUp, ArrowDown } from "lucide-react"
import { useAccounts } from "@/hooks/useAccounts"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants"

interface TransactionFiltersProps {
  filters: {
    search: string
    accountFilter: string
    categoryFilter: string
    sortBy: "date" | "amount"
    sortOrder: "asc" | "desc"
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

  const toggleSort = () => {
    if (filters.sortBy === "date") {
      onFilterChange({
        ...filters,
        sortBy: "amount",
        sortOrder: "desc",
      })
    } else {
      onFilterChange({
        ...filters,
        sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
      })
    }
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

      <Button variant="outline" size="sm" onClick={toggleSort}>
        {filters.sortBy === "date" ? "Date" : "Amount"}
        {filters.sortOrder === "asc" ? (
          <ArrowUp className="size-3 ml-1" />
        ) : (
          <ArrowDown className="size-3 ml-1" />
        )}
      </Button>
    </div>
  )
}
