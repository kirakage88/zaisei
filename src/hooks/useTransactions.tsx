import { createContext, useContext } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { Transaction } from "@/types/transaction"

interface TransactionsContextValue {
  transactions: Transaction[]
  loading: boolean
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => Promise<number>
  updateTransaction: (
    id: number,
    changes: Partial<Transaction>
  ) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null)

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) ?? []
  const loading = transactions.length === 0

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => {
    const id = await db.transaction(
      "rw",
      [db.transactions, db.accounts],
      async () => {
        const newId = await db.transactions.add({
          ...transaction,
          createdAt: new Date(),
        })

        // Update account balance
        const balanceDelta =
          transaction.type === "income"
            ? transaction.amount
            : transaction.type === "expense"
              ? -transaction.amount
              : 0

        if (balanceDelta !== 0) {
          const account = await db.accounts.get(transaction.accountId)
          if (account) {
            await db.accounts.update(transaction.accountId, {
              balance: account.balance + balanceDelta,
            })
          }
        }

        // Handle transfer: update both accounts
        if (
          transaction.type === "transfer" &&
          transaction.fromAccountId &&
          transaction.toAccountId
        ) {
          const fromAccount = await db.accounts.get(transaction.fromAccountId)
          const toAccount = await db.accounts.get(transaction.toAccountId)
          if (fromAccount) {
            await db.accounts.update(transaction.fromAccountId, {
              balance: fromAccount.balance - transaction.amount,
            })
          }
          if (toAccount) {
            await db.accounts.update(transaction.toAccountId, {
              balance: toAccount.balance + transaction.amount,
            })
          }
        }

        return newId
      }
    )
    return id as number
  }

  const updateTransaction = async (
    id: number,
    changes: Partial<Transaction>
  ) => {
    await db.transactions.update(id, changes)
  }

  const deleteTransaction = async (id: number) => {
    await db.transaction(
      "rw",
      [db.transactions, db.accounts],
      async () => {
        const tx = await db.transactions.get(id)
        if (!tx) return

        // Reverse balance changes
        if (tx.type === "income") {
          const account = await db.accounts.get(tx.accountId)
          if (account) {
            await db.accounts.update(tx.accountId, {
              balance: account.balance - tx.amount,
            })
          }
        } else if (tx.type === "expense") {
          const account = await db.accounts.get(tx.accountId)
          if (account) {
            await db.accounts.update(tx.accountId, {
              balance: account.balance + tx.amount,
            })
          }
        } else if (
          tx.type === "transfer" &&
          tx.fromAccountId &&
          tx.toAccountId
        ) {
          const fromAccount = await db.accounts.get(tx.fromAccountId)
          const toAccount = await db.accounts.get(tx.toAccountId)
          if (fromAccount) {
            await db.accounts.update(tx.fromAccountId, {
              balance: fromAccount.balance + tx.amount,
            })
          }
          if (toAccount) {
            await db.accounts.update(tx.toAccountId, {
              balance: toAccount.balance - tx.amount,
            })
          }
        }

        await db.transactions.delete(id)
      }
    )
  }

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions(): TransactionsContextValue {
  const context = useContext(TransactionsContext)
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider"
    )
  }
  return context
}
