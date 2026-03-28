"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Users } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createCustomer } from "@/lib/erp/actions"
import { formatCurrency } from "@/lib/erp/format"
import type { Customer } from "@/lib/erp/types"

export function CustomersClient({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const filtered = customers.filter(c =>
    c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    c.customer_group.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const result = await createCustomer({
      customer_name: fd.get("customer_name") as string,
      customer_type: fd.get("customer_type") as string,
      customer_group: fd.get("customer_group") as string,
      territory: (fd.get("territory") as string) || undefined,
      credit_limit: Number(fd.get("credit_limit")) || 0,
      credit_days: Number(fd.get("credit_days")) || 30,
    })
    if (result.success) {
      toast.success("Customer created")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const retail = customers.filter(c => c.customer_group === "Retail").length
  const wholesale = customers.filter(c => c.customer_group === "Wholesale").length

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-foreground">{customers.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Retail</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-foreground">{retail}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Wholesale</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-foreground">{wholesale}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-emerald-600">{customers.filter(c => c.is_active).length}</p></CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search customers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />New Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input id="customer_name" name="customer_name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select name="customer_type" defaultValue="Individual">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Group</Label>
                  <Select name="customer_group" defaultValue="Retail">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Wholesale">Wholesale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="credit_limit">Credit Limit</Label>
                  <Input id="credit_limit" name="credit_limit" type="number" defaultValue="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="credit_days">Credit Days</Label>
                  <Input id="credit_days" name="credit_days" type="number" defaultValue="30" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="territory">Territory</Label>
                <Input id="territory" name="territory" placeholder="e.g. West Coast" />
              </div>
              <Button type="submit">Create Customer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead className="text-right">Credit Limit</TableHead>
                <TableHead className="text-right">Credit Days</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No customers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.customer_name}</TableCell>
                    <TableCell>{c.customer_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={c.customer_group === "Wholesale" ? "border-amber-200 bg-amber-50 text-amber-700" : ""}>
                        {c.customer_group}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.territory || "-"}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(c.credit_limit)}</TableCell>
                    <TableCell className="text-right">{c.credit_days}</TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</Badge>
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
