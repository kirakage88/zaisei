import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { useKakeibo, autoCalcAllocations } from "@/hooks/useKakeibo"
import { KakeiboMonthSetup } from "@/components/kakeibo/KakeiboMonthSetup"
import { KakeiboEnvelopes } from "@/components/kakeibo/KakeiboEnvelopes"
import { WeeklyCheckIn } from "@/components/kakeibo/WeeklyCheckIn"
import { KakeiboHistory } from "@/components/kakeibo/KakeiboHistory"
import { PageTitle } from "@/components/layout/PageTitle"

function useAutoSpent(month: { year: number; month: number }) {
  const startOfMonth = new Date(month.year, month.month - 1, 1)
  const endOfMonth = new Date(month.year, month.month, 0, 23, 59, 59, 999)

  return useLiveQuery(async () => {
    const txs = await db.transactions
      .where("date")
      .between(startOfMonth, endOfMonth, true, true)
      .toArray()

    let needs = 0
    let wants = 0
    let savings = 0

    for (const tx of txs) {
      if (tx.type !== "expense") continue
      if (tx.kakeiboTag === "needs") needs += tx.amount
      else if (tx.kakeiboTag === "wants") wants += tx.amount
      else if (tx.kakeiboTag === "savings") savings += tx.amount
    }

    return { needs, wants, savings }
  }, [month.year, month.month]) ?? { needs: 0, wants: 0, savings: 0 }
}

export default function KakeiboPage() {
  const { months, checkins, closeMonth, createMonth, updateMonth } = useKakeibo()
  const [isClosing, setIsClosing] = useState(false)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthNum = now.getMonth() + 1

  const activeMonth = months.find(
    (m) => m.year === currentYear && m.month === currentMonthNum && !m.isClosed
  )

  const spent = useAutoSpent(
    activeMonth
      ? { year: activeMonth.year, month: activeMonth.month }
      : { year: currentYear, month: currentMonthNum }
  )

  const handleCloseMonth = async () => {
    if (!activeMonth || !activeMonth.id) return
    setIsClosing(true)
    try {
      const unspentSavings = activeMonth.savingsAllocated - spent.savings

      await closeMonth(activeMonth.id)

      if (unspentSavings > 0) {
        const nextMonth = currentMonthNum === 12 ? 1 : currentMonthNum + 1
        const nextYear = currentMonthNum === 12 ? currentYear + 1 : currentYear

        const existingNext = months.find(
          (m) => m.year === nextYear && m.month === nextMonth && !m.isClosed
        )

        if (existingNext?.id) {
          await updateMonth(existingNext.id, {
            savingsAllocated: existingNext.savingsAllocated + unspentSavings,
          })
        } else {
          const nextAllocations = autoCalcAllocations(0)
          await createMonth({
            year: nextYear,
            month: nextMonth,
            income: 0,
            needsAllocated: nextAllocations.needsAllocated,
            wantsAllocated: nextAllocations.wantsAllocated,
            savingsAllocated: unspentSavings,
          })
        }
      }
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <div>
      <PageTitle>Kakeibo</PageTitle>

      <div className="mt-6 space-y-6">
        {!activeMonth ? (
          <KakeiboMonthSetup year={currentYear} month={currentMonthNum} />
        ) : (
          <>
            <KakeiboEnvelopes
              month={activeMonth}
              onCloseMonth={handleCloseMonth}
              isClosing={isClosing}
            />
            <WeeklyCheckIn
              month={activeMonth}
              spent={spent}
              checkins={checkins}
            />
          </>
        )}

        <KakeiboHistory months={months} />
      </div>
    </div>
  )
}
