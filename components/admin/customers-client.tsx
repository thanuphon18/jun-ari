"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/order-status-badge"
import type { Profile, OrderWithItems } from "@/lib/types"
import { UserCircle } from "lucide-react"

type DistributorRow = {
  id: string
  company_name: string
  tier: string
  credit_limit: number
  wallet_balance: number
  total_points: number
  profiles: { full_name: string; email: string }
}

export function AdminCustomersClient({ customers, orders, distributors }: {
  customers: Profile[]
  orders: OrderWithItems[]
  distributors: DistributorRow[]
}) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const retailCustomers = customers.filter(c => c.role === "customer")
  const distributorUsers = customers.filter(c => c.role === "distributor")

  const getUserStats = (userId: string) => {
    const userOrders = orders.filter(o => o.user_id === userId)
    const totalSpend = userOrders.reduce((sum, o) => sum + Number(o.total), 0)
    const lastOrder = userOrders[0]
    return { orderCount: userOrders.length, totalSpend, lastOrderDate: lastOrder?.created_at ? new Date(lastOrder.created_at).toLocaleDateString() : "-" }
  }

  const selectedUser = selectedUserId ? customers.find(u => u.id === selectedUserId) : null
  const selectedUserOrders = selectedUserId ? orders.filter(o => o.user_id === selectedUserId) : []
  const selectedDist = selectedUserId ? distributors.find(d => d.profiles?.email === selectedUser?.email) : null

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Customer Management</h2>

      <Tabs defaultValue="retail">
        <TabsList className="mb-4">
          <TabsTrigger value="retail">Retail ({retailCustomers.length})</TabsTrigger>
          <TabsTrigger value="distributors">Distributors ({distributorUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="retail">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-right">Total Spend</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retailCustomers.map(u => {
                    const stats = getUserStats(u.id)
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-foreground">{u.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center text-foreground">{stats.orderCount}</TableCell>
                        <TableCell className="text-right font-medium text-foreground">${stats.totalSpend.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">{stats.lastOrderDate}</TableCell>
                        <TableCell>
                          <Dialog open={selectedUserId === u.id} onOpenChange={(open) => setSelectedUserId(open ? u.id : null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon"><UserCircle className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>{u.full_name}</DialogTitle>
                              </DialogHeader>
                              <CustomerProfile />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distributors">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-right">Total Spend</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributorUsers.map(u => {
                    const stats = getUserStats(u.id)
                    const dist = distributors.find(d => d.profiles?.email === u.email)
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-foreground">{dist?.company_name ?? "-"}</TableCell>
                        <TableCell className="text-foreground">{u.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/30 text-primary capitalize">{dist?.tier ?? "-"}</Badge>
                        </TableCell>
                        <TableCell className="text-center text-foreground">{stats.orderCount}</TableCell>
                        <TableCell className="text-right font-medium text-foreground">${stats.totalSpend.toFixed(2)}</TableCell>
                        <TableCell>
                          <Dialog open={selectedUserId === u.id} onOpenChange={(open) => setSelectedUserId(open ? u.id : null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon"><UserCircle className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>{dist?.company_name ?? u.full_name}</DialogTitle>
                              </DialogHeader>
                              <CustomerProfile />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  function CustomerProfile() {
    if (!selectedUser) return null
    return (
      <div className="flex flex-col gap-4 py-2">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium text-foreground">{selectedUser.full_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{selectedUser.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Role</p>
            <Badge variant="outline" className="capitalize">{selectedUser.role}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Joined</p>
            <p className="font-medium text-foreground">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
          </div>
          {selectedDist && (
            <>
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium text-foreground">{selectedDist.company_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tier</p>
                <Badge variant="outline" className="border-primary/30 text-primary capitalize">{selectedDist.tier}</Badge>
              </div>
            </>
          )}
        </div>
        {selectedUserOrders.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Order History</p>
            <div className="max-h-48 overflow-y-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedUserOrders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium text-foreground">{o.order_number}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                      <TableCell className="text-right text-foreground">${Number(o.total).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    )
  }
}
