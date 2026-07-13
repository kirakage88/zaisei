import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
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
import { useDebts } from "@/hooks/useDebts"
import { DEBT_TYPES } from "@/lib/constants"
import type { Debt } from "@/types/debt"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  type: z.enum(["personal_loan", "credit_card", "car_loan", "student_loan", "other"]),
  creditLimit: z.coerce.number().min(0, "Must be 0 or greater"),
  remainingBalance: z.coerce.number().min(0, "Must be 0 or greater"),
  minimumPayment: z.coerce.number().min(0, "Must be 0 or greater"),
  interestRate: z.coerce.number().min(0, "Must be 0 or greater").optional().default(0),
  dueDay: z.coerce.number().min(1).max(31),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface DebtFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  debt?: Debt | null
}

export function DebtForm({ open, onOpenChange, debt }: DebtFormProps) {
  const { addDebt, updateDebt } = useDebts()
  const isEditing = !!debt

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: "",
      type: "personal_loan",
      creditLimit: 0,
      remainingBalance: 0,
      minimumPayment: 0,
      interestRate: 0,
      dueDay: 1,
      notes: "",
    },
  })

  useEffect(() => {
    if (debt) {
      form.reset({
        name: debt.name,
        type: debt.type,
        creditLimit: debt.creditLimit,
        remainingBalance: debt.remainingBalance,
        minimumPayment: debt.minimumPayment,
        interestRate: debt.interestRate,
        dueDay: debt.dueDay,
        notes: debt.notes || "",
      })
    } else {
      form.reset({
        name: "",
        type: "personal_loan",
        creditLimit: 0,
        remainingBalance: 0,
        minimumPayment: 0,
        interestRate: 0,
        dueDay: 1,
        notes: "",
      })
    }
  }, [debt, form])

  const onSubmit = async (values: FormValues) => {
    if (isEditing && debt.id) {
      await updateDebt(debt.id, values)
    } else {
      await addDebt({
        ...values,
        isActive: true,
        startDate: new Date(),
      })
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Debt" : "Add Debt"}</SheetTitle>
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
                    <Input placeholder="e.g. GLoan, SPayLater" {...field} />
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
                    <div className="grid grid-cols-2 gap-2">
                      {DEBT_TYPES.map((type) => (
                        <Button
                          key={type.value}
                          type="button"
                          variant={field.value === type.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => field.onChange(type.value)}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="remainingBalance"
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
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Limit</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minimumPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min. Payment</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>APR % (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Day of Month</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={31} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mb-2">
              {isEditing ? "Save Changes" : "Add Debt"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
