import {
  Pencil,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants"
import { useTransactions } from "@/hooks/useTransactions"
import { useAccounts } from "@/hooks/useAccounts"
import type { Transaction } from "@/types/transaction"

interface TransactionTableProps {
  onEdit: (transaction: Transaction) => void
  filters: {
    search: string
    accountFilter: string
    categoryFilter: string
    sortBy: "date" | "amount"
    sortOrder: "asc" | "desc"
  }
}

export function TransactionTable({ onEdit, filters }: TransactionTableProps) {
  const { transactions, deleteTransaction } = useTransactions()
  const { accounts } = useAccounts()

  const getAccountName = (id: number) =>
    accounts.find((a) => a.id === id)?.name || "Unknown"

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]
  const getCategoryLabel = (value: string) =>
    allCategories.find((c) => c.value === value)?.label || value

  const filtered = transactions
    .filter((tx) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!tx.description.toLowerCase().includes(q)) return false
      }
      if (filters.accountFilter && filters.accountFilter !== "all" && tx.accountId !== Number(filters.accountFilter))
        return false
      if (filters.categoryFilter && filters.categoryFilter !== "all" && tx.category !== filters.categoryFilter)
        return false
      return true
    })
    .sort((a, b) => {
      const dir = filters.sortOrder === "asc" ? 1 : -1
      if (filters.sortBy === "date") {
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir
      }
      return (a.amount - b.amount) * dir
    })

  const typeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "income":
        return "text-accent-active"
      case "expense":
        return "text-nezumi"
      case "transfer":
        return ""
    }
  }

  return (
    <div className="rounded-md border border-accent-resting/40">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Account</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((tx) => (
              <TableRow key={tx.id} className="transition-colors hover:bg-muted/40">
                <TableCell className="text-sm pl-4">
                  {formatDate(new Date(tx.date))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{tx.description}</span>
                    {tx.kakeiboTag && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {tx.kakeiboTag}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getCategoryLabel(tx.category)}
                </TableCell>
                <TableCell className="text-sm">
                  {tx.type === "transfer"
                    ? `${getAccountName(tx.fromAccountId!)} → ${getAccountName(tx.toAccountId!)}`
                    : getAccountName(tx.accountId)}
                </TableCell>
                <TableCell className={`text-right font-medium text-sm tabular-nums ${typeColor(tx.type)}`}>
                  {tx.type === "expense" ? "-" : tx.type === "transfer" ? "" : "+"}
                  {formatCurrency(tx.amount)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <Pencil className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(tx)}>
                        <Pencil className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteTransaction(tx.id!)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
