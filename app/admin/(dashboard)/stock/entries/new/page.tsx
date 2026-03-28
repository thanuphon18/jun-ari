import { getLeafWarehouses } from "@/lib/erp/queries"
import { createClient } from "@/lib/supabase/server"
import { StockEntryForm } from "@/components/erp/stock-entry-form"

export default async function NewStockEntryPage() {
  const warehouses = await getLeafWarehouses()

  // Get product variants for item selection
  const supabase = await createClient()
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, sku, name, price, products(name)")
    .order("sku")

  return <StockEntryForm warehouses={warehouses} variants={(variants ?? []) as Array<{ id: string; sku: string; name: string; price: number; products: { name: string } | null }>} />
}
