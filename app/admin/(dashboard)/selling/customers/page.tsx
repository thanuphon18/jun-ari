import { getCustomers } from "@/lib/erp/queries"
import { CustomersClient } from "@/components/erp/customers-client"

export default async function CustomersPage() {
  const customers = await getCustomers()
  return <CustomersClient customers={customers} />
}
