export interface Debt {
  id?: number
  name: string
  type: "personal_loan" | "credit_card" | "car_loan" | "student_loan" | "other"
  creditLimit: number
  remainingBalance: number
  minimumPayment: number
  interestRate: number
  dueDay: number
  isActive: boolean
  startDate: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}
