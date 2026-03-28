import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { getAdminDashboardStats, getAllOrders } from "@/lib/queries"
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  ArrowUpRight,
  Clock,
  Truck,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export default async function AdminOverviewPage() {
  const [stats, orders] = await Promise.all([
    getAdminDashboardStats(),
    getAllOrders(),
  ])

  const recentOrders = orders.slice(0, 5)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const processingOrders = orders.filter(o => o.status === 'processing').length
  const shippedOrders = orders.filter(o => o.status === 'shipped').length

  // Format currency in Thai Baht
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground">ภาพรวมการจัดการร้านค้า</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/admin/orders">
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Orders
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products/new">
              <Package className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Orders</p>
                <p className="text-sm text-muted-foreground/70">คำสั่งซื้อทั้งหมด</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.totalOrders}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Revenue</p>
                <p className="text-sm text-muted-foreground/70">รายได้ทั้งหมด</p>
                <p className="text-3xl font-bold text-foreground mt-2">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Customers</p>
                <p className="text-sm text-muted-foreground/70">ลูกค้า</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.customers}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Low Stock</p>
                <p className="text-sm text-muted-foreground/70">สินค้าใกล้หมด</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.lowStockCount}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500/10">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex items-center gap-4">
            <Clock className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingOrders}</p>
              <p className="text-sm text-amber-600">Pending Orders | รอดำเนินการ</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="ml-auto">
              <Link href="/admin/orders?status=pending">
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center gap-4">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{processingOrders}</p>
              <p className="text-sm text-blue-600">Processing | กำลังจัดเตรียม</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="ml-auto">
              <Link href="/admin/orders?status=processing">
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 flex items-center gap-4">
            <Truck className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{shippedOrders}</p>
              <p className="text-sm text-purple-600">Shipped | จัดส่งแล้ว</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="ml-auto">
              <Link href="/admin/orders?status=shipped">
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <CardDescription>คำสั่งซื้อล่าสุด</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/orders">
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order # | เลขที่</TableHead>
                <TableHead>Customer | ลูกค้า</TableHead>
                <TableHead>Date | วันที่</TableHead>
                <TableHead>Status | สถานะ</TableHead>
                <TableHead className="text-right">Total | ยอดรวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No orders yet | ยังไม่มีคำสั่งซื้อ
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map(order => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Link 
                        href={`/admin/orders/${order.id}`} 
                        className="font-medium text-primary hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {order.profiles?.full_name ?? "Guest"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
