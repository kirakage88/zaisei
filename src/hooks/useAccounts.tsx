import { createContext, useContext } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { Account } from "@/types/account"

interface AccountsContextValue {
  accounts: Account[]
  loading: boolean
  addAccount: (account: Omit<Account, "id" | "createdAt" | "updatedAt">) => Promise<number>
  updateAccount: (id: number, changes: Partial<Account>) => Promise<void>
  archiveAccount: (id: number) => Promise<void>
  unarchiveAccount: (id: number) => Promise<void>
  deleteAccount: (id: number) => Promise<void>
}

const AccountsContext = createContext<AccountsContextValue | null>(null)

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const accounts = useLiveQuery(() => db.accounts.toArray(), []) ?? []
  const loading = accounts.length === 0

  const addAccount = async (
    account: Omit<Account, "id" | "createdAt" | "updatedAt">
  ) => {
    const now = new Date()
    return db.accounts.add({
      ...account,
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
