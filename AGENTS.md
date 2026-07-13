# Zaisei — Agent Instructions

## What this is

Personal finance PWA (React + Vite + TypeScript + shadcn/ui + Dexie.js). Client-side only — IndexedDB is the sole data store. Deployed to GitHub Pages.

**Full spec:** `plans/spec.md` — original requirements.
**Design plan:** `plans/plan.md` — visual overhaul plan, tokens, migration sequence.

## Quick start

```bash
npm install
npm run dev        # dev server
npm run build      # production build (tsc -b && vite build)
npm run preview    # preview prod build
```

No lint, test, or typecheck commands exist yet.

## Currency

All amounts are **centavos** (integer). The `formatCurrency()` helper divides by 100 and formats as ₱ (Philippine peso). Never store or compute with peso floats.

## Tech decisions (don't second-guess)

- **State:** React Context + `useLiveQuery` per domain (Accounts, Transactions, Debts, Kakeibo). No Zustand/Redux.
- **Data flow:** `User Action → Component → Context dispatch → Dexie write → useLiveQuery → UI re-render`
- **Dexie is source of truth.** All writes go through context hooks, which call Dexie CRUD methods.
- **Dark mode:** Tailwind `@custom-variant dark (&:is(.dark *))`, CSS variables in `index.css` with `.dark` override. ThemeProvider manages `.dark` class on `<html>`, persists to localStorage.
- **Forms:** react-hook-form + Zod v4 + `@hookform/resolvers/standard-schema` (NOT `zodResolver` — Zod v4 uses Standard Schema).
- **PWA:** Not yet implemented. Planned for Phase 8.

## Structure (actual, not planned)

```
src/
  lib/db.ts              — Dexie schema (5 tables)
  lib/utils.ts           — cn(), formatCurrency(), formatDate(), formatMonthYear()
  lib/constants.ts       — Categories, account types, Kakeibo ratios
  types/                 — Account, Transaction, Debt, KakeiboMonth, KakeiboCheckIn
  hooks/                 — Context providers + consumer hooks (one per domain)
  components/ui/         — 17 shadcn components (restyled, not replaced)
  components/layout/     — AppLayout, Sidebar, BottomNav, ThemeToggle
  components/dashboard/  — NetWorthCard, CashflowChart, RecentTransactions, KakeiboSummary, SnowballSummary
  components/accounts/   — AccountCard, AccountList, AccountForm
  components/transactions/ — TransactionTable, TransactionFilters, TransactionForm
  pages/                 — 7 routes (3 functional, 4 stubs)
```

## Design tokens (Sumi + Rikyu-nezumi system)

**5 core tokens + 1 accent.** See `plans/plan.md` §3 for full mapping.

| Token | Hex | Role |
|---|---|---|
| `sumi` | `#1C1917` | Primary text / dark mode bg |
| `kami` | `#FAFAF9` | Light mode bg |
| `nezumi` | `#78716C` | Secondary text, muted labels |
| `usuzumi` | `#D6D3D1` | Borders, dividers |
| `rikyu` | `#7B8174` | **Accent** — buttons, active nav, focus, progress bars, chart |

**Trend indicators:** No red/green. Income = regular weight. Expense = `nezumi` (lighter, recedes).

**Kakeibo envelopes:** Needs = `sumi`, Wants = `nezumi`, Savings = `rikyu`. Value hierarchy through weight and accent.

**Typography:** Zen Old Mincho (display/logo) + Inter (body) via Google Fonts. `tabular-nums` for all financial figures.

## Kakeibo defaults

Allocation: Savings 20% of income, then split remainder 60/40 between Needs and Wants. Ratios are configurable in Settings.

## Gotchas

- Transfers create two transaction entries and must update both account balances atomically.
- Debt snowball sorts by `remainingBalance` ascending (smallest first), then waterfalls extra payments.
- Kakeibo `monthlyReset` should auto-roll unspent savings into next month.
- PWA icons (192×192, 512×512) need to be generated — spec mentions `@vite-pwa/assets-generator`.
- Mobile breakpoint is 768px: bottom-nav below, sidebar above.
- **Zod v4 + react-hook-form:** Use `standardSchemaResolver` from `@hookform/resolvers/standard-schema`, NOT `zodResolver` from `@hookform/resolvers/zod`. The latter is incompatible with Zod v4 types.
- **`@tailwindcss/vite`:** No TypeScript declarations shipped. Manual `tailwindcss-vite.d.ts` at project root, included in `tsconfig.node.json`.
- **Loading states:** All hooks use `loading = items.length === 0` which can't distinguish empty DB from loading. Don't rely on this for UX decisions.
