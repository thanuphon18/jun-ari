"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Package, BarChart3, Wallet, Warehouse, User, LogOut, Loader2 } from "lucide-react"
import type { ReactNode } from "react"

export default function DistributorLayout({ children }: { children: ReactNode }) {
  const { profile, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated || profile?.role !== "distributor") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in as a distributor.</p>
          <Button className="mt-4" onClick={() => router.push("/login")}>Sign In</Button>
        </div>
      </div>
    )
  }

  const navItems = [
    { label: "My Orders", href: "/distributor", icon: <Package className="h-4 w-4" /> },
    { label: "Tiered Pricing", href: "/distributor/pricing", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Wallet & Points", href: "/distributor/wallet", icon: <Wallet className="h-4 w-4" /> },
    { label: "Inventory Allocation", href: "/distributor/inventory", icon: <Warehouse className="h-4 w-4" /> },
    { label: "My Profile", href: "/distributor/profile", icon: <User className="h-4 w-4" /> },
  ]

  const handleLogout = async () => {
    await logout()
    router.push("/")
    router.refresh()
  }

  return (
    <DashboardShell
      title="Distributor Portal"
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
