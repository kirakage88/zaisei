import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAccounts } from "@/hooks/useAccounts"
import type { Transaction } from "@/types/transaction"

interface DrillDownTableProps {
  transactions: Transaction[]
}

export function DrillDownTable({ transactions }: DrillDownTableProps) {
  const { accounts } = useAccounts()
  const getAccountName = (id: number) =>
    accounts.find((a) => a.id === id)?.name ?? "Unknown"

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No transactions in this category.
      </p>
    )
  }

  return (
    <div className="rounded-md border border-accent-resting/40">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Account</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-sm pl-4">
                  {formatDate(new Date(tx.date))}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {tx.description}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getAccountName(tx.accountId)}
                </TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums text-nezumi">
                  -{formatCurrency(tx.amount)}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
