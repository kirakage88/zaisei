# Zaisei (財清) — Personal Finance Dashboard

> **Target:** OpenCode autonomous execution
> **Stack:** React + Vite + TypeScript + shadcn/ui + Dexie.js + Chart.js
> **Design:** Mobile-first PWA with desktop adaptation — Japanese minimal aesthetic
> **Deploy:** GitHub Pages via GitHub Actions

---

## 1. Project Overview

Build a mobile-first PWA personal finance dashboard (name: **Zaisei** — 財清 "financial cleanse") with five core feature areas:

1. **Cashflow tracking** — income/expense/transfer transactions linked to accounts
2. **Multi-account management** — checking, savings, credit, e-wallet, cash accounts
3. **Debt Snowball + Loan Amortization** — smallest-balance-first payoff strategy with full amortization schedules
4. **Kakeibo System** — 3-category envelope budgeting (Needs, Wants, Savings) with weekly check-ins and monthly reset ceremony
5. **Charts & Reports** — spending breakdown, cashflow trends, net worth history

**Key constraint:** 100% client-side. IndexedDB (Dexie.js) as primary store. JSON export/import for backup. No backend.

---

## 2. Tech Stack

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | **React 18 + TypeScript** | — |
| Build tool | **Vite 6** | Fast dev server, PWA plugin support |
| UI library | **shadcn/ui** | Tailwind-based copy-paste components (buttons, cards, dialogs, sheets, tabs, charts) |
| Styling | **Tailwind CSS 3** | Utility-first, dark mode via class strategy |
| Storage | **Dexie.js 4** | IndexedDB wrapper with `useLiveQuery` hook for reactivity |
| Charts | **Chart.js 4 + react-chartjs-2** | Donut, line, bar, stacked area |
| Forms | **react-hook-form + zod** | Form validation + schema enforcement |
| Routing | **react-router-dom v6** | 7 routes |
| Icons | **Lucide React** | Clean line icons, shadcn-native |
| Date utils | **date-fns** | Tree-shakeable |
| PWA | **vite-plugin-pwa** | Workbox-based service worker, manifest, offline support |
| Deploy | **GitHub Actions → GitHub Pages** | Auto-build on push to `main` |

### State Management Approach

Use **React Context + useReducer** per domain (Accounts, Transactions, Debts, Kakeibo). Dexie's `useLiveQuery` handles reactivity — Context is a thin cache layer that hydrates from Dexie on mount. No Zustand/Redux needed.

**Data flow:**
```
User Action → Component → Context dispatch → Dexie write → Dexie re-query (useLiveQuery) → UI re-render
```

Dexie is the single source of truth. All writes go through the reducer pattern which calls Dexie CRUD methods.

---

## 3. Design System — Japanese Minimal

### Light Theme (Washi — 和紙)

```
Base:       #F5F0E8   Shironeri (生成り)   — warm unbleached silk
Surface:    #FFFFFF                        — white cards/surfaces
Primary:    #C73E3E   Akebono (曙)         — sunrise red (CTAs, active)
Secondary:  #2B5F8A   Ai (藍)             — indigo (links, secondary buttons)
Accent:     #7A9033   Matcha (抹茶)        — green (savings growth)
Text:       #2C2C2C   Sumi (墨)           — deep ink
Muted:      #8A8A8A   Nezu (鼠)           — grey text
Border:     #E5DDD3   Usuzumi (薄墨)       — subtle dividers
Success:    #5B8C5A   Matsuba (松葉)       — income/green
Warning:    #D4A04A   Kuchinashi (梔子)    — gardenia gold
Error:      #BE4B3B   Shui (朱色)          — vermilion (overspending)
```

### Dark Theme (Yami — 闇)

```
Base:       #1A1A1A   Charcoal
Surface:    #222222   Dark surface
Primary:    #D45656   Brighter akebono
Secondary:  #4A8FC7   Brighter ai
Accent:     #8FA84A   Brighter matcha
Text:       #E8E0D8   Warm white
Muted:      #6B6B6B
Border:     #333333
Success:    #6BA86B
Warning:    #D4A04A
Error:      #D45A4A
```

**Implementation:** Set up in `globals.css` as shadcn CSS variables with `.dark` class override. Tailwind's `darkMode: 'class'`.

### Typography & Layout Principles

- Sans-serif system font stack (Inter via next/font or system-ui)
- **Large headers:** 2rem–2.5rem for page titles
- **Body:** 0.875rem–1rem, comfortable line-height (1.6)
- **Cards:** Rounded corners (8px), subtle shadows, generous whitespace (p-6)
- **Spacing:** 4px grid (Tailwind spacing), lots of breathing room between sections
- **Transactions/accounts:** Cards in a responsive grid (mobile: 1 col, tablet: 2 col, desktop: 3 col)

---

## 4. Project Structure

```
zaisei/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                  # Tailwind directives
│   ├── globals.css                # shadcn theme variables (light + dark)
│   ├── lib/
│   │   ├── db.ts                  # Dexie database definition (all tables)
│   │   ├── utils.ts               # cn(), formatCurrency(), formatDate()
│   │   └── constants.ts           # Categories, Kakeibo ratios, defaults
│   ├── types/
│   │   ├── account.ts
│   │   ├── transaction.ts
│   │   ├── debt.ts
│   │   └── kakeibo.ts
│   ├── hooks/
│   │   ├── useAccounts.ts         # Context hook + Dexie CRUD
│   │   ├── useTransactions.ts
│   │   ├── useDebts.ts
│   │   ├── useKakeibo.ts
│   │   └── useSnowball.ts         # Snowball calculation logic
│   ├── stores/
│   │   ├── AccountContext.tsx
│   │   ├── TransactionContext.tsx
│   │   ├── DebtContext.tsx
│   │   └── KakeiboContext.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn components (button, card, sheet, dialog, tabs, etc.)
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Responsive shell: sidebar (desktop) / bottom-nav (mobile)
│   │   │   ├── Sidebar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── accounts/
│   │   │   ├── AccountList.tsx
│   │   │   ├── AccountCard.tsx
│   │   │   └── AccountForm.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionTable.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   └── TransactionFilters.tsx
│   │   ├── debts/
│   │   │   ├── DebtList.tsx
│   │   │   ├── DebtCard.tsx
│   │   │   ├── DebtForm.tsx
│   │   │   ├── SnowballCalculator.tsx
│   │   │   └── AmortizationTable.tsx
│   │   ├── kakeibo/
│   │   │   ├── KakeiboEnvelopes.tsx
│   │   │   ├── WeeklyCheckIn.tsx
│   │   │   └── MonthlyReset.tsx
│   │   └── dashboard/
│   │       ├── NetWorthCard.tsx
│   │       ├── CashflowChart.tsx
│   │       ├── RecentTransactions.tsx
│   │       ├── KakeiboSummary.tsx
│   │       └── SnowballSummary.tsx
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Accounts.tsx
│       ├── Transactions.tsx
│       ├── Debts.tsx
│       ├── Kakeibo.tsx
│       ├── Reports.tsx
│       └── Settings.tsx
├── .github/workflows/deploy.yml
└── package.json
```

---

## 5. IndexedDB Schema

### accounts

```typescript
interface Account {
  id?: number;
  name: string;           // "BDO Savings", "GCash", etc.
  type: 'checking' | 'savings' | 'credit' | 'cash' | 'ewallet';
  balance: number;        // current balance in centavos (PHP)
  color: string;          // hex color
  icon: string;           // Lucide icon name
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### transactions

```typescript
interface Transaction {
  id?: number;
  accountId: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;               // positive integer in centavos
  category: string;             // e.g., "Food", "Transport", "Salary"
  subcategory?: string;
  description: string;
  date: Date;
  kakeiboTag?: 'needs' | 'wants' | 'savings';  // manual selection per entry
  tags: string[];
  createdAt: Date;
}

// If type === 'transfer': also set fromAccountId and toAccountId
```

### debts

```typescript
interface Debt {
  id?: number;
  name: string;                  // "GLoan", "SPayLater", etc.
  type: 'personal_loan' | 'credit_card' | 'car_loan' | 'student_loan' | 'other';
  creditLimit: number;           // 0 for non-revolving loans
  remainingBalance: number;      // current debt balance (centavos)
  minimumPayment: number;        // monthly minimum (centavos)
  interestRate: number;          // APR as percentage (e.g., 24.5 for 24.5%)
  dueDay: number;                // day of month (1-31)
  isActive: boolean;
  startDate: Date;               // when this debt was added
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### kakeibo_months

```typescript
interface KakeiboMonth {
  id?: number;
  year: number;
  month: number;              // 1-12
  income: number;             // expected income for month (centavos)
  needsAllocated: number;     // budget for Needs
  wantsAllocated: number;     // budget for Wants
  savingsAllocated: number;   // budget for Savings
  needsSpent: number;         // actual so far
  wantsSpent: number;
  savingsSpent: number;
  isClosed: boolean;
  closedAt?: Date;
  createdAt: Date;
}
```

### kakeibo_checkins

```typescript
interface KakeiboCheckIn {
  id?: number;
  kakeiboMonthId: number;
  weekNumber: number;          // 1-5 (week of month)
  date: Date;
  reflection: string;          // user's thoughts on weekly spending
  needsRemaining: number;
  wantsRemaining: number;
  savingsRemaining: number;
}
```

---

## 6. Routes & Navigation

| Route | Page | Layout Priority |
|-------|------|----------------|
| `/` | Dashboard — net worth, cashflow snapshot, budget progress, debt payoff summary | Home tab |
| `/accounts` | Accounts — all accounts with balances, add/edit/archive | Accts tab |
| `/transactions` | Transactions — full log, filter, search, add new | Txns tab |
| `/debts` | Debts — debt cards, snowball calculator, amortization tables | Debts tab |
| `/kakeibo` | Kakeibo — envelope progress, weekly check-in, month-end reset | Budget tab |
| `/reports` | Reports — charts: spending breakdown, trends, net worth history | More (sheet) |
| `/settings` | Settings — JSON export/import, theme toggle, data management | More (sheet) |

### Layout Strategy

**Desktop (>768px):** Fixed sidebar (240px wide) on the left with navigation links + app name at top. Main content area on the right with page header and content.

**Mobile (<768px):** Bottom navigation bar with 5 primary tabs (Home, Accounts, Txns, Debts, Budget). A "More" icon opens a bottom sheet with Reports and Settings links. Page content is single-column.

**Breakpoint:** 768px switch between bottom-nav and sidebar. Detect via `useMediaQuery` hook (or Tailwind's responsive utilities).

---

## 7. Core Features — Implementation Details

### 7.1 Multi-Account Management

- CRUD for accounts (modal/sheet form with name, type, balance, color, icon picker)
- Account cards with balance (formatted), type badge, colored dot
- Account detail view shows related transactions
- Archiving — hide from main list but keep data
- Color/icon picker: predefined set of Lucide icons + 8 color swatches

### 7.2 Cashflow Tracking

- Transaction form with: type toggle (income/expense/transfer), amount, category dropdown, description, date picker, optional Kakeibo tag
- Category system: preset list (Food, Transport, Bills, Rent, Shopping, Health, Entertainment, Salary, Freelance, Education, Savings Transfer, Misc)
- Transfer type: from account → to account (creates two entries, balances update correctly)
- Transaction table: sortable by date/amount, filterable by account/category/date range, searchable by description
- Balance auto-update: when creating/editing/deleting a transaction, the linked account's balance adjusts accordingly

### 7.3 Debt Snowball Calculator

**Data sourced from this Google Sheet (Kira's debt tracker):**
```
/1WdE4wEn_zYqC1--M16vJ4Y7UOq6tO7-GcO-Drz3mcNQ
Tab: Accounts
Columns: Account, Type, Credit Limit, Current Balance, Min Payment (Monthly), Due Date, Next Payment, Status, Utilization %
```
**Current debts (as of spec creation):**
| Debt | Type | Balance | Min Payment | Due | Utilization |
|------|------|---------|-------------|-----|-------------|
| GLoan | Personal Loan | ₱2,818.85 | ₱755.06 | 30th | 56.4% |
| SPayLater | Credit Card | ₱11,868.82 | ₱1,895.79 | 5th | 56.7% |
| Atome Cash | Credit Card | ₱15,620.00 | ₱2,603.33 | 2nd | 42.2% |
| Atome Card | Credit Card | ₱20,341.21 | ₱7,338.81 | 5th | 97.8% |

**Snowball algorithm:**
```
1. Sort debts by remainingBalance ascending
2. For each month:
   a. Pay minimumPayment on every debt
   b. Sum all minimumPayments
   c. User provides "extraPayment" per month
   d. Apply extraPayment to the smallest remaining debt
   e. When that debt reaches 0, waterfall the full payment (min + extra) to the next smallest
3. Generate array of months showing:
   - Which debts are paid each month
   - Running total owed
   - Total interest saved vs minimum-only payments
4. Output: payoff timeline chart (stacked bar or area — debt balances over time)
```

**Amortization table:** For each debt, show standard amortization schedule: payment #, principal portion, interest portion, remaining balance. Compute from principal, rate, and number of minimum payments to zero.

### 7.4 Kakeibo System (3-Category)

**The three envelopes:**
- **Needs** — essential expenses (rent, bills, food, transport, healthcare)
- **Wants** — discretionary (entertainment, dining out, hobbies, shopping)
- **Savings** — money put aside (transfers to savings account, investments)

**Monthly allocation formula (default):**
```
Allocatable = monthlyIncome
Savings = Allocatable * SavingsRatio  (default: 20%)
Spendable = Allocatable - Savings
Needs = Spendable * 0.6    (60%)
Wants = Spendable * 0.4    (40%)
```
Ratios are configurable in Settings.

**Monthly workflow:**
1. **Start of month:** User sets expected income → system auto-allocates 3 envelopes (editable)
2. **Throughout month:** Every transaction can optionally be tagged `needs`, `wants`, or `savings`. Envelope remaining budgets update in real-time.
3. **Weekly check-in (prompt, not forced):** Modal/sheet shows remaining per envelope, asks "How do you feel about your spending this week?" User writes a short reflection.
4. **Month-end reset ceremony:** Shows totals for the month, savings achieved, reflection summary. User marks the month closed. Unspent savings auto-roll over (or re-allocate to next month).

**Visual:** Three circular progress rings (or horizontal bars) showing allocated vs spent per envelope. Color-coded: Needs (ai blue #2B5F8A), Wants (akebono red #C73E3E), Savings (matcha green #7A9033).

### 7.5 Charts & Reports

| Chart | Type | Location |
|-------|------|----------|
| Spending by category | Donut/pie | Reports page |
| Spending by Kakeibo envelope | Donut/pie | Kakeibo page + Reports |
| Income vs Expenses (monthly) | Grouped bar | Dashboard + Reports |
| Net worth trend | Line (accumulated) | Dashboard + Reports |
| Cashflow (30-day) | Line with fill | Dashboard |
| Debt payoff timeline | Stacked area | Debts page |
| Envelope burn-down | Area chart | Kakeibo page |

---

## 8. PWA Configuration

Use `vite-plugin-pwa` with Workbox:

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Zaisei - Personal Finance',
        short_name: 'Zaisei',
        description: 'Personal finance dashboard with Kakeibo budgeting and debt snowball',
        theme_color: '#F5F0E8',
        background_color: '#F5F0E8',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        runtimeCaching: [
          // No API endpoints to cache — everything is IndexedDB
        ],
      },
    }),
  ],
});
```

Generate PWA icons from the favicon. Use `@vite-pwa/assets-generator` or manual PNGs (192×192, 512×512).

---

## 9. Implementation Order (8 Phases)

### Phase 1: Scaffold + Data Layer
- `npm create vite@latest zaisei -- --template react-ts`
- Install all dependencies
- shadcn init (button, card, dialog, sheet, tabs, input, select, label, separator, progress, avatar)
- Set up `globals.css` with both themes (light + dark CSS variables)
- Write `src/lib/db.ts` — Dexie schema for all 4 tables
- Write all TypeScript interfaces in `src/types/`
- Write all contexts + hooks (CRUD operations)
- **Verify:** `npm run dev` starts, DevTools shows 4 IndexedDB object stores (empty)

### Phase 2: Layout + Navigation
- `react-router-dom` setup with 7 routes
- `AppLayout.tsx` — responsive shell (sidebar on desktop, bottom-nav on mobile)
- `Sidebar.tsx` + `BottomNav.tsx` — nav items, active state, icons
- `ThemeToggle.tsx` — toggle between light/dark, persist to localStorage
- Each page renders a stub with title
- **Verify:** Navigate all routes, resize browser to see sidebar↔bottom-nav switch, toggle dark mode

### Phase 3: Accounts + Transactions
- `AccountList` with `AccountCard` per account (name, type badge, colored dot, formatted balance)
- `AccountForm` — modal/sheet with fields: name, type (select), balance, color swatches, icon picker
- `TransactionTable` — sortable, filterable, searchable
- `TransactionForm` — type toggle, amount, category, description, date, account, optional kakeiboTag
- Balance auto-update on transaction CRUD
- Transfer handling (fromAccount → toAccount)
- **Verify:** Create 3 accounts, add 10+ transactions, balances update correctly, filter/sort works

### Phase 4: Dashboard
- `NetWorthCard` — total accounts - total debts
- `CashflowChart` — last 30 days line chart (income green, expenses red)
- `RecentTransactions` — last 5 entries
- `KakeiboSummary` — current month's envelope progress
- `SnowballSummary` — total debt, progress %, next target name
- Responsive grid: 1 col on mobile, 2 col on desktop
- **Verify:** Dashboard shows live data after creating accounts + transactions + debts

### Phase 5: Debt Snowball + Amortization
- `DebtList` — cards per debt with name, balance, rate, min payment, due day, utilization badge
- `DebtForm` — add/edit debt
- `SnowballCalculator` — input extra monthly payment, compute payoff timeline
- Output: table of months + stacked area chart (debt balances over time)
- `AmortizationTable` — per-debt schedule (standard amortization)
- Seed with Kira's 4 existing debts from the Google Sheet
- **Verify:** Snowball calculator correctly waterfalls extra payment to smallest debt, amortization table math adds up

### Phase 6: Kakeibo System
- `KakeiboEnvelopes` — three progress rings/bars with allocated vs spent
- Monthly allocation form (income → auto-calc → editable envelopes)
- Transaction Kakeibo tag (manual selection on each transaction)
- `WeeklyCheckIn` — modal with remaining per envelope + reflection textarea
- `MonthlyReset` — month-end ceremony with totals + summary
- **Verify:** Create a month, add tagged transactions, envelopes track correctly, weekly check-in saves, month closes

### Phase 7: Reports
- Spending breakdown (donut by category)
- Spending breakdown (donut by Kakeibo envelope)
- Income vs Expenses monthly (bar chart)
- Net worth trend over time (line chart)
- Date range picker for all charts
- Category drill-down (click donut slice → filtered transactions view)
- **Verify:** Charts render with real data, date range filters work, drill-down navigates correctly

### Phase 8: PWA + Polish + Settings
- `vite-plugin-pwa` config with manifest + workbox
- Offline fallback page
- Install prompt (capture `beforeinstallprompt` event)
- JSON export (download all Dexie tables as `.json` file)
- JSON import (file upload → parse → Dexie bulkPut with merge/overwrite option)
- Loading skeletons for data-fetching pages
- Empty states (illustration + "Add your first account" CTA)
- Keyboard shortcuts on desktop (`n` → new transaction, `d` → dashboard)
- A11y: proper aria labels, focus trapping in modals, tab order
- **Verify:** Lighthouse PWA audit ≥ 90, offline mode works, export/import round-trips data

---

## 10. GitHub Actions — Auto-Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: zaisei.yourdomain.com   # optional
```

Also configure GitHub Pages in repo Settings → Pages → Source: "Deploy from branch: gh-pages /root".

---

## 11. Verification Checklist

After each phase:
- [ ] `npm run build` — zero TypeScript errors, zero warnings
- [ ] `npm run preview` — local server works, all interactions functional
- [ ] Data persists across page refreshes (IndexedDB check)
- [ ] Mobile viewport (375px) — no overflow, bottom nav works, touch targets ≥ 44px
- [ ] Desktop viewport (1440px) — sidebar visible, content fills remaining space
- [ ] Dark mode toggle works, persists on reload
- [ ] Lighthouse (PWA) ≥ 90, Performance ≥ 85

---

## 12. First Run Commands

```bash
# Create the project
npm create vite@latest zaisei -- --template react-ts
cd zaisei

# Install core dependencies
npm install dexie react-router-dom chart.js react-chartjs-2 date-fns lucide-react react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-dialog @radix-ui/react-sheet @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-progress @radix-ui/react-avatar class-variance-authority clsx tailwind-merge tailwindcss-animate

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa @types/node

# Initialize Tailwind
npx tailwindcss init -p

# Initialize shadcn
npx shadcn@latest init
# When prompted: Would you like to use CSS variables for colors? → Yes
# style: default, baseColor: slate (we'll override with our palette)

# Add shadcn components as needed
npx shadcn@latest add button card dialog sheet tabs input select label separator progress avatar
```

---

## 13. Category Constants

```typescript
export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Groceries', icon: 'UtensilsCrossed' },
  { value: 'transport', label: 'Transport', icon: 'Car' },
  { value: 'bills', label: 'Bills & Utilities', icon: 'Receipt' },
  { value: 'rent', label: 'Rent & Housing', icon: 'Home' },
  { value: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { value: 'health', label: 'Health & Wellness', icon: 'Heart' },
  { value: 'entertainment', label: 'Entertainment', icon: 'Film' },
  { value: 'education', label: 'Education', icon: 'BookOpen' },
  { value: 'dining', label: 'Dining Out', icon: 'Coffee' },
  { value: 'subscription', label: 'Subscriptions', icon: 'Repeat' },
  { value: 'misc', label: 'Miscellaneous', icon: 'MoreHorizontal' },
] as const;

export const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salary', icon: 'Briefcase' },
  { value: 'freelance', label: 'Freelance', icon: 'Laptop' },
  { value: 'gift', label: 'Gift', icon: 'Gift' },
  { value: 'interest', label: 'Interest', icon: 'TrendingUp' },
  { value: 'other_income', label: 'Other Income', icon: 'PlusCircle' },
] as const;

export const ACCOUNT_ICONS = [
  'Wallet', 'CreditCard', 'Banknote', 'Building2', 'PiggyBank',
  'Landmark', 'CircleDollarSign', 'Coins',
] as const;

export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'ewallet', label: 'E-Wallet' },
] as const;

export const DEBT_TYPES = [
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'other', label: 'Other' },
] as const;

export const KAKEIBO_RATIOS = {
  savingsRatio: 0.20,
  needsRatio: 0.48,   // 60% of (1-0.20) = 48% of total
  wantsRatio: 0.32,   // 40% of (1-0.20) = 32% of total
} as const;
```

---

## 14. Helper Utils

```typescript
// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  // amount is in centavos (integer)
  const pesos = Math.abs(amount) / 100;
  return `₱${pesos.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatMonthYear(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long' });
}
```
