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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, GripVertical, Image as ImageIcon, Palette } from "lucide-react"
import type { HeroBanner } from "@/lib/cms/types"

export default function HeroBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null)
  const [bannerType, setBannerType] = useState<"color" | "image">("color")
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    cta_text: "",
    cta_link: "",
    image_url: "",
    background_color: "#1a1a1a",
    text_color: "#ffffff",
    is_active: true,
  })
  const supabase = createClient()

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .order("position")
    if (error) {
      toast.error("Failed to load banners")
      console.error(error)
    }
    setBanners((data || []) as HeroBanner[])
    setIsLoading(false)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      cta_text: "",
      cta_link: "",
      image_url: "",
      background_color: "#1a1a1a",
      text_color: "#ffffff",
      is_active: true,
    })
    setBannerType("color")
    setEditingBanner(null)
  }

  const openEdit = (banner: HeroBanner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      cta_text: banner.cta_text || "",
      cta_link: banner.cta_link || "",
      image_url: banner.image_url || "",
      background_color: banner.background_color,
      text_color: banner.text_color,
      is_active: banner.is_active,
    })
    setBannerType(banner.image_url ? "image" : "color")
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('=---')
    e.preventDefault()
    
    const submitData = {
      ...formData,
      image_url: bannerType === "image" ? formData.image_url : null,
    }

    console.log(submitData)
    
    try {
      if (editingBanner) {
        console.log(1)

        const { error } = await supabase
          .from("hero_banners")
          .update(submitData)
          .eq("id", editingBanner.id)
          console.log(2)
        if (error) throw error
        toast.success("Banner updated")
      } else {
        const maxPosition = Math.max(...banners.map(b => b.position), 0)
        const { error } = await supabase
          .from("hero_banners")
          .insert({ ...submitData, position: maxPosition + 1 })
        if (error) throw error
        toast.success("Banner created")
      }
      setIsDialogOpen(false)
      resetForm()
      loadBanners()
    } catch (error) {
      console.error(error)
      toast.error("Failed to save banner")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return
    const { error } = await supabase.from("hero_banners").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete banner")
      return
    }
    toast.success("Banner deleted")
    loadBanners()
  }

  const toggleActive = async (banner: HeroBanner) => {
    const { error } = await supabase
      .from("hero_banners")
      .update({ is_active: !banner.is_active })
      .eq("id", banner.id)
    if (error) {
      toast.error("Failed to update banner")
      return
    }
    loadBanners()
  }

  if (isLoading) {
    return <div className="py-10 text-center text-muted-foreground">Loading banners...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hero Banners</h1>
          <p className="text-muted-foreground">Manage homepage carousel banners</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Banner</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBanner ? "Edit Banner" : "Add Banner"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Banner Type Selection */}
              <div className="space-y-3">
                <Label>Banner Type</Label>
                <RadioGroup value={bannerType} onValueChange={(v) => setBannerType(v as "color" | "image")} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="color" id="type-color" />
                    <Label htmlFor="type-color" className="flex items-center gap-2 cursor-pointer">
                      <Palette className="h-4 w-4" /> Solid Color
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="type-image" />
                    <Label htmlFor="type-image" className="flex items-center gap-2 cursor-pointer">
                      <ImageIcon className="h-4 w-4" /> Background Image
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
              
              {/* Image URL - only shown for image type */}
              {bannerType === "image" && (
                <div className="space-y-2">
                  <Label>Image URL *</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required={bannerType === "image"}
                  />
                  {formData.image_url && (
                    <div className="mt-2 relative h-32 rounded-md overflow-hidden bg-muted">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CTA Text</Label>
                  <Input
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Link</Label>
                  <Input
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    placeholder="/shop"
                  />
                </div>
              </div>

              {/* Color options - shown for both types */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{bannerType === "image" ? "Overlay Color" : "Background Color"}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="h-10 w-14 p-1"
                    />
                    <Input
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      className="h-10 w-14 p-1"
                    />
                    <Input
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div 
                  className="relative h-32 rounded-md overflow-hidden flex items-center justify-center"
                  style={{ 
                    backgroundColor: formData.background_color,
                  }}
                >
                  {bannerType === "image" && formData.image_url && (
                    <>
                      <img 
                        src={formData.image_url} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <div 
                        className="absolute inset-0" 
                        style={{ backgroundColor: formData.background_color, opacity: 0.6 }}
                      />
                    </>
                  )}
                  <div className="relative z-10 text-center px-4">
                    <p className="text-lg font-semibold" style={{ color: formData.text_color }}>
                      {formData.title || "Banner Title"}
                    </p>
                    {formData.subtitle && (
                      <p className="text-sm opacity-80" style={{ color: formData.text_color }}>
                        {formData.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingBanner ? "Update Banner" : "Create Banner"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Banners ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Colors</TableHead>
                <TableHead>CTA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell><GripVertical className="h-4 w-4 text-muted-foreground" /></TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{banner.title}</p>
                      {banner.subtitle && (
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">{banner.subtitle}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {banner.image_url ? (
                        <><ImageIcon className="h-4 w-4" /> Image</>
                      ) : (
                        <><Palette className="h-4 w-4" /> Color</>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ backgroundColor: banner.background_color }}
                        title="Background"
                      />
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ backgroundColor: banner.text_color }}
                        title="Text"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {banner.cta_text && (
                      <span className="text-sm">{banner.cta_text}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={() => toggleActive(banner)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(banner)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
