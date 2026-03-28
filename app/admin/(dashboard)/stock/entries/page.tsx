import { getStockEntries } from "@/lib/erp/queries"
import { StockEntriesClient } from "@/components/erp/stock-entries-client"

export default async function StockEntriesPage() {
  const entries = await getStockEntries()
  return <StockEntriesClient entries={entries} />
}
