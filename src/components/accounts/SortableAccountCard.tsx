import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AccountCard } from "@/components/accounts/AccountCard"
import type { Account } from "@/types/account"

interface SortableAccountCardProps {
  account: Account
  onEdit: (account: Account) => void
  onArchive: (id: number) => void
  onDelete: (id: number) => void
}

export function SortableAccountCard({
  account,
  onEdit,
  onArchive,
  onDelete,
}: SortableAccountCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id! })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    scale: isDragging ? "0.95" : "1",
    filter: isDragging ? "blur(2px)" : "none",
    boxShadow: isDragging ? "0 0 20px 4px var(--accent-active)" : "none",
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <AccountCard
        account={account}
        onEdit={onEdit}
        onArchive={onArchive}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  )
}
