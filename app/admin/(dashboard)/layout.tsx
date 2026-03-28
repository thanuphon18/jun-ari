"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, Warehouse, Users, BarChart3, Tag, Database, LogOut, BookOpen, FileText, CreditCard, PieChart, Scale, Receipt, ClipboardList, DollarSign, Boxes, ArrowLeftRight, BookOpenCheck, BarChart, HelpCircle, Image, MessageSquareQuote, Settings, NavigationIcon, FileQuestion, Layers, Star } from "lucide-react"
import type { ReactNode } from "react"

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const { profile, isLoading, logout } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Admin access required.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/login")}>Admin Sign In</Button>
        </div>
      </div>
    )
  }

  const navItems = [
    { section: "Store" },
    { label: "Overview", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Orders", href: "/admin/orders", icon: <ShoppingCart className="h-4 w-4" /> },
    { label: "Products", href: "/admin/products", icon: <Package className="h-4 w-4" /> },
    { label: "Inventory", href: "/admin/inventory", icon: <Warehouse className="h-4 w-4" /> },
    { label: "Customers", href: "/admin/customers", icon: <Users className="h-4 w-4" /> },
    { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Promotions", href: "/admin/promotions", icon: <Tag className="h-4 w-4" /> },
    { section: "Accounting" },
    { label: "Chart of Accounts", href: "/admin/accounting", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Journal Entries", href: "/admin/accounting/journal-entries", icon: <FileText className="h-4 w-4" /> },
    { label: "Payments", href: "/admin/accounting/payments", icon: <CreditCard className="h-4 w-4" /> },
    { label: "General Ledger", href: "/admin/accounting/general-ledger", icon: <BookOpenCheck className="h-4 w-4" /> },
    { label: "Trial Balance", href: "/admin/accounting/trial-balance", icon: <Scale className="h-4 w-4" /> },
    { label: "Financial Reports", href: "/admin/accounting/reports", icon: <PieChart className="h-4 w-4" /> },
    { section: "Selling" },
    { label: "Sales Invoices", href: "/admin/selling/invoices", icon: <Receipt className="h-4 w-4" /> },
    { label: "Quotations", href: "/admin/selling/quotations", icon: <ClipboardList className="h-4 w-4" /> },
    { label: "CRM Customers", href: "/admin/selling/customers", icon: <Users className="h-4 w-4" /> },
    { label: "Pricing Rules", href: "/admin/selling/pricing-rules", icon: <DollarSign className="h-4 w-4" /> },
    { section: "Stock" },
    { label: "Stock Entries", href: "/admin/stock/entries", icon: <Boxes className="h-4 w-4" /> },
    { label: "Warehouses", href: "/admin/stock/warehouses", icon: <Warehouse className="h-4 w-4" /> },
    { label: "Stock Ledger", href: "/admin/stock/ledger", icon: <ArrowLeftRight className="h-4 w-4" /> },
    { label: "Stock Balance", href: "/admin/stock/balance", icon: <BarChart className="h-4 w-4" /> },
    { section: "Content Management" },
    { label: "Site Settings", href: "/admin/cms/settings", icon: <Settings className="h-4 w-4" /> },
    { label: "Hero Banners", href: "/admin/cms/banners", icon: <Image className="h-4 w-4" /> },
    { label: "Collections", href: "/admin/cms/collections", icon: <Layers className="h-4 w-4" /> },
    { label: "Testimonials", href: "/admin/cms/testimonials", icon: <MessageSquareQuote className="h-4 w-4" /> },
    { label: "Trust Badges", href: "/admin/cms/trust-badges", icon: <Star className="h-4 w-4" /> },
    { label: "Content Pages", href: "/admin/cms/pages", icon: <FileText className="h-4 w-4" /> },
    { label: "FAQ", href: "/admin/cms/faq", icon: <FileQuestion className="h-4 w-4" /> },
    { label: "Navigation", href: "/admin/cms/navigation", icon: <NavigationIcon className="h-4 w-4" /> },
    { section: "System" },
    { label: "Schema", href: "/admin/schema", icon: <Database className="h-4 w-4" /> },
    { label: "Help Center", href: "/admin/help", icon: <HelpCircle className="h-4 w-4" /> },
  ]

  return (
    <DashboardShell
      title="Admin Dashboard"
      navItems={navItems}
      headerRight={
        <Button variant="ghost" size="sm" onClick={async () => { await logout(); router.push("/admin/login") }}>
          <LogOut className="mr-1 h-4 w-4" /> Logout
        </Button>
      }
    >
      {children}
    </DashboardShell>
  )
}
