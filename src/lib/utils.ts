import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount)
  return `₱\u00A0${abs.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatMonthYear(year: number, month: number): string {
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString("en-PH", { year: "numeric", month: "long" })
}
