import { getQuotationById } from "@/lib/erp/queries"
import { QuotationDetail } from "@/components/erp/quotation-detail"
import { notFound } from "next/navigation"

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quotation = await getQuotationById(id)
  if (!quotation) notFound()
  return <QuotationDetail quotation={quotation} />
}
