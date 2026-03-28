"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"

interface Setting {
  id: string
  key: string
  value: string | null
  type: string
}

export default function CmsSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .order("key")

      console.log('data',data)
    setSettings(data || [])
    setIsLoading(false)
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => 
      prev.map(s => s.key === key ? { ...s, value } : s)
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      for (const setting of settings) {
        await supabase
          .from("site_settings")
          .update({ value: setting.value, updated_at: new Date().toISOString() })
          .eq("key", setting.key)
      }
      toast.success("Settings saved successfully")
    } catch {
      toast.error("Failed to save settings")
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return <div className="py-10 text-center text-muted-foreground">Loading settings...</div>
  }

  const generalSettings = settings.filter(s => 
    ["company_name", "tagline", "contact_email", "contact_phone", "address"].includes(s.key)
  )
  const socialSettings = settings.filter(s => 
    ["facebook_url", "instagram_url", "line_id"].includes(s.key)
  )
  const storeSettings = settings.filter(s => 
    ["free_shipping_threshold", "announcement_text"].includes(s.key)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Manage your storefront configuration</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Basic information about your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generalSettings.map(setting => (
              <div key={setting.key} className="grid gap-2">
                <Label htmlFor={setting.key}>
                  {setting.key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
                <Input
                  id={setting.key}
                  value={setting.value || ""}
                  onChange={(e) => updateSetting(setting.key, e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Your social media links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialSettings.map(setting => (
              <div key={setting.key} className="grid gap-2">
                <Label htmlFor={setting.key}>
                  {setting.key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
                <Input
                  id={setting.key}
                  value={setting.value || ""}
                  onChange={(e) => updateSetting(setting.key, e.target.value)}
                  placeholder={setting.key.includes("url") ? "https://" : ""}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Store Settings</CardTitle>
            <CardDescription>Configure store behavior and promotions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {storeSettings.map(setting => (
              <div key={setting.key} className="grid gap-2">
                <Label htmlFor={setting.key}>
                  {setting.key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
                <Input
                  id={setting.key}
                  value={setting.value || ""}
                  onChange={(e) => updateSetting(setting.key, e.target.value)}
                  type={setting.type === "number" ? "number" : "text"}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
