import { createContext, useContext } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { KAKEIBO_RATIOS } from "@/lib/constants"
import type { KakeiboMonth, KakeiboCheckIn } from "@/types/kakeibo"

export function autoCalcAllocations(income: number) {
  const savingsAllocated = Math.round(income * KAKEIBO_RATIOS.savingsRatio)
  const spendable = income - savingsAllocated
  const needsAllocated = Math.round(spendable * (KAKEIBO_RATIOS.needsRatio / (1 - KAKEIBO_RATIOS.savingsRatio)))
  const wantsAllocated = spendable - needsAllocated
  return { needsAllocated, wantsAllocated, savingsAllocated }
}

interface KakeiboContextValue {
  months: KakeiboMonth[]
  checkins: KakeiboCheckIn[]
  loading: boolean
  createMonth: (
    month: Omit<KakeiboMonth, "id" | "createdAt" | "isClosed" | "needsSpent" | "wantsSpent" | "savingsSpent">
  ) => Promise<number>
  updateMonth: (id: number, changes: Partial<KakeiboMonth>) => Promise<void>
  closeMonth: (id: number) => Promise<void>
  addCheckin: (
    checkin: Omit<KakeiboCheckIn, "id">
  ) => Promise<number>
  updateSpent: (
    monthId: number,
    needs: number,
    wants: number,
    savings: number
  ) => Promise<void>
}

const KakeiboContext = createContext<KakeiboContextValue | null>(null)

export function KakeiboProvider({ children }: { children: React.ReactNode }) {
  const months = useLiveQuery(() => db.kakeiboMonths.toArray(), []) ?? []
  const checkins = useLiveQuery(() => db.kakeiboCheckins.toArray(), []) ?? []
  const loading = months.length === 0

  const createMonth = async (
    month: Omit<KakeiboMonth, "id" | "createdAt" | "isClosed" | "needsSpent" | "wantsSpent" | "savingsSpent">
  ) => {
    return db.kakeiboMonths.add({
      ...month,
      needsSpent: 0,
      wantsSpent: 0,
      savingsSpent: 0,
      isClosed: false,
      createdAt: new Date(),
    })
  }

  const closeMonth = async (id: number) => {
    await db.kakeiboMonths.update(id, {
      isClosed: true,
      closedAt: new Date(),
    })
  }

  const addCheckin = async (
    checkin: Omit<KakeiboCheckIn, "id">
  ) => {
    return db.kakeiboCheckins.add({
      ...checkin,
    })
  }

  const updateMonth = async (id: number, changes: Partial<KakeiboMonth>) => {
    await db.kakeiboMonths.update(id, changes)
  }

  const updateSpent = async (
    monthId: number,
    needs: number,
    wants: number,
    savings: number
  ) => {
    await db.kakeiboMonths.update(monthId, {
      needsSpent: needs,
      wantsSpent: wants,
      savingsSpent: savings,
    })
  }

  return (
    <KakeiboContext.Provider
      value={{
        months,
        checkins,
        loading,
        createMonth,
        updateMonth,
        closeMonth,
        addCheckin,
        updateSpent,
      }}
    >
      {children}
    </KakeiboContext.Provider>
  )
}

export function useKakeibo(): KakeiboContextValue {
  const context = useContext(KakeiboContext)
  if (!context) {
    throw new Error("useKakeibo must be used within a KakeiboProvider")
  }
  return context
}
