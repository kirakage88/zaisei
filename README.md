# Zaisei (財清) — Personal Finance Dashboard

**Mobile-first PWA** for tracking cashflow, managing accounts, paying off debt with the Snowball method, and budgeting with the Javanese-inspired Kakeibo system — all client-side with IndexedDB storage.

> Built with React + Vite + TypeScript + shadcn/ui + Dexie.js + Chart.js  
> Deployed to GitHub Pages

---

## Features

- **Multi-Account Management** — Track checking, savings, credit cards, e-wallets, and cash accounts
- **Cashflow Tracking** — Log income, expenses, and transfers with category tagging
- **Debt Snowball Calculator** — Sort debts smallest-to-largest, waterfall extra payments, visualize payoff timeline
- **Loan Amortization Schedules** — Full payment breakdown per debt
- **Kakeibo Budgeting** — 3 envelopes (Needs, Wants, Savings) with weekly check-ins and monthly reset ceremony
- **Charts & Reports** — Spending breakdown, income vs expenses, net worth trends
- **PWA** — Installable on mobile/desktop, works offline
- **JSON Export/Import** — Full data portability with manual backup

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| UI | shadcn/ui + Tailwind CSS 3 |
| Storage | Dexie.js (IndexedDB) |
| Charts | Chart.js 4 + react-chartjs-2 |
| Forms | react-hook-form + zod |
| PWA | vite-plugin-pwa |
| Deploy | GitHub Actions → GitHub Pages |

---

## Design

Japanese minimal aesthetic — warm neutrals (Washi paper tones), restrained akebono red accents, ai indigo for depth, and matcha green for positive indicators. Fully responsive: desktop sidebar layout → mobile bottom-nav.

---

## Getting Started

```bash
npm install
npm run dev     # development server
npm run build   # production build
npm run preview # preview production build
```

---

## Project Plan

See [`plans/spec.md`](plans/spec.md) for the full implementation plan — 8 phases from scaffold to PWA polish, ready for OpenCode execution.
