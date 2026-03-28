import { getCustomers, getTaxes, getAllProductVariantsForSelect, getOrderForInvoice } from "@/lib/erp/queries"
import { SalesInvoiceForm } from "@/components/erp/sales-invoice-form"

interface Props {
  searchParams: Promise<{ order_id?: string }>
}

export default async function NewInvoicePage({ searchParams }: Props) {
  const params = await searchParams
  
  const [customers, taxes, products] = await Promise.all([
    getCustomers(),
    getTaxes(),
    getAllProductVariantsForSelect(),
  ])

  // If creating from an order, fetch order data
  let orderData = null
  if (params.order_id) {
    const order = await getOrderForInvoice(params.order_id)
    if (order) {
      orderData = {
        id: order.id,
        order_number: order.order_number,
        total: Number(order.total),
        items: (order.order_items || []).map((item: { variant_id?: string; product_name: string; quantity: number; unit_price: number }) => ({
          variant_id: item.variant_id || undefined,
          item_name: item.product_name,
          qty: item.quantity,
          unit_price: Number(item.unit_price),
        })),
        customer_name: order.profiles?.full_name,
        customer_email: order.profiles?.email,
      }
    }
  }

  return (
    <SalesInvoiceForm 
      customers={customers} 
      taxes={taxes} 
      products={products}
      orderData={orderData}
    />
  )
}
