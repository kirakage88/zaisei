import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import {
  Wallet,
  CreditCard,
  Banknote,
  Building2,
  PiggyBank,
  Landmark,
  CircleDollarSign,
  Coins,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAccounts } from "@/hooks/useAccounts"
import { ACCOUNT_TYPES, ACCOUNT_ICONS } from "@/lib/constants"
import type { Account } from "@/types/account"

const ACCOUNT_COLORS = [
  "#C73E3E",
  "#2B5F8A",
  "#7A9033",
  "#D4A04A",
  "#5B8C5A",
  "#BE4B3B",
  "#8A8A8A",
  "#2C2C2C",
]

const iconComponents: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Wallet,
  CreditCard,
  Banknote,
  Building2,
  PiggyBank,
  Landmark,
  CircleDollarSign,
  Coins,
}

const TYPE_ICON_MAP: Record<string, string> = {
  checking: "Building2",
  savings: "PiggyBank",
  credit: "CreditCard",
  loan: "Landmark",
  cash: "Banknote",
  ewallet: "Wallet",
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  type: z.enum(["checking", "savings", "credit", "loan", "cash", "ewallet"]),
  balance: z.coerce.number(),
  color: z.string().min(1),
  icon: z.string().min(1),
})

type FormValues = z.infer<typeof formSchema>

interface AccountFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account | null
}

export function AccountForm({ open, onOpenChange, account }: AccountFormProps) {
  const { addAccount, updateAccount } = useAccounts()
  const isEditing = !!account

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: "",
      type: "checking",
      balance: 0,
      color: ACCOUNT_COLORS[0],
      icon: ACCOUNT_ICONS[0],
    },
  })

  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        type: account.type,
        balance: account.balance,
        color: account.color,
        icon: account.icon,
      })
    } else {
      form.reset({
        name: "",
        type: "checking",
        balance: 0,
        color: ACCOUNT_COLORS[0],
        icon: ACCOUNT_ICONS[0],
      })
    }
  }, [account, form])

  const onSubmit = async (values: FormValues) => {
    if (isEditing && account.id) {
      await updateAccount(account.id, values)
    } else {
      await addAccount({
        ...values,
        isArchived: false,
      })
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Account" : "Add Account"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. BDO Savings" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {ACCOUNT_TYPES.map((type) => (
                        <Button
                          key={type.value}
                          type="button"
                          variant={field.value === type.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            field.onChange(type.value)
                            const suggested = TYPE_ICON_MAP[type.value]
                            if (suggested) form.setValue("icon", suggested)
                          }}
                        >
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balance</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-4 gap-2">
                      {ACCOUNT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "size-7 rounded-full border-2 transition-all",
                            field.value === color
                              ? "border-foreground scale-110"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-4 gap-2">
                      {ACCOUNT_ICONS.map((iconName) => {
                        const IconComp = iconComponents[iconName]
                        return (
                          <button
                            key={iconName}
                            type="button"
                            className={cn(
                              "flex size-10 items-center justify-center rounded-lg border-2 transition-all",
                              field.value === iconName
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-muted-foreground/50"
                            )}
                            onClick={() => field.onChange(iconName)}
                          >
                            {IconComp && (
                              <IconComp
                                className="size-5"
                                style={{ color: form.watch("color") }}
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mb-2">
              {isEditing ? "Save Changes" : "Add Account"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
