import { getQuotations } from "@/lib/erp/queries"
import { QuotationsClient } from "@/components/erp/quotations-client"

export default async function QuotationsPage() {
  const quotations = await getQuotations()
  return <QuotationsClient quotations={quotations} />
}
