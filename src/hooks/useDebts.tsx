import { createContext, useContext } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { Debt } from "@/types/debt"

interface DebtsContextValue {
  debts: Debt[]
  loading: boolean
  addDebt: (debt: Omit<Debt, "id" | "createdAt" | "updatedAt">) => Promise<number>
  updateDebt: (id: number, changes: Partial<Debt>) => Promise<void>
  deactivateDebt: (id: number) => Promise<void>
  deleteDebt: (id: number) => Promise<void>
}

const DebtsContext = createContext<DebtsContextValue | null>(null)

export function DebtsProvider({ children }: { children: React.ReactNode }) {
  const debts = useLiveQuery(() => db.debts.toArray(), []) ?? []
  const loading = debts.length === 0

  const addDebt = async (
    debt: Omit<Debt, "id" | "createdAt" | "updatedAt">
  ) => {
    const now = new Date()
    return db.debts.add({
      ...debt,
      createdAt: now,
      updatedAt: now,
    })
  }

  const updateDebt = async (id: number, changes: Partial<Debt>) => {
    await db.debts.update(id, {
      ...changes,
      updatedAt: new Date(),
    })
  }

  const deactivateDebt = async (id: number) => {
    await db.debts.update(id, {
      isActive: false,
      updatedAt: new Date(),
    })
  }

  const deleteDebt = async (id: number) => {
    await db.debts.delete(id)
  }

  return (
    <DebtsContext.Provider
      value={{ debts, loading, addDebt, updateDebt, deactivateDebt, deleteDebt }}
    >
      {children}
    </DebtsContext.Provider>
  )
}

export function useDebts(): DebtsContextValue {
  const context = useContext(DebtsContext)
  if (!context) {
    throw new Error("useDebts must be used within a DebtsProvider")
  }
  return context
}
