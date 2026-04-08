"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { ProductWithVariants, ProductCategory } from "@/lib/types"
import { createProduct, updateProduct } from "@/lib/actions"
import { toast } from "sonner"
import { Plus, Pencil, Package } from "lucide-react"

function getStockStatus(product: ProductWithVariants) {
  const variants = product.product_variants ?? []
  if (variants.length === 0) return "unknown"
  const totalStock = variants.reduce((sum, v) => {
    const inv = v.inventory?.[0]
    return sum + (inv?.qty_on_hand ?? 0)
  }, 0)
  const minReorder = Math.min(...variants.map(v => v.inventory?.[0]?.reorder_level ?? 10))
  if (totalStock <= 0) return "out-of-stock"
  if (totalStock <= minReorder) return "low-stock"
  return "in-stock"
}

export function AdminProductsClient({ products, categories }: { products: ProductWithVariants[]; categories: ProductCategory[] }) {
  console.log('categories',categories)
  const [filter, setFilter] = useState("all")
  const [editProductId, setEditProductId] = useState<string | null>(null)

  const filtered = filter === "all" ? products : products.filter(p => p.category === filter)
  const editProduct = editProductId ? products.find(p => p.id === editProductId) : null

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Product Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col gap-4 py-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const result = await createProduct({
                  name: fd.get("name") as string,
                  slug: (fd.get("name") as string).toLowerCase().replace(/\s+/g, "-"),
                  description: fd.get("description") as string,
                  category: fd.get("category") as string,
                  base_price: parseFloat(fd.get("base_price") as string),
                })
                if (result.success) toast.success("Product created!")
                else toast.error(result.error)
              }}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" placeholder="e.g. Vitamin D Capsules" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" name="description" placeholder="Brief product description..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cat">Category</Label>
                  <Select name="category" defaultValue={categories[0]?.id}>
                    <SelectTrigger id="cat"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c?.id} value={c?.id}>{c?.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="base_price">Base Price</Label>
                  <Input id="base_price" name="base_price" type="number" step="0.01" placeholder="0.00" required />
                </div>
              </div>
              <Button type="submit">Create Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
        {categories.map(c => (
          <Button key={c?.id} variant={filter === c?.id ? "default" : "outline"} size="sm" onClick={() => setFilter(c?.id)}>{c?.name}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Base Price</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(product => {
                const stockStatus = getStockStatus(product)
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.description.slice(0, 60)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.category}</TableCell>
                    <TableCell className="text-foreground">{product.product_variants.length}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          stockStatus === "in-stock" ? "border-primary/30 text-primary" :
                          stockStatus === "low-stock" ? "border-yellow-500/30 text-yellow-600" :
                          "border-destructive/30 text-destructive"
                        }
                      >
                        {stockStatus === "in-stock" ? "In Stock" : stockStatus === "low-stock" ? "Low" : "OOS"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      ${Number(product.base_price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Dialog
                        open={editProductId === product.id}
                        onOpenChange={(open) => setEditProductId(open ? product.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Edit {product.name}</DialogTitle>
                          </DialogHeader>
                          <form
                            className="flex flex-col gap-4 py-4"
                            onSubmit={async (e) => {
                              e.preventDefault()
                              const fd = new FormData(e.currentTarget)
                              const result = await updateProduct(product.id, {
                                name: fd.get("name") as string,
                                description: fd.get("description") as string,
                                category: fd.get("category") as string,
                                base_price: parseFloat(fd.get("base_price") as string),
                              })
                              if (result.success) {
                                toast.success(`${product.name} updated!`)
                                setEditProductId(null)
                              } else {
                                toast.error(result.error)
                              }
                            }}
                          >
                            <div className="flex flex-col gap-2">
                              <Label>Product Name</Label>
                              <Input name="name" defaultValue={product.name} />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label>Description</Label>
                              <Textarea name="description" defaultValue={product.description} rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-2">
                                <Label>Category</Label>
                                <Select name="category" defaultValue={product.category}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {categories.map(c => <SelectItem key={c?.id} value={c?.id}>{c?.name}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label>Base Price</Label>
                                <Input name="base_price" type="number" step="0.01" defaultValue={Number(product.base_price)} />
                              </div>
                            </div>
                            <div className="border-t pt-4">
                              <p className="mb-3 text-sm font-medium text-foreground">Variants</p>
                              {product.product_variants.map(v => (
                                <div key={v.id} className="mb-3 rounded-lg border p-3">
                                  <p className="mb-1 text-xs font-medium text-muted-foreground">{v.name} ({v.sku})</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-0.5">
                                      <Label className="text-[10px]">Price</Label>
                                      <Input type="number" step="0.01" defaultValue={Number(v.price)} className="h-8 text-xs" readOnly />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <Label className="text-[10px]">Cost</Label>
                                      <Input type="number" step="0.01" defaultValue={Number(v.cost)} className="h-8 text-xs" readOnly />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <Button type="submit">Save Changes</Button>
                          </form>
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
    </div>
  )
}
