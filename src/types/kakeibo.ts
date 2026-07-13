export interface KakeiboMonth {
  id?: number
  year: number
  month: number
  income: number
  needsAllocated: number
  wantsAllocated: number
  savingsAllocated: number
  needsSpent: number
  wantsSpent: number
  savingsSpent: number
  isClosed: boolean
  closedAt?: Date
  createdAt: Date
}

export interface KakeiboCheckIn {
  id?: number
  kakeiboMonthId: number
  weekNumber: number
  date: Date
  reflection: string
  needsRemaining: number
  wantsRemaining: number
  savingsRemaining: number
}
