import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  TrendingDown,
  PiggyBank,
  MoreHorizontal,
  BarChart3,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

const primaryLinks = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/transactions", label: "Txns", icon: ArrowLeftRight },
  { to: "/debts", label: "Debts", icon: TrendingDown },
  { to: "/kakeibo", label: "Budget", icon: PiggyBank },
]

const secondaryLinks = [
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
]

function BottomNavLink({
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
          "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-all duration-200 min-w-0 rounded-lg",
          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
        )
      }
    >
      <span title={label}><Icon className="size-5 shrink-0" /></span>
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

export function BottomNav() {
  return (
    <nav className="flex justify-evenly md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card px-2 pt-1 pb-[env(safe-area-inset-bottom)]">
      {primaryLinks.map((link) => (
        <BottomNavLink key={link.to} {...link} />
      ))}

      <Sheet>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors duration-200 min-w-0">
            <MoreHorizontal className="size-5 shrink-0" />
            <span className="truncate">More</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-1">
            {secondaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <link.icon className="size-5 shrink-0" />
                {link.label}
              </NavLink>
            ))}
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <p className="text-center text-[10px] text-muted-foreground/50 pt-2 pb-1">v0.6.0</p>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
