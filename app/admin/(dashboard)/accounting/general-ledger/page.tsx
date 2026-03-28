import { getGLEntries, getLeafAccounts } from "@/lib/erp/queries"
import { GeneralLedgerClient } from "@/components/erp/general-ledger-client"

export default async function GeneralLedgerPage() {
  const [glEntries, accounts] = await Promise.all([
    getGLEntries(),
    getLeafAccounts(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">General Ledger</h2>
        <p className="text-sm text-muted-foreground">View all GL entries with filters by account, date, and voucher type</p>
      </div>
      <GeneralLedgerClient entries={glEntries} accounts={accounts} />
    </div>
  )
}
