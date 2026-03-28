"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { updateProfile } from "@/lib/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function DistributorProfilePage() {
  const { user, profile, distributorProfile, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const result = await updateProfile(user.id, {
      full_name: formData.get("name") as string,
      phone: formData.get("phone") as string,
    })

    if (result.success) {
      await refreshProfile()
      toast.success("Profile updated!")
    } else {
      toast.error(result.error || "Failed to update")
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-lg font-semibold text-foreground">My Profile</h2>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Company Information</CardTitle></CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <Label>Company Name</Label>
                <Input defaultValue={distributorProfile?.company_name || ""} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tax ID</Label>
                <Input defaultValue={distributorProfile?.tax_id || ""} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Contact Name</Label>
                <Input name="name" defaultValue={profile?.full_name || ""} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input type="email" defaultValue={profile?.email || ""} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Phone</Label>
                <Input name="phone" defaultValue={profile?.phone || ""} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Account Details</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tier</span>
              <span className="font-medium text-foreground capitalize">{distributorProfile?.tier || "bronze"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Credit Limit</span>
              <span className="font-medium text-foreground">${Number(distributorProfile?.credit_limit ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Points</span>
              <span className="font-medium text-foreground">{distributorProfile?.total_points ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
