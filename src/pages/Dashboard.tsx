import { NetWorthCard } from "@/components/dashboard/NetWorthCard"
import { CashflowChart } from "@/components/dashboard/CashflowChart"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { KakeiboSummary } from "@/components/dashboard/KakeiboSummary"
import { SnowballSummary } from "@/components/dashboard/SnowballSummary"

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-display font-black mb-6 accent-underline">Dashboard</h1>
      <div className="animate-card-in stagger-1"><NetWorthCard /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="animate-card-in stagger-2 h-full"><CashflowChart /></div>
        <div className="animate-card-in stagger-3 h-full"><RecentTransactions /></div>
        <div className="animate-card-in stagger-4 h-full"><KakeiboSummary /></div>
        <div className="animate-card-in stagger-5 h-full"><SnowballSummary /></div>
      </div>
    </div>
  )
}
