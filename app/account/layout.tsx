"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Package, User, RotateCcw, LogOut, Loader2 } from "lucide-react"
import type { ReactNode } from "react"

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { profile, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to access your account.</p>
          <Button className="mt-4" onClick={() => router.push("/login")}>Sign In</Button>
        </div>
      </div>
    )
  }

  const navItems = [
    { label: "My Orders", href: "/account", icon: <Package className="h-4 w-4" /> },
    { label: "My Profile", href: "/account/profile", icon: <User className="h-4 w-4" /> },
    { label: "Returns & Claims", href: "/account/returns", icon: <RotateCcw className="h-4 w-4" /> },
  ]

  const handleLogout = async () => {
    await logout()
    router.push("/")
    router.refresh()
  }

  return (
    <DashboardShell
      title="My Account"
      navItems={navItems}
      headerRight={
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="mr-1 h-4 w-4" /> Logout
        </Button>
      }
    >
      {children}
    </DashboardShell>
  )
}
