import Dexie, { type Table } from "dexie"
import type { Account } from "@/types/account"
import type { Transaction } from "@/types/transaction"
import type { Debt } from "@/types/debt"
import type { KakeiboMonth, KakeiboCheckIn } from "@/types/kakeibo"

export class ZaiseiDB extends Dexie {
  accounts!: Table<Account>
  transactions!: Table<Transaction>
  debts!: Table<Debt>
  kakeiboMonths!: Table<KakeiboMonth>
  kakeiboCheckins!: Table<KakeiboCheckIn>

  constructor() {
    super("zaisei")
    this.version(1).stores({
      accounts: "++id, type, isArchived, createdAt",
      transactions:
        "++id, accountId, type, date, category, kakeiboTag, [accountId+date]",
      debts: "++id, isActive, remainingBalance, createdAt",
      kakeiboMonths: "++id, [year+month], isClosed",
      kakeiboCheckins: "++id, kakeiboMonthId, weekNumber",
    })
  }
}

export const db = new ZaiseiDB()
