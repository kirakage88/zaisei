import { useState } from "react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

interface DateRangeFilterProps {
  dateFrom: Date | undefined
  dateTo: Date | undefined
  onChange: (from: Date | undefined, to: Date | undefined) => void
}

const PRESETS = [
  { label: "This Month", getRange: () => {
    const now = new Date()
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
  }},
  { label: "Last 3 Months", getRange: () => {
    const now = new Date()
    return { from: new Date(now.getFullYear(), now.getMonth() - 2, 1), to: now }
  }},
  { label: "Last 6 Months", getRange: () => {
    const now = new Date()
    return { from: new Date(now.getFullYear(), now.getMonth() - 5, 1), to: now }
  }},
  { label: "This Year", getRange: () => {
    const now = new Date()
    return { from: new Date(now.getFullYear(), 0, 1), to: now }
  }},
  { label: "All Time", getRange: () => ({ from: undefined, to: undefined }) },
]

export function DateRangeFilter({ dateFrom, dateTo, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => {
        const range = preset.getRange()
        const isActive =
          range.from?.getTime() === dateFrom?.getTime() &&
          range.to?.getTime() === dateTo?.getTime()
        return (
          <Button
            key={preset.label}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(range.from, range.to)}
            className="text-xs h-7"
          >
            {preset.label}
          </Button>
        )
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5">
            <CalendarIcon className="size-3" />
            {dateFrom && dateTo
              ? `${format(dateFrom, "MMM d")} – ${format(dateTo, "MMM d")}`
              : "Custom Range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex gap-2 p-2">
            <div>
              <p className="text-[10px] text-muted-foreground px-2 mb-1">From</p>
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={(d) => onChange(d ?? undefined, dateTo)}
              />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground px-2 mb-1">To</p>
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={(d) => onChange(dateFrom, d ?? undefined)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
