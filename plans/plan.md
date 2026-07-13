# Zaisei — Visual Redesign Plan

> **Scope:** Visual/UX overhaul only. All data hooks, Dexie schema, form validation, routing, and CRUD logic are untouched.
> **Approach:** Token-driven. Replace CSS variables, restyle shadcn components via class changes, rebuild layout spacing.
> **Skill:** frontend-design (`.agents/skills/frontend-design/SKILL.md`)

---

## 1. What exists (audit summary)

### Functional pages (3)
- `/` — Dashboard: 5 cards (NetWorth, CashflowChart, RecentTransactions, KakeiboSummary, SnowballSummary) in 2-col grid
- `/accounts` — AccountList (card grid + tab switcher) + AccountForm (sheet)
- `/transactions` — TransactionTable + TransactionFilters + TransactionForm (sheet)

### Stub pages (4)
- `/debts`, `/kakeibo`, `/reports`, `/settings` — heading only

### Layout
- `AppLayout` — sidebar (240px) + main outlet + bottom nav (mobile)
- `Sidebar` — logo "財清", 7 nav links, ThemeToggle at bottom
- `BottomNav` — 5 primary icons + "More" sheet
- `ThemeToggle` — light/dark/system cycle

### Data layer (untouched by redesign)
- 4 context hooks: `useAccounts`, `useTransactions`, `useDebts`, `useKakeibo`
- Dexie schema: 5 tables (accounts, transactions, debts, kakeiboMonths, kakeiboCheckins)
- All amounts in centavos (integer), formatted via `formatCurrency()`

### UI primitives (17 shadcn components)
avatar, badge, button, calendar, card, dialog, dropdown-menu, form, input, label, popover, progress, select, separator, sheet, table, tabs

### Current theme (to be replaced)
12+ competing accent colors: akebono red, ai indigo, matcha green, matsuba green, shui red, kuchinashi yellow, nezu gray, usuzumi border. Warm cream background (#F5F0E8). Body has a vertical gradient.

---

## 2. Design direction

### Philosophy
- **Ma (間):** Generous negative space. Let content breathe. The space around an element IS the design.
- **Wabi-sabi restraint:** No gratuitous shadows, gradients, or decoration. Every element earns its place.
- **Quiet confidence:** Clear hierarchy, generous line-height, no visual shouting.

### What changes
- Theme tokens: 12+ colors → 5 tokens + 1 accent (sumi + rikyu-nezumi)
- Typography: system stack → Zen Old Mincho (display/logo) + Inter (body) via Google Fonts
- Layout: tighter grid → generous spacing, full-width hero number
- Cards: flat with border → same, but with consistent token-driven styling
- Active nav: red accent → rikyu-nezumi accent
- Background: gradient → flat warm near-white
- Dashboard hero: card with icon → inverted number hierarchy (number first, label below, thin rikyu line)

### What stays
- All shadcn component primitives (restyle, don't replace)
- All data hooks, contexts, Dexie schema
- All form logic, validation, CRUD
- Routing structure (7 routes)
- Currency formatting (centavos → ₱)
- Sidebar + bottom nav structure (refined, not rebuilt)

---

## 3. Color system — Sumi + Rikyu-nezumi

### Tokens

| Token | Hex | Light role | Dark role |
|---|---|---|---|
| `sumi` | `#1C1917` | Primary text | Background |
| `kami` | `#FAFAF9` | Background | Primary text |
| `nezumi` | `#78716C` | Secondary text, muted labels | Secondary text |
| `usuzumi` | `#D6D3D1` | Borders, dividers | Borders (shift to `#292524`) |
| `rikyu` | `#7B8174` | Accent — buttons, active nav, focus, progress, chart | Accent (shift to `#9BA393`) |

### Trend indicators
No red/green. Income = rikyu (accent weight). Expense = `nezumi` (lighter, recedes). Absence of color IS the signal.

### Kakeibo envelopes
Needs = `sumi` (grounded). Wants = `nezumi` (lighter). Savings = `rikyu` (aspirational). Hierarchy through value and accent, not hue.

### Mapping to shadcn CSS variables

```
--color-background:     kami (#FAFAF9)
--color-foreground:     sumi (#1C1917)
--color-card:           #FFFFFF
--color-card-foreground: sumi
--color-primary:        rikyu (#7B8174)
--color-primary-foreground: kami
--color-secondary:      #F5F5F4
--color-secondary-foreground: sumi
--color-muted:          #F5F5F4
--color-muted-foreground: nezumi
--color-accent:         rikyu (#7B8174)
--color-accent-foreground: kami
--color-destructive:    #991B1B (used sparingly, form errors only)
--color-border:         usuzumi
--color-input:          usuzumi
--color-ring:           rikyu
```

Dark mode overrides all tokens with luminance-shifted equivalents. Rikyu shifts to `#9BA393`.

---

## 4. Typography

### Faces
- **Zen Old Mincho** — Display. Logo, hero numbers. Traditional Mincho serif, distinctive character. Loaded from Google Fonts.
- **Inter** — Body. Already in use, needs proper loading. Excellent for data-dense UIs.

### Loading
`<link>` tags in `index.html` for both fonts from Google Fonts. CSS `@theme` sets `--font-sans: "Inter", ...` and `--font-display: "Zen Old Mincho", ...`.

### Scale
- `text-xs` (11px) — labels, captions
- `text-sm` (14px) — body text, table cells
- `text-base` (16px) — default
- `text-lg` (18px) — page headings
- `text-3xl` (30px) — hero net worth number
- `text-4xl` (36px) — reserved for future full-page stats

### Weights
- Regular (400) — body, table data
- Medium (500) — buttons, labels, nav items
- Semibold (600) — page headings, card titles
- Bold (700) — hero numbers only

---

## 5. Layout

### Wireframe (desktop)
```
┌─────────┬───────────────────────────────────────┐
│         │                                       │
│ Sidebar │         Net Worth (hero)              │
│ ~220px  │      ─── thin rikyu line ───           │
│         │                                       │
│  logo   ├──────────────────┬────────────────────┤
│         │                  │                    │
│  nav    │   Cashflow       │   Recent           │
│  links  │   chart          │   transactions     │
│         │                  │                    │
│  ···    ├──────────────────┼────────────────────┤
│         │                  │                    │
│  theme  │   Kakeibo        │   Snowball         │
│  toggle │   envelopes      │   summary          │
│         │                  │                    │
└─────────┴──────────────────┴────────────────────┘
```

### Key changes vs. current
| Aspect | Current | New |
|---|---|---|
| Sidebar width | 240px | 220px |
| Page heading | `text-2xl font-bold` | `text-lg font-semibold` |
| Net worth | 2-col card | Full-width hero |
| Card gap | `gap-3` | `gap-4` |
| Card padding | `p-5` | `p-6` |
| Background | Vertical gradient | Flat `kami` |
| Card shadows | None (current) | None (kept) |
| Active nav | `bg-primary/10 text-primary` | `bg-rikyu/10 text-rikyu` |

### Responsive
- Mobile (below md): bottom nav visible, sidebar hidden, single column, net worth not full-width
- Tablet (md): sidebar visible, 2-col grid
- Desktop (lg): same as md but more breathing room

---

## 6. Signature element

**The net worth number as an inverted gesture.**

Every dashboard puts "Net Worth" as a label above the number. This one inverts it:
1. The peso amount sits large, in Zen Old Mincho bold, centered
2. A thin `rikyu` line (2px, 48px wide, centered) sits below the number
3. The label "Net Worth" sits below the line, small, in `nezumi`

The card has extra vertical padding (`py-10`) to give the number room to breathe. This is Ma applied to a financial KPI: the space around the number IS the design. No icon, no trend arrow, no background — just the number, a line, and a word.

---

## 7. Animation

One orchestrated moment on dashboard load:
- Net worth number: fade in + drift up 8px, 600ms, `cubic-bezier(0.16, 1, 0.3, 1)`
- 4 cards below: stagger in, 80ms delay between each, same easing + drift
- Total sequence: ~900ms
- Respects `prefers-reduced-motion: reduce` → no animation
- Implementation: CSS `@keyframes` + `animation-delay` via inline style or Tailwind utilities

---

## 8. Migration sequence

Each step keeps the app fully functional. `npm run build` after each.

### Step 1: Tokens + fonts
- Update `index.html` — add Google Fonts `<link>` for Space Grotesk + Inter
- Rewrite `index.css` — replace all color tokens with sumi + rikyu system
- Remove body gradient, set flat background
- **Risk:** Old class names like `bg-akebono`, `text-shui` will break. Grep and replace with new tokens. Also update `--font-display` from Space Grotesk to Zen Old Mincho.

### Step 2: Layout
- `Sidebar.tsx` — narrower (220px), rikyu active state, refined spacing
- `BottomNav.tsx` — rikyu active state
- `AppLayout.tsx` — adjust margin for narrower sidebar
- `ThemeToggle.tsx` — restyle with new tokens

### Step 3: Dashboard
- `NetWorthCard.tsx` — rebuild as signature element (inverted number hierarchy)
- `CashflowChart.tsx` — single rikyu line, remove second dataset color
- `RecentTransactions.tsx` — remove colored icon circles, use sumi weight hierarchy
- `KakeiboSummary.tsx` — sumi/nezumi/rikyu envelope colors
- `SnowballSummary.tsx` — simplify, use rikyu for progress bar
- `Dashboard.tsx` — full-width hero, new grid spacing, load animation

### Step 4: Accounts
- `AccountCard.tsx` — remove colored icon backgrounds, use sumi border accent
- `AccountList.tsx` — refine tab styling
- `AccountForm.tsx` — restyle color swatches (keep functionality)

### Step 5: Transactions
- `TransactionTable.tsx` — remove type-colored amounts, use weight hierarchy
- `TransactionFilters.tsx` — restyle with new tokens
- `TransactionForm.tsx` — restyle form controls

### Step 6: Verify
- `npm run build` — zero errors
- Manual check: all pages render, forms submit, navigation works, dark mode toggles

---

## 9. Anti-patterns to avoid

- No gradient backgrounds on cards or page
- No drop shadows (keep flat with borders)
- No saturated red/green for trends
- No decorative icons that don't do work
- No neumorphism or glassmorphism
- No generic "AI dashboard" template patterns
- No animation except the single orchestrated load sequence
- No new dependencies unless absolutely necessary

---

## 10. Files to modify

| File | Change type |
|---|---|
| `index.html` | Add font links |
| `src/index.css` | Full token rewrite |
| `src/components/layout/AppLayout.tsx` | Spacing adjustment |
| `src/components/layout/Sidebar.tsx` | Width, active state, spacing |
| `src/components/layout/BottomNav.tsx` | Active state, spacing |
| `src/components/layout/ThemeToggle.tsx` | Token update |
| `src/pages/Dashboard.tsx` | Grid layout, animation |
| `src/components/dashboard/NetWorthCard.tsx` | Full rebuild (signature element) |
| `src/components/dashboard/CashflowChart.tsx` | Token update, simplify |
| `src/components/dashboard/RecentTransactions.tsx` | Remove colored icons, weight hierarchy |
| `src/components/dashboard/KakeiboSummary.tsx` | New envelope colors |
| `src/components/dashboard/SnowballSummary.tsx` | Simplify, tokens |
| `src/pages/Accounts.tsx` | Token update |
| `src/components/accounts/AccountCard.tsx` | Token update, remove colored bg |
| `src/components/accounts/AccountList.tsx` | Token update |
| `src/components/accounts/AccountForm.tsx` | Token update |
| `src/pages/Transactions.tsx` | Token update |
| `src/components/transactions/TransactionTable.tsx` | Remove colored amounts |
| `src/components/transactions/TransactionFilters.tsx` | Token update |
| `src/components/transactions/TransactionForm.tsx` | Token update |
