"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(email, password)
    if (result.success) {
      toast.success("Admin logged in!")
      router.push("/admin")
    } else {
      toast.error(result.error || "Invalid admin credentials.")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-3 text-xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-sm text-muted-foreground">Internal staff access only</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Admin Sign In</CardTitle>
            <CardDescription>Enter your admin credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 rounded-lg bg-muted p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Demo admin:</p>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setEmail("admin@greenleaf.com"); setPassword("admin123") }}>
                admin@greenleaf.com / admin123
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
