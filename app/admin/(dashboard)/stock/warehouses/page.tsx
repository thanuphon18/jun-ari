import { getWarehouses, buildWarehouseTree } from "@/lib/erp/queries"
import { WarehousesClient } from "@/components/erp/warehouses-client"

export default async function WarehousesPage() {
  const warehouses = await getWarehouses()
  const tree = buildWarehouseTree(warehouses)
  return <WarehousesClient warehouses={warehouses} tree={tree} />
}
