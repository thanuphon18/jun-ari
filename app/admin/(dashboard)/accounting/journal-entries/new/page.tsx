import { getLeafAccounts } from "@/lib/erp/queries"
import { getCostCenters } from "@/lib/erp/queries"
import { JournalEntryForm } from "@/components/erp/journal-entry-form"

export default async function NewJournalEntryPage() {
  const [accounts, costCenters] = await Promise.all([
    getLeafAccounts(),
    getCostCenters(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">New Journal Entry</h2>
        <p className="text-sm text-muted-foreground">Create a double-entry journal entry. Debits must equal credits.</p>
      </div>
      <JournalEntryForm
        accounts={accounts.filter(a => !a.is_group)}
        costCenters={costCenters.filter(c => !c.is_group)}
      />
    </div>
  )
}
