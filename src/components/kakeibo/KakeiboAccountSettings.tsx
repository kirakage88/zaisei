import { useState } from "react"
import { Settings, ChevronDown } from "lucide-react"
import { useAccounts } from "@/hooks/useAccounts"
import { cn } from "@/lib/utils"

export function KakeiboAccountSettings() {
  const { accounts, updateAccount } = useAccounts()
  const [expanded, setExpanded] = useState(false)

  const activeAccounts = accounts.filter((a) => !a.isArchived)

  return (
    <div className="w-fit">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-fit rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
      >
        <Settings className="size-3.5" />
        <span className="font-medium">Include Accounts</span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="mt-2 ml-3 space-y-1">
          <p className="text-[11px] text-muted-foreground mb-2">
            Choose which accounts are included in Kakeibo budget calculations.
          </p>
          {activeAccounts.map((account) => (
            <label
              key={account.id}
              className="flex items-center gap-2 text-sm cursor-pointer py-0.5"
            >
              <input
                type="checkbox"
                checked={account.kakeiboIncluded !== false}
                onChange={() =>
                  updateAccount(account.id!, {
                    kakeiboIncluded: account.kakeiboIncluded === false ? true : false,
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
      )}
    </div>
  )
}
