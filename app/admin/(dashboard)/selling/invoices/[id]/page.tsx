import { getSalesInvoiceById } from "@/lib/erp/queries"
import { SalesInvoiceDetail } from "@/components/erp/sales-invoice-detail"
import { notFound } from "next/navigation"

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getSalesInvoiceById(id)
  if (!invoice) notFound()
  return <SalesInvoiceDetail invoice={invoice} />
}
