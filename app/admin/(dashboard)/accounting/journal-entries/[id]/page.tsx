import { notFound } from "next/navigation"
import { getJournalEntryById } from "@/lib/erp/queries"
import { JournalEntryDetail } from "@/components/erp/journal-entry-detail"

export default async function JournalEntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const entry = await getJournalEntryById(id)
  if (!entry) notFound()

  return (
    <div className="flex flex-col gap-6">
      <JournalEntryDetail entry={entry} />
    </div>
  )
}
