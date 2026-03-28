import { getAllCustomers, getAllOrders, getDistributorProfiles } from "@/lib/queries"
import { AdminCustomersClient } from "@/components/admin/customers-client"

export default async function AdminCustomersPage() {
  const [customers, orders, distributors] = await Promise.all([
    getAllCustomers(),
    getAllOrders(),
    getDistributorProfiles(),
  ])

  return <AdminCustomersClient customers={customers} orders={orders} distributors={distributors} />
}
