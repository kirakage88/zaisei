import type { Debt } from "@/types/debt"

interface WorkingDebt {
  id: number
  name: string
  balance: number
  minPayment: number
  monthlyRate: number
}

export interface DebtSnapshot {
  id: number
  name: string
  remaining: number
}

export interface MonthSnapshot {
  month: number
  debts: DebtSnapshot[]
  totalRemaining: number
}

export interface SnowballResult {
  timeline: MonthSnapshot[]
  monthsToPayoff: number
  totalPaid: number
  totalInterest: number
}

export function runSnowball(debts: Debt[], extraPayment: number): SnowballResult | null {
  const active = debts
    .filter((d) => d.isActive)
    .sort((a, b) => a.remainingBalance - b.remainingBalance)

  if (active.length === 0) return null

  const working: WorkingDebt[] = active.map((d) => ({
    id: d.id!,
    name: d.name,
    balance: d.remainingBalance,
    minPayment: d.minimumPayment,
    monthlyRate: d.interestRate / 100 / 12,
  }))

  const timeline: MonthSnapshot[] = []
  let totalPaid = 0
  let totalInterest = 0
  const maxMonths = 360

  for (let m = 1; m <= maxMonths; m++) {
    let monthPaid = 0
    let monthInterest = 0

    for (const d of working) {
      if (d.balance <= 0) continue
      const interest = d.balance * d.monthlyRate
      d.balance += interest
      monthInterest += interest
    }

    for (const d of working) {
      if (d.balance <= 0) continue
      const payment = Math.min(d.minPayment, d.balance)
      d.balance -= payment
      monthPaid += payment
    }

    let extra = extraPayment
    for (const d of working) {
      if (extra <= 0 || d.balance <= 0) continue
      const payment = Math.min(extra, d.balance)
      d.balance -= payment
      monthPaid += payment
      extra -= payment
    }

    totalPaid += monthPaid
    totalInterest += monthInterest

    const snapshots = active.map((d) => {
      const w = working.find((w) => w.id === d.id)!
      return { id: d.id!, name: d.name, remaining: Math.max(0, w.balance) }
    })

    timeline.push({
      month: m,
      debts: snapshots,
      totalRemaining: snapshots.reduce((s, d) => s + d.remaining, 0),
    })

    if (working.every((d) => d.balance <= 0.01)) break
  }

  return {
    timeline,
    monthsToPayoff: timeline.length,
    totalPaid,
    totalInterest,
  }
}
