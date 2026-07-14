import { useState } from "react"
import { Plus, Archive } from "lucide-react"
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
import type { Account } from "@/types/account"

export function AccountList() {
  const { accounts, archiveAccount, deleteAccount, reorderAccounts } = useAccounts()
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [tab, setTab] = useState<"active" | "archived">("active")

  const activeAccounts = accounts.filter((a) => !a.isArchived)
  const archivedAccounts = accounts.filter((a) => a.isArchived)
  const displayAccounts = tab === "active" ? activeAccounts : archivedAccounts

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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
        <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "archived")}>
          <TabsList className="select-none">
            <TabsTrigger value="active">
              Active ({activeAccounts.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({archivedAccounts.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 select-none">
              {displayAccounts.map((account) => (
                <SortableAccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEdit}
                  onArchive={archiveAccount}
                  onDelete={deleteAccount}
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
