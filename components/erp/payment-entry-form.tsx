"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createPaymentEntry } from "@/lib/erp/actions"
import type { Account, Customer } from "@/lib/erp/types"

export function PaymentEntryForm({ accounts, customers }: { accounts: Account[]; customers: Customer[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paymentType, setPaymentType] = useState("Receive")
  const [postingDate, setPostingDate] = useState(new Date().toISOString().split("T")[0])
  const [partyType, setPartyType] = useState("Customer")
  const [partyId, setPartyId] = useState("")
  const [paidFrom, setPaidFrom] = useState("")
  const [paidTo, setPaidTo] = useState("")
  const [paidAmount, setPaidAmount] = useState("")
  const [remarks, setRemarks] = useState("")

  const bankAccounts = accounts.filter(a => a.account_type === "Bank" || a.account_type === "Cash")
  const receivableAccounts = accounts.filter(a => a.account_type === "Receivable")
  const payableAccounts = accounts.filter(a => a.account_type === "Payable")

  const handleSubmit = async () => {
    if (!paidFrom || !paidTo || !paidAmount) {
      toast.error("Please fill all required fields")
      return
    }

    setLoading(true)
    const result = await createPaymentEntry({
      payment_type: paymentType,
      posting_date: postingDate,
      party_type: partyType || undefined,
      party_id: partyId || undefined,
      paid_from: paidFrom,
      paid_to: paidTo,
      paid_amount: parseFloat(paidAmount),
      remarks: remarks || undefined,
    })

    if (result.success) {
      toast.success("Payment Entry created")
      router.push("/admin/accounting/payments")
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label>Payment Type</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receive">Receive</SelectItem>
                  <SelectItem value="Pay">Pay</SelectItem>
                  <SelectItem value="Internal Transfer">Internal Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Posting Date</Label>
              <Input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} />
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Party & Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Party Type</Label>
              <Select value={partyType} onValueChange={setPartyType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Supplier">Supplier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Customer</Label>
              <Select value={partyId} onValueChange={setPartyId}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.customer_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Paid From</Label>
              <Select value={paidFrom} onValueChange={setPaidFrom}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {(paymentType === "Receive" ? receivableAccounts : bankAccounts).concat(
                    paymentType === "Internal Transfer" ? bankAccounts : []
                  ).map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.account_number ? `${a.account_number} - ` : ""}{a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Paid To</Label>
              <Select value={paidTo} onValueChange={setPaidTo}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {(paymentType === "Receive" ? bankAccounts : payableAccounts).concat(
                    paymentType === "Internal Transfer" ? bankAccounts : []
                  ).map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.account_number ? `${a.account_number} - ` : ""}{a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Label>Remarks</Label>
            <Textarea rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional note..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>Discard</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save as Draft"}
        </Button>
      </div>
    </div>
  )
}
