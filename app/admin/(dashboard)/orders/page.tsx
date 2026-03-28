import { getAllOrders } from "@/lib/queries"
import { AdminOrdersClient } from "@/components/admin/orders-client"

export default async function AdminOrdersPage() {
  const orders = await getAllOrders()


  // console.log('orders', orders)

  return <AdminOrdersClient orders={orders} />
}
