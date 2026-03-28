"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Leaf, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { success, error } = await login(email, password)

    if (success) {
      toast.success("Logged in successfully!")
      router.push("/")
      router.refresh()
    } else {
      toast.error(error || "Invalid credentials")
    }
    setLoading(false)
  }

  const demoAccounts = [
    { label: "Admin (123/123)", email: "123", password: "123" },
    { label: "Customer", email: "customer@test.com", password: "123123" },
    { label: "Distributor", email: "distributor@test.com", password: "123123" },
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Welcome to GreenLeaf</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Sign In</CardTitle>
            <CardDescription>Enter your email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="mt-4 rounded-lg bg-muted p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Quick login:</p>
              <div className="flex flex-wrap gap-1">
                {demoAccounts.map(acc => (
                  <Button
                    key={acc.label}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => { setEmail(acc.email); setPassword(acc.password) }}
                  >
                    {acc.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Admin? <Link href="/admin/login" className="text-primary hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  )
}
