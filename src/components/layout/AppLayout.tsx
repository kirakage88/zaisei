import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

export function AppLayout() {
  const location = useLocation()
  useKeyboardShortcuts()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <BottomNav />
      <main className="md:ml-[13.75rem] min-h-screen pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <div key={location.pathname} className="animate-page-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
