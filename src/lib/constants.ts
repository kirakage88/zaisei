export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Groceries", icon: "UtensilsCrossed" },
  { value: "transport", label: "Transport", icon: "Car" },
  { value: "bills", label: "Bills & Utilities", icon: "Receipt" },
  { value: "rent", label: "Rent & Housing", icon: "Home" },
  { value: "shopping", label: "Shopping", icon: "ShoppingBag" },
  { value: "health", label: "Health & Wellness", icon: "Heart" },
  { value: "entertainment", label: "Entertainment", icon: "Film" },
  { value: "education", label: "Education", icon: "BookOpen" },
  { value: "dining", label: "Dining Out", icon: "Coffee" },
  { value: "subscription", label: "Subscriptions", icon: "Repeat" },
  { value: "misc", label: "Miscellaneous", icon: "MoreHorizontal" },
] as const

export const INCOME_CATEGORIES = [
  { value: "salary", label: "Salary", icon: "Briefcase" },
  { value: "freelance", label: "Freelance", icon: "Laptop" },
  { value: "gift", label: "Gift", icon: "Gift" },
  { value: "interest", label: "Interest", icon: "TrendingUp" },
  { value: "other_income", label: "Other Income", icon: "PlusCircle" },
] as const

export const ACCOUNT_ICONS = [
  "Wallet",
  "CreditCard",
  "Banknote",
  "Building2",
  "PiggyBank",
  "Landmark",
  "CircleDollarSign",
  "Coins",
] as const

export const ACCOUNT_TYPES = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit", label: "Credit Card" },
  { value: "loan", label: "Loan" },
  { value: "cash", label: "Cash" },
  { value: "ewallet", label: "E-Wallet" },
] as const

export const DEBT_TYPES = [
  { value: "personal_loan", label: "Personal Loan" },
  { value: "credit_card", label: "Credit Card" },
  { value: "car_loan", label: "Car Loan" },
  { value: "student_loan", label: "Student Loan" },
  { value: "other", label: "Other" },
] as const

export const KAKEIBO_RATIOS = {
  savingsRatio: 0.2,
  needsRatio: 0.48,
  wantsRatio: 0.32,
} as const
