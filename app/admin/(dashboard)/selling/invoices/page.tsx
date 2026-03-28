import { getSalesInvoices } from "@/lib/erp/queries"
import { SalesInvoicesClient } from "@/components/erp/sales-invoices-client"

export default async function InvoicesPage() {
  const invoices = await getSalesInvoices()
  return <SalesInvoicesClient invoices={invoices} />
}
