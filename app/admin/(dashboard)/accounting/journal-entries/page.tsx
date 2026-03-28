import { getJournalEntries } from "@/lib/erp/queries"
import { JournalEntriesClient } from "@/components/erp/journal-entries-client"

export default async function JournalEntriesPage() {
  const entries = await getJournalEntries()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Journal Entries</h2>
        <p className="text-sm text-muted-foreground">Create and manage journal entries with double-entry bookkeeping</p>
      </div>
      <JournalEntriesClient entries={entries} />
    </div>
  )
}
