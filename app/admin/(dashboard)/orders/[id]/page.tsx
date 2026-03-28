import { getOrderById } from "@/lib/queries"
import { notFound } from "next/navigation"
import { AdminOrderDetailClient } from "@/components/admin/order-detail-client"

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) notFound()

  return <AdminOrderDetailClient order={order} />
}
