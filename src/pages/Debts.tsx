import { useMemo, useState } from "react"
import { useDebts } from "@/hooks/useDebts"
import { runSnowball } from "@/lib/snowball"
import { DebtList } from "@/components/debts/DebtList"
import { DebtForm } from "@/components/debts/DebtForm"
import { SnowballCalculator } from "@/components/debts/SnowballCalculator"
import { PayoffChart } from "@/components/debts/PayoffChart"
import { AmortizationTable } from "@/components/debts/AmortizationTable"
import { PageTitle } from "@/components/layout/PageTitle"
import type { Debt } from "@/types/debt"

export default function DebtsPage() {
  const { debts } = useDebts()
  const [formOpen, setFormOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [extraPayment, setExtraPayment] = useState(0)

  const result = useMemo(() => runSnowball(debts, extraPayment), [debts, extraPayment])

  const handleAdd = () => {
    setEditingDebt(null)
    setFormOpen(true)
  }

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt)
    setFormOpen(true)
  }

  return (
    <div>
      <PageTitle>Debts</PageTitle>

      <div className="mt-6">
        <DebtList onAdd={handleAdd} onEdit={handleEdit} />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <SnowballCalculator
          extraPayment={extraPayment}
          onExtraPaymentChange={setExtraPayment}
          result={result}
        />
        <PayoffChart result={result} />
      </div>

      <div className="mt-4">
        <AmortizationTable />
      </div>

      <DebtForm
        open={formOpen}
        onOpenChange={setFormOpen}
        debt={editingDebt}
      />
    </div>
  )
}
