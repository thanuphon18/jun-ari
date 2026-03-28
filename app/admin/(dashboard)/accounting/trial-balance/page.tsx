import { getTrialBalance, getFiscalYears } from "@/lib/erp/queries"
import { TrialBalanceClient } from "@/components/erp/trial-balance-client"

export default async function TrialBalancePage() {
  const fiscalYears = await getFiscalYears()
  const defaultFY = fiscalYears.find(f => f.is_default) || fiscalYears[0]

  const rows = defaultFY
    ? await getTrialBalance(defaultFY.start_date, defaultFY.end_date)
    : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Trial Balance</h2>
        <p className="text-sm text-muted-foreground">
          Opening, period, and closing balances for all accounts
        </p>
      </div>
      <TrialBalanceClient rows={rows} fiscalYears={fiscalYears} />
    </div>
  )
}
