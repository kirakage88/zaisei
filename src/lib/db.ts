import Dexie, { type Table } from "dexie"
import type { Account } from "@/types/account"
import type { Transaction } from "@/types/transaction"
import type { Debt } from "@/types/debt"
import type { KakeiboMonth, KakeiboCheckIn } from "@/types/kakeibo"
import type { TransactionTemplate } from "@/types/template"

export class ZaiseiDB extends Dexie {
  accounts!: Table<Account>
  transactions!: Table<Transaction>
  debts!: Table<Debt>
  kakeiboMonths!: Table<KakeiboMonth>
  kakeiboCheckins!: Table<KakeiboCheckIn>
  transactionTemplates!: Table<TransactionTemplate>

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
    this.version(2).stores({
      accounts: "++id, type, isArchived, createdAt, order",
      transactions:
        "++id, accountId, type, date, category, kakeiboTag, [accountId+date]",
      debts: "++id, isActive, remainingBalance, createdAt",
      kakeiboMonths: "++id, [year+month], isClosed",
      kakeiboCheckins: "++id, kakeiboMonthId, weekNumber",
    }).upgrade(async (tx) => {
      const accounts = await tx.table("accounts").toArray()
      for (let i = 0; i < accounts.length; i++) {
        await tx.table("accounts").update(accounts[i].id, {
          order: i,
          kakeiboIncluded: true,
          netWorthIncluded: true,
        })
      }
    })
    this.version(3).stores({
      accounts: "++id, type, isArchived, createdAt, order",
      transactions:
        "++id, accountId, type, date, category, kakeiboTag, [accountId+date]",
      debts: "++id, isActive, remainingBalance, createdAt",
      kakeiboMonths: "++id, [year+month], isClosed",
      kakeiboCheckins: "++id, kakeiboMonthId, weekNumber",
      transactionTemplates: "++id, name",
    })
  }
}

export const db = new ZaiseiDB()
