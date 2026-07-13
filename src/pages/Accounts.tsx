import { AccountList } from "@/components/accounts/AccountList"
import { PageTitle } from "@/components/layout/PageTitle"

export default function AccountsPage() {
  return (
    <div>
      <PageTitle className="mb-6">Accounts</PageTitle>
      <AccountList />
    </div>
  )
}
