import { HashRouter, Routes, Route } from "react-router-dom"
import { AccountsProvider } from "@/hooks/useAccounts"
import { TransactionsProvider } from "@/hooks/useTransactions"
import { TemplatesProvider } from "@/hooks/useTemplates"
import { DebtsProvider } from "@/hooks/useDebts"
import { KakeiboProvider } from "@/hooks/useKakeibo"
import { AppLayout } from "@/components/layout/AppLayout"
import DashboardPage from "@/pages/Dashboard"
import AccountsPage from "@/pages/Accounts"
import TransactionsPage from "@/pages/Transactions"
import DebtsPage from "@/pages/Debts"
import KakeiboPage from "@/pages/Kakeibo"
import ReportsPage from "@/pages/Reports"
import SettingsPage from "@/pages/Settings"

function App() {
  return (
    <HashRouter>
      <AccountsProvider>
        <TransactionsProvider>
          <TemplatesProvider>
            <DebtsProvider>
              <KakeiboProvider>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="accounts" element={<AccountsPage />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                    <Route path="debts" element={<DebtsPage />} />
                    <Route path="kakeibo" element={<KakeiboPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                </Routes>
              </KakeiboProvider>
            </DebtsProvider>
          </TemplatesProvider>
        </TransactionsProvider>
      </AccountsProvider>
    </HashRouter>
  )
}

export default App
