export interface Transaction {
  id?: number
  accountId: number
  type: "income" | "expense" | "transfer"
  amount: number
  category: string
  subcategory?: string
  description: string
  date: Date
  fromAccountId?: number
  toAccountId?: number
  kakeiboTag?: "needs" | "wants" | "savings"
  tags: string[]
  createdAt: Date
}
