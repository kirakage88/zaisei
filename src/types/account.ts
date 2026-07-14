export interface Account {
  id?: number
  name: string
  type: "checking" | "savings" | "credit" | "loan" | "cash" | "ewallet"
  balance: number
  color: string
  icon: string
  isArchived: boolean
  order: number
  kakeiboIncluded: boolean
  netWorthIncluded: boolean
  createdAt: Date
  updatedAt: Date
}
