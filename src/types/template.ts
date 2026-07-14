export interface TransactionTemplate {
  id?: number
  name: string
  type: "income" | "expense" | "transfer"
  amount: number
  category: string
  description: string
  accountId: number
  fromAccountId?: number
  toAccountId?: number
  kakeiboTag?: "needs" | "wants" | "savings"
  tags: string[]
  recurrence: {
    enabled: boolean
    frequency: "daily" | "weekly" | "monthly" | "yearly"
    interval: number
    lastCreatedDate?: Date
  }
  createdAt: Date
  updatedAt: Date
}
