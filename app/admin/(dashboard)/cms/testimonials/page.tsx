"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Star } from "lucide-react"
import type { Testimonial } from "@/lib/cms/types"

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    author_name: "",
    author_title: "",
    content: "",
    rating: 5,
    is_featured: false,
    is_active: true,
  })
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false })
    setItems((data || []) as Testimonial[])
    setIsLoading(false)
  }

  const resetForm = () => {
    setFormData({ author_name: "", author_title: "", content: "", rating: 5, is_featured: false, is_active: true })
    setEditing(null)
  }

  const openEdit = (item: Testimonial) => {
    setEditing(item)
    setFormData({
      author_name: item.author_name,
      author_title: item.author_title || "",
      content: item.content,
      rating: item.rating,
      is_featured: item.is_featured,
      is_active: item.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await supabase.from("testimonials").update(formData).eq("id", editing.id)
        toast.success("Testimonial updated")
      } else {
        await supabase.from("testimonials").insert(formData)
        toast.success("Testimonial created")
      }
      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch {
      toast.error("Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return
    await supabase.from("testimonials").delete().eq("id", id)
    toast.success("Deleted")
    loadData()
  }

  if (isLoading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground">Manage customer reviews and testimonials</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Testimonial</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Author Name *</Label>
                  <Input value={formData.author_name} onChange={(e) => setFormData({ ...formData, author_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Author Title</Label>
                  <Input value={formData.author_title} onChange={(e) => setFormData({ ...formData, author_title: e.target.value })} placeholder="e.g. Verified Buyer" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Testimonial *</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} required />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={String(formData.rating)} onValueChange={(v) => setFormData({ ...formData, rating: Number(v) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={String(r)}>
                        {r} Star{r !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_featured} onCheckedChange={(c) => setFormData({ ...formData, is_featured: c })} />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                  <Label>Active</Label>
                </div>
              </div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Testimonials ({items.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Testimonial</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.author_name}</p>
                      {item.author_title && <p className="text-sm text-muted-foreground">{item.author_title}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm truncate max-w-[300px]">{item.content}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.is_featured && <Badge variant="secondary">Featured</Badge>}
                      <Badge variant={item.is_active ? "default" : "outline"}>{item.is_active ? "Active" : "Inactive"}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
