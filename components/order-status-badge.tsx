import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/types"

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-success text-success-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  returned: "bg-destructive/10 text-destructive",
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={statusColors[status] || "bg-muted text-muted-foreground"}>
      {statusLabels[status] || status}
    </Badge>
  )
}
