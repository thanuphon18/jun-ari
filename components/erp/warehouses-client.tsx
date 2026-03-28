"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Warehouse as WarehouseIcon, Plus, FolderOpen, Folder } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createWarehouse } from "@/lib/erp/actions"
import { cn } from "@/lib/utils"
import type { Warehouse } from "@/lib/erp/types"

function WarehouseNode({ warehouse, depth = 0 }: { warehouse: Warehouse; depth?: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = warehouse.children && warehouse.children.length > 0

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted",
          hasChildren ? "cursor-pointer" : "cursor-default"
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <span className="w-4 shrink-0" />
        )}
        {warehouse.is_group ? (
          expanded ? <FolderOpen className="h-4 w-4 shrink-0 text-primary" /> : <Folder className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <WarehouseIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 font-medium text-foreground">{warehouse.name}</span>
        {warehouse.address && <span className="text-xs text-muted-foreground">{warehouse.address}</span>}
        <Badge variant={warehouse.is_active ? "default" : "secondary"} className="ml-2">
          {warehouse.is_active ? "Active" : "Inactive"}
        </Badge>
      </button>
      {expanded && hasChildren && (
        <div>
          {warehouse.children!.map(child => (
            <WarehouseNode key={child.id} warehouse={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function WarehousesClient({ warehouses, tree }: { warehouses: Warehouse[]; tree: Warehouse[] }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const groupWarehouses = warehouses.filter(w => w.is_group)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const parentVal = fd.get("parent_id") as string
    const result = await createWarehouse({
      name: fd.get("name") as string,
      parent_id: parentVal === "none" ? undefined : parentVal,
      address: (fd.get("address") as string) || undefined,
    })
    if (result.success) {
      toast.success("Warehouse created")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const leafCount = warehouses.filter(w => !w.is_group).length
  const activeCount = warehouses.filter(w => w.is_active && !w.is_group).length

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Warehouses</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{leafCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Groups</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{groupWarehouses.length}</p>
        </Card>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />New Warehouse</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Warehouse</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4">
              <div className="grid gap-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
              <div className="grid gap-2">
                <Label>Parent</Label>
                <Select name="parent_id" defaultValue={groupWarehouses[0]?.id || "none"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root)</SelectItem>
                    {groupWarehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" /></div>
              <Button type="submit">Create Warehouse</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-2">
          {tree.map(w => <WarehouseNode key={w.id} warehouse={w} />)}
        </CardContent>
      </Card>
    </div>
  )
}
