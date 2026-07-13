import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useKakeibo } from "@/hooks/useKakeibo"
import { formatCurrency } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import type { KakeiboMonth, KakeiboCheckIn } from "@/types/kakeibo"

interface WeeklyCheckInProps {
  month: KakeiboMonth
  spent: { needs: number; wants: number; savings: number }
  checkins: KakeiboCheckIn[]
}

export function WeeklyCheckIn({ month, spent, checkins }: WeeklyCheckInProps) {
  const { addCheckin } = useKakeibo()
  const [reflection, setReflection] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const monthCheckins = checkins
    .filter((c) => c.kakeiboMonthId === month.id)
    .sort((a, b) => a.weekNumber - b.weekNumber)

  const nextWeek = monthCheckins.length + 1
  if (nextWeek > 5) return null

  const needsRemaining = month.needsAllocated - spent.needs
  const wantsRemaining = month.wantsAllocated - spent.wants
  const savingsRemaining = month.savingsAllocated - spent.savings

  const handleSubmit = async () => {
    if (!reflection.trim() || !month.id) return
    setIsSaving(true)
    try {
      await addCheckin({
        kakeiboMonthId: month.id,
        weekNumber: nextWeek,
        date: new Date(),
        reflection: reflection.trim(),
        needsRemaining,
        wantsRemaining,
        savingsRemaining,
      })
      setReflection("")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="font-display font-black text-lg">
            Week {nextWeek} Check-In
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reflect on your spending this week.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Needs</p>
            <p className={`text-sm font-medium tabular-nums ${needsRemaining < 0 ? "text-negative" : ""}`}>
              {formatCurrency(needsRemaining)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Wants</p>
            <p className={`text-sm font-medium tabular-nums ${wantsRemaining < 0 ? "text-negative" : ""}`}>
              {formatCurrency(wantsRemaining)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Savings</p>
            <p className={`text-sm font-medium tabular-nums ${savingsRemaining < 0 ? "text-negative" : ""}`}>
              {formatCurrency(savingsRemaining)}
            </p>
          </div>
        </div>

        <Textarea
          placeholder="How do you feel about your spending this week?"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={3}
        />

        <Button
          onClick={handleSubmit}
          disabled={!reflection.trim() || isSaving}
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save Check-In"}
        </Button>

        {monthCheckins.length > 0 && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-xs text-muted-foreground font-medium">Past Check-Ins</p>
            {monthCheckins.map((ci) => (
              <div key={ci.id} className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Week {ci.weekNumber}</span>
                  <span className="text-[11px] text-muted-foreground">{formatDate(ci.date)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{ci.reflection}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
