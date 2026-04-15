"use client"

import Link from "next/link"
import { ShoppingCart, User, LogOut, Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import type { NavMenuItem } from "@/lib/cms/types"

interface SiteHeaderProps {
  navItems: NavMenuItem[]
}

export function SiteHeader({ navItems }: SiteHeaderProps) {
  const { profile, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <span className="text-2xl md:text-3xl font-serif tracking-wide text-foreground">
              jun-ari
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="px-5 py-2 text-sm font-medium tracking-wide text-foreground/70 hover:text-foreground transition-colors uppercase"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-9 bg-transparent border-border/50 focus-visible:ring-1 focus-visible:ring-foreground/20 text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px] bg-foreground text-background">
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User */}
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
                  <Link href={dashboardLink}>
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden sm:flex">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" asChild className="hidden sm:flex border-foreground/20 hover:bg-foreground hover:text-background transition-colors">
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden py-3 border-t border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-9"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-border/50">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="px-2 py-3 text-sm font-medium tracking-wide text-foreground/70 hover:text-foreground transition-colors uppercase"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="px-2 py-3 text-sm font-medium tracking-wide text-foreground uppercase"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
              {isAuthenticated && (
                <>
                  <Link
                    href={dashboardLink}
                    className="px-2 py-3 text-sm font-medium tracking-wide text-foreground/70 hover:text-foreground transition-colors uppercase"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="px-2 py-3 text-sm font-medium tracking-wide text-foreground/70 hover:text-foreground transition-colors text-left uppercase"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
