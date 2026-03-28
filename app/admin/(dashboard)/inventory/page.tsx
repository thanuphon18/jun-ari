import { getAllInventory, getStockAdjustments } from "@/lib/queries"
import { AdminInventoryClient } from "@/components/admin/inventory-client"

export default async function AdminInventoryPage() {
  const [inventory, adjustments] = await Promise.all([
    getAllInventory(),
    getStockAdjustments(),
  ])

  return <AdminInventoryClient inventory={inventory} adjustments={adjustments} />
}
