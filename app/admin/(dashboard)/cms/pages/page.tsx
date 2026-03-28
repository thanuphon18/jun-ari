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
import { toast } from "sonner"
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import type { ContentPage } from "@/lib/cms/types"

export default function ContentPagesPage() {
  const [items, setItems] = useState<ContentPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ContentPage | null>(null)
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    meta_description: "",
    is_published: true,
  })
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data } = await supabase.from("content_pages").select("*").order("title")
    setItems((data || []) as ContentPage[])
    setIsLoading(false)
  }

  const resetForm = () => {
    setFormData({ slug: "", title: "", content: "", meta_description: "", is_published: true })
    setEditing(null)
  }

  const openEdit = (item: ContentPage) => {
    setEditing(item)
    setFormData({
      slug: item.slug,
      title: item.title,
      content: item.content || "",
      meta_description: item.meta_description || "",
      is_published: item.is_published,
    })
    setIsDialogOpen(true)
  }

  const handleTitleChange = (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    setFormData({ ...formData, title, slug: editing ? formData.slug : slug })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await supabase.from("content_pages").update({ ...formData, updated_at: new Date().toISOString() }).eq("id", editing.id)
        toast.success("Page updated")
      } else {
        await supabase.from("content_pages").insert(formData)
        toast.success("Page created")
      }
      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch {
      toast.error("Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return
    await supabase.from("content_pages").delete().eq("id", id)
    toast.success("Deleted")
    loadData()
  }

  if (isLoading) return <div className="py-10 text-center text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Pages</h1>
          <p className="text-muted-foreground">Manage static pages (About, Privacy, Terms, etc.)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Page</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Page" : "Add Page"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Input value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} placeholder="SEO description" />
              </div>
              <div className="space-y-2">
                <Label>Content (Markdown supported)</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={12} className="font-mono text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_published} onCheckedChange={(c) => setFormData({ ...formData, is_published: c })} />
                <Label>Published</Label>
              </div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Pages ({items.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <a href={`/${item.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                      /{item.slug}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_published ? "default" : "outline"}>{item.is_published ? "Published" : "Draft"}</Badge>
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
