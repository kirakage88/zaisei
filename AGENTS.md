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
- **Dual-palette system:** Two palettes (Sumi, Sakura) × two modes (light, dark) = four combinations. ThemeProvider manages both `palette` (sumi/sakura) and `mode` (light/dark/system) independently. Sakura applies `.sakura` class on `<html>`. CSS variable overrides in `.sakura` and `.sakura.dark` blocks. Sakura-specific shapes: larger border-radius, pink-tinted card shadows.
- **Signature motifs:** Sumi uses `.accent-underline` (line). Sakura uses `SakuraPetal` (5-petal SVG). `PageTitle` component conditionally renders the right motif.
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
  components/layout/     — AppLayout, Sidebar, BottomNav, ThemeToggle, PageTitle, SakuraPetal, Logo
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

## Sakura palette tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `sumi` | `#2B1E22` | `#FAF0F2` | Primary text |
| `kami` | `#FFF6F7` | `#2B1E22` | Background |
| `nezumi` | `#A8919A` | `#C4AAB2` | Secondary text |
| `usuzumi` | `#F0D6DA` | `#3D2E34` | Borders |
| `accent-active` | `#E8899C` | `#F2A3B3` | Buttons, active nav, focus, petal motif |
| `accent-resting` | `#F4C6CE` | `#F4C6CE` | Borders, secondary elements |
| `positive` | `#A8C3A0` | `#A8C3A0` | Positive trend/amounts |
| `negative` | `#E4767B` | `#E4767B` | Negative trend/amounts |

**Sakura-specific styles:** `--radius-xl: 1.25rem` (20px vs Sumi's 12px), card shadow `0 2px 10px rgba(232,137,156,0.12)` instead of flat border, `petal-bloom` animation for motif entrance.

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
