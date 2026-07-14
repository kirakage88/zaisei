# Zaisei — Agent Instructions

## What this is

Personal finance PWA (React + Vite + TypeScript + shadcn/ui + Dexie.js). Client-side only — IndexedDB is the sole data store. Deployed to GitHub Pages via `HashRouter`.

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
- **Dual-palette system:** Two palettes (Sumi, Sakura) × two modes (light, dark) = four combinations. ThemeProvider manages both `palette` (sumi/sakura) and `mode` (light/dark/system) independently. Sakura applies `.sakura` class on `<html>`. CSS variable overrides in `.sakura` and `.sakura.dark` blocks.
- **Signature motifs:** Sumi uses `.accent-underline` (line). Sakura uses `SakuraPetal` (5-petal SVG). `PageTitle` component conditionally renders the right motif.
- **Forms:** react-hook-form + Zod v4 + `@hookform/resolvers/standard-schema` (NOT `zodResolver` — Zod v4 uses Standard Schema).
- **Router:** `HashRouter` (not `BrowserRouter`) — required for GitHub Pages.
- **PWA:** Not yet implemented. Planned for Phase 8.

## Structure

```
src/
  lib/db.ts              — Dexie schema (6 tables, version 3)
  lib/utils.ts           — cn(), formatCurrency(), formatDate(), formatMonthYear()
  lib/constants.ts       — Categories, account types, Kakeibo ratios
  lib/snowball.ts        — Debt snowball algorithm
  types/                 — Account, Transaction, Debt, KakeiboMonth, KakeiboCheckIn, TransactionTemplate
  hooks/                 — Context providers + consumer hooks (one per domain)
  components/ui/         — 19 shadcn components (restyled, not replaced)
  components/layout/     — AppLayout, Sidebar, BottomNav, ThemeToggle, PageTitle, SakuraPetal, Logo
  components/theme-provider.tsx — Palette + mode management
  components/dashboard/  — NetWorthCard, CashflowChart, RecentTransactions, KakeiboSummary, SnowballSummary
  components/accounts/   — AccountCard, AccountList, AccountForm, SortableAccountCard
  components/transactions/ — TransactionTable, TransactionFilters, TransactionForm
  components/debts/      — DebtList, DebtForm, SnowballCalculator, PayoffChart, AmortizationTable
  components/kakeibo/    — KakeiboMonthSetup, KakeiboEnvelopes, WeeklyCheckIn, KakeiboHistory, KakeiboAccountSettings
  components/cashflow/   — Cashflow-related components
  components/reports/    — SpendingCategoryDonut, IncomeExpenseBar, NetWorthTrend, etc.
  pages/                 — 7 routes (all functional): Dashboard, Accounts, Transactions, Debts, Kakeibo, Reports, Settings
```

## Design tokens (Sumi + Rikyu-nezumi system)

**5 core tokens + 1 accent.** See `plans/plan.md` §3 for full mapping. Values below are from `src/index.css` — the source of truth.

| Token | Light | Dark | Role |
|---|---|---|---|
| `sumi` | `#1C1917` | `#FAFAF9` | Primary text / dark mode bg |
| `kami` | `#F7F5F1` | `#1C1917` | Background |
| `nezumi` | `#78716C` | `#A8A29E` | Secondary text, muted labels |
| `usuzumi` | `#D6D3D1` | `#292524` | Borders, dividers |
| `rikyu` | `#8C9686` | `#8C9686` | **Accent** — buttons, active nav, focus, progress bars, chart |
| `accent-active` | `#6B8F5E` | `#7FA372` | Primary action color |
| `positive` | `#6B8F5E` | `#7FA372` | Positive trend/amounts |
| `negative` | `#B96A4A` | `#B96A4A` | Negative trend/amounts |

**Trend indicators:** No red/green. Income = regular weight. Expense = `nezumi` (lighter, recedes).

**Kakeibo envelopes:** Needs = `sumi`, Wants = `nezumi`, Savings = `rikyu`. Value hierarchy through weight and accent.

**Typography:** Zen Old Mincho (display/logo) + Inter (body) via Google Fonts. `tabular-nums` for all financial figures.

## Sakura palette tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `sumi` | `#2B1E22` | `#FAF0F2` | Primary text |
| `kami` | `#FFF6F7` | `#3A2A30` | Background |
| `nezumi` | `#A8919A` | `#C4AAB2` | Secondary text |
| `usuzumi` | `#F0D6DA` | `#4D3842` | Borders |
| `accent-active` | `#E8899C` | `#F2A3B3` | Buttons, active nav, focus, petal motif |
| `accent-resting` | `#F4C6CE` | `#F4C6CE` | Borders, secondary elements |
| `positive` | `#A8C3A0` | `#A8C3A0` | Positive trend/amounts |
| `negative` | `#E4767B` | `#E4767B` | Negative trend/amounts |

**Sakura-specific styles:** `--radius-xl: 1.25rem` (20px vs Sumi's 12px), card shadow `0 2px 10px rgba(232,137,156,0.12)` instead of flat border, `petal-bloom` animation for motif entrance.

## Kakeibo defaults

Allocation: Savings 20% of income, then split remainder 60/40 between Needs and Wants. Ratios are configurable in Settings.

## Gotchas

- **`HashRouter` is intentional.** GitHub Pages doesn't support client-side routing with `BrowserRouter`. Keep `HashRouter`.
- **`base: "/zaisei/"`** in `vite.config.ts` — the app is served under a subpath on GitHub Pages.
- **`@` path alias** resolved in both `vite.config.ts` and `tsconfig.json` (`@/*` → `./src/*`).
- Transfers create two transaction entries and must update both account balances atomically.
- Debt snowball sorts by `remainingBalance` ascending (smallest first), then waterfalls extra payments.
- Kakeibo `monthlyReset` should auto-roll unspent savings into next month.
- PWA icons (192×192, 512×512) need to be generated — spec mentions `@vite-pwa/assets-generator`.
- Mobile breakpoint is 768px: bottom-nav below, sidebar above.
- **Zod v4 + react-hook-form:** Use `standardSchemaResolver` from `@hookform/resolvers/standard-schema`, NOT `zodResolver` from `@hookform/resolvers/zod`. The latter is incompatible with Zod v4 types.
- **`@tailwindcss/vite`:** No TypeScript declarations shipped. Manual `tailwindcss-vite.d.ts` at project root, included in `tsconfig.node.json`.
- **Loading states:** All hooks use `loading = items.length === 0` which can't distinguish empty DB from loading. Don't rely on this for UX decisions.
- **TypeScript strictness:** `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax: true`, `erasableSyntaxOnly: true` are all enabled.
- **CI:** Single workflow (`deploy.yml`) runs `npm ci && npm run build` on push to `main`, deploys to GitHub Pages.
- **`@` in package.json `allowScripts`:** `radix-ui` and `react-day-picker` are allowlisted for install scripts. `ignore-scripts=false` in `.npmrc`.
- **Dexie schema version 3.** Tables: accounts (with `order`, `kakeiboIncluded`, `netWorthIncluded`), transactions, debts, kakeiboMonths, kakeiboCheckins, transactionTemplates. Migration v2 sets defaults on existing accounts. Account `order` field is used for DnD reordering.
- **Drag-and-drop:** Uses `@dnd-kit/core` + `@dnd-kit/sortable` for account reordering only. `SortableAccountCard` wraps `AccountCard` with sortable behavior and grip handle.
- **Transaction templates:** Stored in `transactionTemplates` Dexie table. `TemplatesProvider` sits inside `TransactionsProvider` in App.tsx (needs `addTransaction` for recurrence). Recurrence evaluates on app mount only.
- **Account inclusion flags:** `kakeiboIncluded` (default true) filters Kakeibo spending/income calculations. `netWorthIncluded` (default true) filters net worth sum. Both toggled via popover UIs.
