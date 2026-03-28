"use client"

import Link from "next/link"
import { ShoppingCart, User, LogOut, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export function StoreHeader() {
  const { profile, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const router = useRouter()

  const dashboardLink = profile?.role === "distributor"
    ? "/distributor"
    : profile?.role === "admin"
      ? "/admin"
      : "/account"

  const handleLogout = async () => {
    await logout()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">GreenLeaf</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </Button>

          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={dashboardLink}>
                  <User className="mr-1 h-4 w-4" />
                  {profile?.full_name?.split(" ")[0] || "Account"}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
