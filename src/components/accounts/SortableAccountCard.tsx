import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AccountCard } from "@/components/accounts/AccountCard"
import type { Account } from "@/types/account"

interface SortableAccountCardProps {
  account: Account
  onEdit: (account: Account) => void
  onArchive: (id: number) => void
  onDelete: (id: number) => void
  compact?: boolean
}

export function SortableAccountCard({
  account,
  onEdit,
  onArchive,
  onDelete,
  compact,
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <AccountCard
        account={account}
        onEdit={onEdit}
        onArchive={onArchive}
        onDelete={onDelete}
        compact={compact}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  )
}
