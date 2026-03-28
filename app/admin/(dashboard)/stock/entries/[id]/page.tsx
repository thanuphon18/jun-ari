import { getStockEntryById } from "@/lib/erp/queries"
import { StockEntryDetail } from "@/components/erp/stock-entry-detail"
import { notFound } from "next/navigation"

export default async function StockEntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const entry = await getStockEntryById(id)
  if (!entry) notFound()
  return <StockEntryDetail entry={entry} />
}
