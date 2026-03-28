import { getPaymentEntries } from "@/lib/erp/queries"
import { PaymentsClient } from "@/components/erp/payments-client"

export default async function PaymentsPage() {
  const entries = await getPaymentEntries()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Payment Entries</h2>
        <p className="text-sm text-muted-foreground">Receive payments, make payments, or record internal transfers</p>
      </div>
      <PaymentsClient entries={entries} />
    </div>
  )
}
