import { getAccounts, buildAccountTree } from "@/lib/erp/queries"
import { AccountTreeClient } from "@/components/erp/account-tree-client"

export default async function AccountingPage() {
  const accounts = await getAccounts()
  const tree = buildAccountTree(accounts)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Chart of Accounts</h2>
          <p className="text-sm text-muted-foreground">
            ERPNext-style hierarchical chart of accounts with {accounts.length} accounts
          </p>
        </div>
      </div>
      <AccountTreeClient accounts={accounts} tree={tree} />
    </div>
  )
}
