import { useState } from "react"
import { Plus, Archive, LayoutGrid, List } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SortableAccountCard } from "@/components/accounts/SortableAccountCard"
import { AccountForm } from "@/components/accounts/AccountForm"
import { useAccounts } from "@/hooks/useAccounts"
import { cn } from "@/lib/utils"
import type { Account } from "@/types/account"

type ViewMode = "comfortable" | "compact"
const VIEW_MODE_KEY = "accounts-view-mode"

function getStoredViewMode(): ViewMode {
  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY)
    if (stored === "compact" || stored === "comfortable") return stored
  } catch {}
  return "comfortable"
}

export function AccountList() {
  const { accounts, archiveAccount, deleteAccount, reorderAccounts } = useAccounts()
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [tab, setTab] = useState<"active" | "archived">("active")
  const [viewMode, setViewMode] = useState<ViewMode>(getStoredViewMode)

  const activeAccounts = accounts.filter((a) => !a.isArchived)
  const archivedAccounts = accounts.filter((a) => a.isArchived)
  const displayAccounts = tab === "active" ? activeAccounts : archivedAccounts
  const compact = viewMode === "compact"

  const isTouch = typeof window !== "undefined" && "ontouchstart" in window
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: isTouch
        ? { delay: 1500, tolerance: 5 }
        : { distance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingAccount(null)
  }

  const toggleViewMode = () => {
    const next = compact ? "comfortable" : "compact"
    setViewMode(next)
    try {
      localStorage.setItem(VIEW_MODE_KEY, next)
    } catch {}
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeIndex = displayAccounts.findIndex((a) => a.id === active.id)
    const overIndex = displayAccounts.findIndex((a) => a.id === over.id)
    if (activeIndex === -1 || overIndex === -1) return

    // Compute new order for ALL accounts (not just displayed ones)
    const newDisplayOrder = [...displayAccounts]
    const [moved] = newDisplayOrder.splice(activeIndex, 1)
    newDisplayOrder.splice(overIndex, 0, moved)

    // Build full order: replaced display accounts in their position, keep others
    const allAccountsOrdered = [...accounts]
    const displayStart = tab === "active"
      ? 0
      : allAccountsOrdered.length - archivedAccounts.length

    for (let i = 0; i < newDisplayOrder.length; i++) {
      const idx = allAccountsOrdered.findIndex((a) => a.id === newDisplayOrder[i].id)
      if (idx !== -1) {
        allAccountsOrdered.splice(idx, 1)
        allAccountsOrdered.splice(displayStart + i, 0, newDisplayOrder[i])
      }
    }

    reorderAccounts(allAccountsOrdered.map((a) => a.id!))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "archived")}>
            <TabsList>
              <TabsTrigger value="active">
                Active ({activeAccounts.length})
              </TabsTrigger>
              <TabsTrigger value="archived">
                Archived ({archivedAccounts.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleViewMode}
            className="text-muted-foreground"
            title={compact ? "Comfortable view" : "Compact view"}
          >
            {compact ? (
              <LayoutGrid className="size-4" />
            ) : (
              <List className="size-4" />
            )}
          </Button>
        </div>

        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Account
        </Button>
      </div>

      {displayAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Archive className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {tab === "active"
              ? "No accounts yet. Add your first account to get started."
              : "No archived accounts."}
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayAccounts.map((a) => a.id!)}
            strategy={rectSortingStrategy}
          >
            <div
              className={cn(
                "grid gap-4",
                compact
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}
            >
              {displayAccounts.map((account) => (
                <SortableAccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEdit}
                  onArchive={archiveAccount}
                  onDelete={deleteAccount}
                  compact={compact}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AccountForm
        open={formOpen}
        onOpenChange={handleFormClose}
        account={editingAccount}
      />
    </div>
  )
}
