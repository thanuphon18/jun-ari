"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { OrderWithItems, Profile } from "@/lib/types"
import { toast } from "sonner"
import { Download, TrendingUp } from "lucide-react"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

type Stats = {
  totalRevenue: number
  totalOrders: number
  activeProducts: number
  customers: number
  lowStockCount: number
  revenueByMonth: Record<string, number>
  ordersByStatus: Record<string, number>
}

const STATUS_COLORS = ["hsl(150, 60%, 45%)", "hsl(220, 60%, 55%)", "hsl(40, 80%, 55%)", "hsl(0, 60%, 50%)", "hsl(270, 50%, 55%)", "hsl(180, 50%, 45%)"]
const SPLIT_COLORS = ["hsl(150, 60%, 45%)", "hsl(220, 60%, 55%)"]

export function AnalyticsClient({ stats, orders, customers }: { stats: Stats; orders: OrderWithItems[]; customers: Profile[] }) {
  // Revenue by month
  const revenueData = Object.entries(stats.revenueByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ name: month, revenue }))

  // Orders by status
  const statusData = Object.entries(stats.ordersByStatus).map(([name, value]) => ({ name, value }))

  // Top products by revenue
  const productRevenueMap = new Map<string, number>()
  orders.forEach(o => {
    o.order_items.forEach(item => {
      const name = item.product_name
      productRevenueMap.set(name, (productRevenueMap.get(name) ?? 0) + Number(item.total_price))
    })
  })
  const topProducts = Array.from(productRevenueMap.entries())
    .map(([name, revenue]) => ({ name: name.length > 16 ? name.slice(0, 16) + "..." : name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)

  // Customer split
  const customerSplit = [
    { name: "B2C Retail", value: customers.filter(c => c.role === "customer").length },
    { name: "B2B Distributor", value: customers.filter(c => c.role === "distributor").length },
  ]

  const avgOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground">Revenue, products, orders, and customer insights</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Data exported (demo)")}>
          <Download className="mr-1 h-4 w-4" /> Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Revenue Over Time</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly revenue from all orders</p>
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(150, 60%, 45%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(150, 60%, 45%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <YAxis dataKey="name" type="category" width={120} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(150, 60%, 45%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fontSize={11}
                  >
                    {statusData.map((_, idx) => (
                      <Cell key={idx} fill={STATUS_COLORS[idx % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Acquisition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Customer Acquisition</CardTitle>
            <p className="text-xs text-muted-foreground">B2C vs B2B split</p>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    fontSize={12}
                  >
                    {customerSplit.map((_, idx) => (
                      <Cell key={idx} fill={SPLIT_COLORS[idx]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Summary Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">
                ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold text-foreground">
                ${avgOrderValue.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold text-foreground">{customers.filter(c => c.role !== "admin").length}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
