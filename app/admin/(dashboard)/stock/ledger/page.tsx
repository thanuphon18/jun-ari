import { getStockLedgerEntries, getLeafWarehouses } from "@/lib/erp/queries"
import { StockLedgerClient } from "@/components/erp/stock-ledger-client"

export default async function StockLedgerPage() {
  const [entries, warehouses] = await Promise.all([
    getStockLedgerEntries(),
    getLeafWarehouses()
  ])
  return <StockLedgerClient entries={entries} warehouses={warehouses} />
}
