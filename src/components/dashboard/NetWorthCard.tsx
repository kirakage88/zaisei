import { useState } from "react"
import { Settings, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatCurrency } from "@/lib/utils"
import { useAccounts } from "@/hooks/useAccounts"

export function NetWorthCard() {
  const { accounts, updateAccount } = useAccounts()
  const [hidden, setHidden] = useState(false)

  const activeAccounts = accounts.filter((a) => !a.isArchived)
  const totalAssets = accounts
    .filter((a) => !a.isArchived && a.netWorthIncluded !== false && a.type !== "credit" && a.type !== "loan")
    .reduce((sum, a) => sum + a.balance, 0)

  return (
    <div className="relative flex flex-col items-center py-10 rounded-xl transition-colors hover:bg-muted/50">
      <p className="text-6xl font-display font-black tracking-tight tabular-nums">
        {hidden ? "₱ ————" : formatCurrency(totalAssets)}
      </p>
      <div className="w-12 h-0.5 bg-accent-active rounded-full my-5" />
      <span className="text-sm font-medium text-nezumi">Net Worth</span>

      <div className="absolute bottom-3 right-3 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setHidden(!hidden)}
          className="text-muted-foreground"
          title={hidden ? "Show amount" : "Hide amount"}
        >
          {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              title="Choose accounts"
            >
              <Settings className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <p className="text-xs font-medium mb-2">Include in Net Worth</p>
            <div className="space-y-1">
              {activeAccounts.map((account) => (
                <label
                  key={account.id}
                  className="flex items-center gap-2 text-sm cursor-pointer py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={account.netWorthIncluded !== false}
                    onChange={() =>
                      updateAccount(account.id!, {
                        netWorthIncluded: account.netWorthIncluded === false ? true : false,
                      })
                    }
                    className="accent-primary"
                  />
                  <span className="truncate">{account.name}</span>
                </label>
              ))}
              {activeAccounts.length === 0 && (
                <p className="text-xs text-muted-foreground">No accounts yet.</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
