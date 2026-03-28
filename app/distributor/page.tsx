"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"
import { Loader2 } from "lucide-react"
import type { OrderWithItems } from "@/lib/types"

export default function DistributorOrdersPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const { data: orders, isLoading } = useSWR<OrderWithItems[]>(
    user ? `dist-orders-${user.id}` : null,
    async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
      return (data ?? []) as OrderWithItems[]
    }
  )

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">My Orders</h2>
      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No orders yet.</CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/distributor/orders/${order.id}`} className="font-medium text-primary hover:underline">
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.po_number ?? "\u2014"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      ${Number(order.total).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
