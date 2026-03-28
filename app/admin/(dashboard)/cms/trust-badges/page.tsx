"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Leaf, Truck, FlaskConical, ShieldCheck, Award, Heart, Star, Shield, Sparkles } from "lucide-react"
import type { TrustBadge } from "@/lib/cms/types"

const iconOptions = [
  { value: "Sparkles", label: "Sparkles", icon: Sparkles },
  { value: "Leaf", label: "Leaf", icon: Leaf },
  { value: "Truck", label: "Truck", icon: Truck },
  { value: "FlaskConical", label: "Flask", icon: FlaskConical },
  { value: "ShieldCheck", label: "Shield Check", icon: ShieldCheck },
  { value: "Award", label: "Award", icon: Award },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Star", label: "Star", icon: Star },
  { value: "Shield", label: "Shield", icon: Shield },
]

export default function TrustBadgesPage() {
  const [items, setItems] = useState<TrustBadge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TrustBadge | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon_name: "Shield",
    is_active: true,
  })
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data } = await supabase.from("trust_badges").select("*").order("position")
    setItems((data || []) as TrustBadge[])
    setIsLoading(false)
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", icon_name: "Shield", is_active: true })
    setEditing(null)
  }

  const openEdit = (item: TrustBadge) => {
    setEditing(item)
    setFormData({
      title: item.title,
      description: item.description || "",
      icon_name: item.icon_name,
      is_active: item.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await supabase.from("trust_badges").update(formData).eq("id", editing.id)
        toast.success("Badge updated")
      } else {
        const maxPos = Math.max(...items.map(i => i.position), 0)
        await supabase.from("trust_badges").insert({ ...formData, position: maxPos + 1 })
        toast.success("Badge created")
      }
      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch {
      toast.error("Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this badge?")) return
    await supabase.from("trust_badges").delete().eq("id", id)
    toast.success("Deleted")
    loadData()
  }

  const getIcon = (iconName: string) => {
    const option = iconOptions.find(o => o.value === iconName)
    if (!option) return Shield
    return option.icon
  }

  if (isLoading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trust Badges</h1>
          <p className="text-muted-foreground">Build customer confidence with trust indicators</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Badge</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Badge" : "Add Badge"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon_name} onValueChange={(v) => setFormData({ ...formData, icon_name: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((opt) => {
                      const Icon = opt.icon
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      )
                    })}
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
      </div>

      <Card>
        <CardHeader><CardTitle>All Trust Badges ({items.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const Icon = getIcon(item.icon_name)
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="text-muted-foreground">{item.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "default" : "outline"}>{item.is_active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
