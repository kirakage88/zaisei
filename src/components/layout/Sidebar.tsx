import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  TrendingDown,
  PiggyBank,
  BarChart3,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/layout/Logo"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Separator } from "@/components/ui/separator"

const primaryLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/debts", label: "Debts", icon: TrendingDown },
  { to: "/kakeibo", label: "Kakeibo", icon: PiggyBank },
]

const secondaryLinks = [
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
]

function SidebarLink({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-accent-active" />
          )}
          <Icon className="size-5 shrink-0" />
          {label}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-[13.75rem] md:fixed md:inset-y-0 md:flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center px-4">
        <Logo className="h-7 w-auto text-foreground" />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {primaryLinks.map((link) => (
          <SidebarLink key={link.to} {...link} />
        ))}
      </nav>

      <div className="px-3 py-2">
        <Separator className="mb-2" />
        {secondaryLinks.map((link) => (
          <SidebarLink key={link.to} {...link} />
        ))}
        <div className="mt-2 flex items-center justify-end">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
