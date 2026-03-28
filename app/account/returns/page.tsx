"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import useSWR from "swr"
import { Loader2 } from "lucide-react"
import type { OrderWithItems } from "@/lib/types"

export default function ReturnsPage() {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  const { data: deliveredOrders, isLoading } = useSWR<OrderWithItems[]>(
    user ? `delivered-orders-${user.id}` : null,
    async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .eq("status", "delivered")
      return (data ?? []) as OrderWithItems[]
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    toast.success("Return request submitted!")
  }

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Returns & Claims</h2>

      {submitted ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-foreground font-semibold">Return request submitted</p>
            <p className="mt-1 text-sm text-muted-foreground">We will review your request and get back to you within 2 business days.</p>
            <Button className="mt-4" onClick={() => setSubmitted(false)}>Submit Another</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Submit Return Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="order">Order Reference</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    {(deliveredOrders ?? []).map(o => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.order_number} - ${Number(o.total).toFixed(2)}
                      </SelectItem>
                    ))}
                    {(!deliveredOrders || deliveredOrders.length === 0) && (
                      <SelectItem value="none" disabled>No delivered orders</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" placeholder="Describe the issue..." required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="photo">Photo (optional)</Label>
                <Input id="photo" type="file" accept="image/*" />
              </div>
              <Button type="submit">Submit Request</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
