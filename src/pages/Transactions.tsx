import { useState } from "react"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionTable } from "@/components/transactions/TransactionTable"
import { TransactionFilters } from "@/components/transactions/TransactionFilters"
import { TransactionForm } from "@/components/transactions/TransactionForm"
import { PageTitle } from "@/components/layout/PageTitle"
import type { Transaction } from "@/types/transaction"

export type SortMode = "date-desc" | "date-asc" | "amount-desc" | "amount-asc"

interface FilterState {
  search: string
  accountFilter: string
  categoryFilter: string
  sortMode: SortMode
  filterDate: string
}

export default function TransactionsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    accountFilter: "",
    categoryFilter: "",
    sortMode: "date-desc",
    filterDate: format(new Date(), "yyyy-MM-dd"),
  })

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingTx(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Transactions</PageTitle>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <TransactionFilters filters={filters} onFilterChange={setFilters} />
      <TransactionTable onEdit={handleEdit} filters={filters} />

      <TransactionForm
        open={formOpen}
        onOpenChange={handleFormClose}
        transaction={editingTx}
      />
    </div>
  )
}
