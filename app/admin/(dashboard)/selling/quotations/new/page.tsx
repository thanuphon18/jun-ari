import { getCustomers, getTaxes, getAllProductVariantsForSelect } from "@/lib/erp/queries"
import { QuotationForm } from "@/components/erp/quotation-form"

export default async function NewQuotationPage() {
  const [customers, taxes, products] = await Promise.all([
    getCustomers(),
    getTaxes(),
    getAllProductVariantsForSelect(),
  ])
  
  return <QuotationForm customers={customers} taxes={taxes} products={products} />
}
