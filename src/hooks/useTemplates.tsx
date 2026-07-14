import { createContext, useContext, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { useTransactions } from "@/hooks/useTransactions"
import type { TransactionTemplate } from "@/types/template"

interface TemplatesContextValue {
  templates: TransactionTemplate[]
  loading: boolean
  addTemplate: (
    template: Omit<TransactionTemplate, "id" | "createdAt" | "updatedAt">
  ) => Promise<number>
  updateTemplate: (id: number, changes: Partial<TransactionTemplate>) => Promise<void>
  deleteTemplate: (id: number) => Promise<void>
}

const TemplatesContext = createContext<TemplatesContextValue | null>(null)

function getNextDueDate(lastCreated: Date, frequency: string, interval: number): Date {
  const next = new Date(lastCreated)
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + interval)
      break
    case "weekly":
      next.setDate(next.getDate() + interval * 7)
      break
    case "monthly":
      next.setMonth(next.getMonth() + interval)
      break
    case "yearly":
      next.setFullYear(next.getFullYear() + interval)
      break
  }
  return next
}

export function TemplatesProvider({ children }: { children: React.ReactNode }) {
  const templates = useLiveQuery(() => db.transactionTemplates.toArray(), []) ?? []
  const { addTransaction } = useTransactions()
  const loading = templates.length === 0

  const addTemplate = async (
    template: Omit<TransactionTemplate, "id" | "createdAt" | "updatedAt">
  ) => {
    const now = new Date()
    return db.transactionTemplates.add({
      ...template,
      createdAt: now,
      updatedAt: now,
    })
  }

  const updateTemplate = async (id: number, changes: Partial<TransactionTemplate>) => {
    await db.transactionTemplates.update(id, {
      ...changes,
      updatedAt: new Date(),
    })
  }

  const deleteTemplate = async (id: number) => {
    await db.transactionTemplates.delete(id)
  }

  // Evaluate recurrence on mount
  useEffect(() => {
    if (templates.length === 0) return

    const run = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const template of templates) {
        if (!template.recurrence?.enabled) continue

        const lastCreated = template.recurrence.lastCreatedDate
          ? new Date(template.recurrence.lastCreatedDate)
          : null

        // Determine if this template is due
        let isDue = false
        if (!lastCreated) {
          // Never created — create on first load
          isDue = true
        } else {
          const nextDue = getNextDueDate(
            lastCreated,
            template.recurrence.frequency,
            template.recurrence.interval
          )
          if (nextDue <= today) {
            isDue = true
          }
        }

        if (isDue) {
          // Create the transaction via the normal write path
          await addTransaction({
            type: template.type,
            amount: template.amount,
            category: template.type === "transfer" ? "transfer" : template.category,
            description: template.description,
            date: new Date(),
            accountId: template.accountId,
            fromAccountId: template.fromAccountId,
            toAccountId: template.toAccountId,
            kakeiboTag: template.kakeiboTag,
            tags: template.tags ?? [],
          })

          // Update lastCreatedDate
          await db.transactionTemplates.update(template.id!, {
            recurrence: {
              ...template.recurrence,
              lastCreatedDate: new Date(),
            },
            updatedAt: new Date(),
          })
        }
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only on mount

  return (
    <TemplatesContext.Provider
      value={{
        templates,
        loading,
        addTemplate,
        updateTemplate,
        deleteTemplate,
      }}
    >
      {children}
    </TemplatesContext.Provider>
  )
}

export function useTemplates(): TemplatesContextValue {
  const context = useContext(TemplatesContext)
  if (!context) {
    throw new Error("useTemplates must be used within a TemplatesProvider")
  }
  return context
}
