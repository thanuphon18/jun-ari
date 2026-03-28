"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { NavMenuItem } from "@/lib/cms/types"

export default function NavigationPage() {
  const [items, setItems] = useState<NavMenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<NavMenuItem | null>(null)
  const [formData, setFormData] = useState({
    label: "",
    href: "",
    menu_location: "header" as "header" | "footer",
    is_active: true,
  })
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data } = await supabase.from("nav_menu_items").select("*").order("menu_location").order("position")
    setItems((data || []) as NavMenuItem[])
    setIsLoading(false)
  }

  const resetForm = () => {
    setFormData({ label: "", href: "", menu_location: "header", is_active: true })
    setEditing(null)
  }

  const openEdit = (item: NavMenuItem) => {
    setEditing(item)
    setFormData({
      label: item.label,
      href: item.href,
      menu_location: item.menu_location,
      is_active: item.is_active,
    })
    setIsDialogOpen(true)
  }

  const openAddFor = (location: "header" | "footer") => {
    resetForm()
    setFormData({ ...formData, menu_location: location })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await supabase.from("nav_menu_items").update(formData).eq("id", editing.id)
        toast.success("Menu item updated")
      } else {
        const locationItems = items.filter(i => i.menu_location === formData.menu_location)
        const maxPos = Math.max(...locationItems.map(i => i.position), 0)
        await supabase.from("nav_menu_items").insert({ ...formData, position: maxPos + 1 })
        toast.success("Menu item created")
      }
      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch {
      toast.error("Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return
    await supabase.from("nav_menu_items").delete().eq("id", id)
    toast.success("Deleted")
    loadData()
  }

  const toggleActive = async (item: NavMenuItem) => {
    await supabase.from("nav_menu_items").update({ is_active: !item.is_active }).eq("id", item.id)
    loadData()
  }

  const headerItems = items.filter(i => i.menu_location === "header")
  const footerItems = items.filter(i => i.menu_location === "footer")

  const MenuTable = ({ menuItems, location }: { menuItems: NavMenuItem[], location: "header" | "footer" }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Label</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {menuItems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              No menu items. Click the button above to add one.
            </TableCell>
          </TableRow>
        ) : (
          menuItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.label}</TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">{item.href}</TableCell>
              <TableCell>
                <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  if (isLoading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Navigation</h1>
        <p className="text-muted-foreground">Manage header and footer menu links</p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="e.g. About Us" required />
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input value={formData.href} onChange={(e) => setFormData({ ...formData, href: e.target.value })} placeholder="/about" required />
            </div>
            <div className="space-y-2">
              <Label>Menu Location</Label>
              <Select value={formData.menu_location} onValueChange={(v) => setFormData({ ...formData, menu_location: v as "header" | "footer" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
              <Label>Active</Label>
            </div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="header">
        <TabsList>
          <TabsTrigger value="header">Header Menu</TabsTrigger>
          <TabsTrigger value="footer">Footer Menu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="header">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Header Navigation</CardTitle>
                <CardDescription>Links shown in the main site header</CardDescription>
              </div>
              <Button onClick={() => openAddFor("header")}><Plus className="mr-2 h-4 w-4" />Add Item</Button>
            </CardHeader>
            <CardContent>
              <MenuTable menuItems={headerItems} location="header" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Footer Navigation</CardTitle>
                <CardDescription>Links shown in the site footer</CardDescription>
              </div>
              <Button onClick={() => openAddFor("footer")}><Plus className="mr-2 h-4 w-4" />Add Item</Button>
            </CardHeader>
            <CardContent>
              <MenuTable menuItems={footerItems} location="footer" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
