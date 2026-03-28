import { getTrialBalance, getFiscalYears } from "@/lib/erp/queries"
import { FinancialReportsClient } from "@/components/erp/financial-reports-client"

export default async function FinancialReportsPage() {
  const fiscalYears = await getFiscalYears()
  const defaultFY = fiscalYears.find(f => f.is_default) || fiscalYears[0]

  const rows = defaultFY
    ? await getTrialBalance(defaultFY.start_date, defaultFY.end_date)
    : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Financial Reports</h2>
        <p className="text-sm text-muted-foreground">Profit & Loss, Balance Sheet derived from the General Ledger</p>
      </div>
      <FinancialReportsClient rows={rows} fiscalYears={fiscalYears} />
    </div>
  )
}
