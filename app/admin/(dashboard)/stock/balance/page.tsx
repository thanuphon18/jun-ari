import { createClient } from "@/lib/supabase/server"
import { StockBalanceClient } from "@/components/erp/stock-balance-client"

export default async function StockBalancePage() {
  const supabase = await createClient()

  // Get latest stock balance per variant+warehouse from stock ledger
  const { data: sle } = await supabase
    .from("stock_ledger_entries")
    .select("variant_id, warehouse_id, qty_after_transaction, valuation_rate, product_variants(sku, name), warehouses(name)")
    .eq("is_cancelled", false)
    .order("created_at", { ascending: false })

  // Group by variant+warehouse, take latest entry
  const balanceMap = new Map<string, {
    variant_id: string; warehouse_id: string; sku: string; item_name: string;
    warehouse_name: string; qty: number; valuation_rate: number; value: number
  }>()

  for (const entry of sle ?? []) {
    const key = `${entry.variant_id}-${entry.warehouse_id}`
    if (!balanceMap.has(key)) {
      balanceMap.set(key, {
        variant_id: entry.variant_id,
        warehouse_id: entry.warehouse_id,
        sku: (entry.product_variants as { sku: string; name: string } | null)?.sku ?? "",
        item_name: (entry.product_variants as { sku: string; name: string } | null)?.name ?? "",
        warehouse_name: (entry.warehouses as { name: string } | null)?.name ?? "",
        qty: Number(entry.qty_after_transaction),
        valuation_rate: Number(entry.valuation_rate),
        value: Number(entry.qty_after_transaction) * Number(entry.valuation_rate),
      })
    }
  }

  const balances = Array.from(balanceMap.values()).filter(b => b.qty !== 0)

  return <StockBalanceClient balances={balances} />
}
