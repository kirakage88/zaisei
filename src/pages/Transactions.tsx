import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionTable } from "@/components/transactions/TransactionTable"
import { TransactionFilters } from "@/components/transactions/TransactionFilters"
import { TransactionForm } from "@/components/transactions/TransactionForm"
import type { Transaction } from "@/types/transaction"

interface FilterState {
  search: string
  accountFilter: string
  categoryFilter: string
  sortBy: "date" | "amount"
  sortOrder: "asc" | "desc"
}

export default function TransactionsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    accountFilter: "",
    categoryFilter: "",
    sortBy: "date",
    sortOrder: "desc",
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
        <h1 className="text-2xl font-display font-black accent-underline">Transactions</h1>
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
