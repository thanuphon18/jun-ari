import { getLeafAccounts, getCustomers } from "@/lib/erp/queries"
import { PaymentEntryForm } from "@/components/erp/payment-entry-form"

export default async function NewPaymentPage() {
  const [accounts, customers] = await Promise.all([
    getLeafAccounts(),
    getCustomers(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">New Payment Entry</h2>
        <p className="text-sm text-muted-foreground">Record a payment received, payment made, or internal transfer</p>
      </div>
      <PaymentEntryForm accounts={accounts} customers={customers} />
    </div>
  )
}
