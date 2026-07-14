import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, ArrowLeft, Trash2, Repeat, Save } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTransactions } from "@/hooks/useTransactions"
import { useAccounts } from "@/hooks/useAccounts"
import { useTemplates } from "@/hooks/useTemplates"
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/lib/constants"
import type { Transaction } from "@/types/transaction"
import type { TransactionTemplate } from "@/types/template"

const formSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required").max(200),
  date: z.date(),
  accountId: z.coerce.number(),
  fromAccountId: z.coerce.number().optional(),
  toAccountId: z.coerce.number().optional(),
  kakeiboTag: z.enum(["needs", "wants", "savings"]).optional(),
  tags: z.array(z.string()).default([]),
})

type FormValues = z.infer<typeof formSchema>

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
}

export function TransactionForm({
  open,
  onOpenChange,
  transaction,
}: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactions()
  const { accounts } = useAccounts()
  const { templates, addTemplate, deleteTemplate } = useTemplates()
  const activeAccounts = accounts.filter((a) => !a.isArchived)
  const isEditing = !!transaction

  const [mode, setMode] = useState<"form" | "templates">("form")
  const [templateName, setTemplateName] = useState("")
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      category: "",
      description: "",
      date: new Date(),
      accountId: 0,
      fromAccountId: 0,
      toAccountId: 0,
      kakeiboTag: undefined,
      tags: [],
    },
  })

  const txType = form.watch("type")

  // Reset form and mode when drawer opens/closes
  useEffect(() => {
    if (open) {
      setMode("form")
      setTemplateName("")
    }
  }, [open])

  useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.type === "transfer" ? "transfer" : transaction.category,
        description: transaction.description,
        date: new Date(transaction.date),
        accountId: transaction.accountId,
        fromAccountId: transaction.fromAccountId || 0,
        toAccountId: transaction.toAccountId || 0,
        kakeiboTag: transaction.kakeiboTag,
        tags: transaction.tags || [],
      })
    } else {
      form.reset({
        type: "expense",
        amount: 0,
        category: "",
        description: "",
        date: new Date(),
        accountId: 0,
        fromAccountId: 0,
        toAccountId: 0,
        kakeiboTag: undefined,
        tags: [],
      })
    }
  }, [transaction, form])

  const categories =
    txType === "income"
      ? INCOME_CATEGORIES
      : txType === "expense"
        ? EXPENSE_CATEGORIES
        : []

  const onSubmit = async (values: FormValues) => {
    const txData = {
      type: values.type,
      amount: values.amount,
      category: values.type === "transfer" ? "transfer" : values.category,
      description: values.description,
      date: values.date,
      accountId: values.type === "transfer" ? (values.fromAccountId ?? 0) : values.accountId,
      fromAccountId: values.fromAccountId,
      toAccountId: values.toAccountId,
      kakeiboTag: values.kakeiboTag,
      tags: values.tags,
    }

    if (isEditing && transaction.id) {
      await updateTransaction(transaction.id, txData)
    } else {
      await addTransaction(txData)
    }
    onOpenChange(false)
  }

  const handleSelectTemplate = (template: TransactionTemplate) => {
    form.reset({
      type: template.type,
      amount: template.amount,
      category: template.type === "transfer" ? "transfer" : template.category,
      description: template.description,
      date: new Date(),
      accountId: template.accountId,
      fromAccountId: template.fromAccountId || 0,
      toAccountId: template.toAccountId || 0,
      kakeiboTag: template.kakeiboTag,
      tags: template.tags || [],
    })
    setMode("form")
  }

  const handleSaveAsTemplate = async () => {
    const values = form.getValues()
    if (!templateName.trim()) return

    setIsSavingTemplate(true)
    try {
      await addTemplate({
        name: templateName.trim(),
        type: values.type,
        amount: values.amount,
        category: values.type === "transfer" ? "transfer" : values.category,
        description: values.description,
        accountId: values.type === "transfer" ? (values.fromAccountId ?? 0) : values.accountId,
        fromAccountId: values.fromAccountId,
        toAccountId: values.toAccountId,
        kakeiboTag: values.kakeiboTag,
        tags: values.tags ?? [],
        recurrence: { enabled: false, frequency: "monthly", interval: 1 },
      })
      setTemplateName("")
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const formatRecurrence = (r: TransactionTemplate["recurrence"]) => {
    if (!r?.enabled) return null
    const parts: string[] = []
    if (r.interval > 1) parts.push(`Every ${r.interval}`)
    parts.push(r.frequency)
    if (r.interval <= 1) parts.push("ly")
    return parts.join(" ")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "templates" ? (
              <span className="flex items-center gap-2">
                <button onClick={() => setMode("form")} className="hover:text-foreground">
                  <ArrowLeft className="size-4" />
                </button>
                Templates
              </span>
            ) : isEditing ? (
              "Edit Transaction"
            ) : (
              "Add Transaction"
            )}
          </SheetTitle>
        </SheetHeader>

        {mode === "templates" ? (
          <div className="mt-4 space-y-2">
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No templates yet. Save a transaction as a template to reuse it.
              </p>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <button
                    onClick={() => handleSelectTemplate(template)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{template.name}</span>
                      <Badge variant="outline" className="text-[9px] capitalize">
                        {template.type}
                      </Badge>
                      {template.recurrence?.enabled && (
                        <Badge variant="secondary" className="text-[9px] gap-0.5">
                          <Repeat className="size-2.5" />
                          {formatRecurrence(template.recurrence)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {template.description}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => template.id && deleteTemplate(template.id)}
                    className="text-destructive shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-2">
                        {(["income", "expense", "transfer"] as const).map((type) => (
                          <Button
                            key={type}
                            type="button"
                            variant={field.value === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              field.onChange(type)
                              form.setValue("category", type === "transfer" ? "transfer" : "")
                            }}
                            className="capitalize"
                          >
                            {type}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {txType !== "transfer" && (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Grocery shopping" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => {
                  const dateVal = field.value instanceof Date ? field.value : new Date()
                  const timeStr = `${String(dateVal.getHours()).padStart(2, "0")}:${String(dateVal.getMinutes()).padStart(2, "0")}`
                  return (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 size-4" />
                              {field.value
                                ? format(dateVal, "PPP p")
                                : "Pick a date & time"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3">
                          <Calendar
                            mode="single"
                            selected={dateVal}
                            onSelect={(day) => {
                              if (day) {
                                const prev = dateVal
                                day.setHours(prev.getHours(), prev.getMinutes(), prev.getSeconds())
                                field.onChange(day)
                              }
                            }}
                          />
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Time</span>
                            <Input
                              type="time"
                              value={timeStr}
                              onChange={(e) => {
                                const [h, m] = e.target.value.split(":").map(Number)
                                const d = new Date(dateVal)
                                d.setHours(h, m, 0, 0)
                                field.onChange(d)
                              }}
                              className="h-8 w-auto text-xs"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              {txType === "transfer" ? (
                <>
                  <FormField
                    control={form.control}
                    name="fromAccountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Account</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(v) => field.onChange(Number(v))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              {activeAccounts.map((a) => (
                                <SelectItem key={a.id} value={String(a.id)}>
                                  {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toAccountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Account</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(v) => field.onChange(Number(v))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                              {activeAccounts.map((a) => (
                                <SelectItem key={a.id} value={String(a.id)}>
                                  {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeAccounts.map((a) => (
                              <SelectItem key={a.id} value={String(a.id)}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="kakeiboTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kakeibo Tag (optional)</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-2">
                        {(["needs", "wants", "savings"] as const).map((tag) => (
                          <Button
                            key={tag}
                            type="button"
                            variant={field.value === tag ? "default" : "outline"}
                            size="sm"
                            onClick={() => field.onChange(field.value === tag ? undefined : tag)}
                            className="capitalize"
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full mb-2">
                {isEditing ? "Save Changes" : "Add Transaction"}
              </Button>

              {!isEditing && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setMode("templates")}
                  >
                    Templates
                  </Button>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Template name..."
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="h-9 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 shrink-0 gap-1.5"
                      disabled={!templateName.trim() || isSavingTemplate}
                      onClick={handleSaveAsTemplate}
                    >
                      <Save className="size-3.5" />
                      {isSavingTemplate ? "Saving..." : "Save as Template"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  )
}
