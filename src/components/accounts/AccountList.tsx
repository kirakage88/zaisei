import { useState } from "react"
import { Plus, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountCard } from "@/components/accounts/AccountCard"
import { AccountForm } from "@/components/accounts/AccountForm"
import { useAccounts } from "@/hooks/useAccounts"
import type { Account } from "@/types/account"

export function AccountList() {
  const { accounts, archiveAccount, deleteAccount } = useAccounts()
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [tab, setTab] = useState<"active" | "archived">("active")

  const activeAccounts = accounts.filter((a) => !a.isArchived)
  const archivedAccounts = accounts.filter((a) => a.isArchived)
  const displayAccounts = tab === "active" ? activeAccounts : archivedAccounts

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingAccount(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onArchive={archiveAccount}
              onDelete={deleteAccount}
            />
          ))}
        </div>
      )}

      <AccountForm
        open={formOpen}
        onOpenChange={handleFormClose}
        account={editingAccount}
      />
    </div>
  )
}
