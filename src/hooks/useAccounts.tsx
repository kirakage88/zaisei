import { createContext, useContext, useMemo } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { Account } from "@/types/account"

interface AccountsContextValue {
  accounts: Account[]
  loading: boolean
  addAccount: (account: Omit<Account, "id" | "createdAt" | "updatedAt" | "order" | "kakeiboIncluded" | "netWorthIncluded">) => Promise<number>
  updateAccount: (id: number, changes: Partial<Account>) => Promise<void>
  archiveAccount: (id: number) => Promise<void>
  unarchiveAccount: (id: number) => Promise<void>
  deleteAccount: (id: number) => Promise<void>
  reorderAccounts: (orderedIds: number[]) => Promise<void>
}

const AccountsContext = createContext<AccountsContextValue | null>(null)

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const rawAccounts = useLiveQuery(() => db.accounts.toArray(), []) ?? []
  const accounts = useMemo(
    () => [...rawAccounts].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [rawAccounts]
  )
  const loading = rawAccounts.length === 0

  const addAccount = async (
    account: Omit<Account, "id" | "createdAt" | "updatedAt" | "order" | "kakeiboIncluded" | "netWorthIncluded">
  ) => {
    const now = new Date()
    const maxOrder = accounts.reduce((max, a) => Math.max(max, a.order ?? -1), -1)
    return db.accounts.add({
      ...account,
      order: maxOrder + 1,
      kakeiboIncluded: true,
      netWorthIncluded: true,
      createdAt: now,
      updatedAt: now,
    })
  }

  const updateAccount = async (id: number, changes: Partial<Account>) => {
    await db.accounts.update(id, {
      ...changes,
      updatedAt: new Date(),
    })
  }

  const archiveAccount = async (id: number) => {
    await db.accounts.update(id, {
      isArchived: true,
      updatedAt: new Date(),
    })
  }

  const unarchiveAccount = async (id: number) => {
    await db.accounts.update(id, {
      isArchived: false,
      updatedAt: new Date(),
    })
  }

  const deleteAccount = async (id: number) => {
    await db.accounts.delete(id)
  }

  const reorderAccounts = async (orderedIds: number[]) => {
    await db.transaction("rw", db.accounts, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.accounts.update(orderedIds[i], { order: i, updatedAt: new Date() })
      }
    })
  }

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        loading,
        addAccount,
        updateAccount,
        archiveAccount,
        unarchiveAccount,
        deleteAccount,
        reorderAccounts,
      }}
    >
      {children}
    </AccountsContext.Provider>
  )
}

export function useAccounts(): AccountsContextValue {
  const context = useContext(AccountsContext)
  if (!context) {
    throw new Error("useAccounts must be used within an AccountsProvider")
  }
  return context
}
