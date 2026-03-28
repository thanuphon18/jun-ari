"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Leaf, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, type ReactNode } from "react"

interface NavItem {
  label: string
  href: string
  icon: ReactNode
}

interface NavSection {
  section: string
}

type NavEntry = NavItem | NavSection

function isSection(entry: NavEntry): entry is NavSection {
  return "section" in entry
}

interface DashboardShellProps {
  children: ReactNode
  title: string
  navItems: NavEntry[]
  headerRight?: ReactNode
}

export function DashboardShell({ children, title, navItems, headerRight }: DashboardShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">GreenLeaf</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="flex flex-col gap-1">
            {navItems.map((entry, idx) => {
              if (isSection(entry)) {
                return (
                  <p key={entry.section} className={cn("px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", idx > 0 && "mt-4 mb-1")}>
                    {entry.section}
                  </p>
                )
              }
              const active = pathname === entry.href || (entry.href !== "/admin" && pathname.startsWith(entry.href))
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {entry.icon}
                  {entry.label}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="border-t p-3">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/">Back to Store</Link>
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {headerRight && <div className="ml-auto">{headerRight}</div>}
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
