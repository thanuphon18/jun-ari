import { getAdminDashboardStats, getAllOrders, getAllCustomers } from "@/lib/queries"
import { AnalyticsClient } from "@/components/admin/analytics-client"

export default async function AdminAnalyticsPage() {
  const [stats, orders, customers] = await Promise.all([
    getAdminDashboardStats(),
    getAllOrders(),
    getAllCustomers(),
  ])

  return <AnalyticsClient stats={stats} orders={orders} customers={customers} />
}
