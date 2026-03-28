"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"
import { Loader2 } from "lucide-react"
import type { ProductWithVariants, OrderWithItems } from "@/lib/types"

const tierThresholds = [
  { tier: "bronze", label: "Bronze", minSpend: 0, benefits: "Base distributor pricing" },
  { tier: "silver", label: "Silver", minSpend: 2000, benefits: "5% additional discount on all products" },
  { tier: "gold", label: "Gold", minSpend: 5000, benefits: "10% additional discount + priority stock allocation" },
  { tier: "platinum", label: "Platinum", minSpend: 10000, benefits: "15% additional discount + dedicated account manager" },
]

export default function TieredPricingPage() {
  const { user, distributorProfile } = useAuth()
  const supabase = createClient()
  const currentTier = distributorProfile?.tier ?? "bronze"

  const { data: orders } = useSWR<OrderWithItems[]>(
    user ? `dist-orders-spend-${user.id}` : null,
    async () => {
      const { data } = await supabase
        .from("orders")
        .select("total")
        .eq("user_id", user!.id)
      return (data ?? []) as OrderWithItems[]
    }
  )

  const { data: products, isLoading } = useSWR<ProductWithVariants[]>(
    "all-products-pricing",
    async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_variants(*)")
        .eq("is_active", true)
        .limit(6)
      return (data ?? []) as ProductWithVariants[]
    }
  )

  const totalSpend = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0)
  const currentTierIndex = tierThresholds.findIndex(t => t.tier === currentTier)
  const nextTier = tierThresholds[currentTierIndex + 1]
  const progressToNext = nextTier ? Math.min(100, (totalSpend / nextTier.minSpend) * 100) : 100
  const spendToNext = nextTier ? Math.max(0, nextTier.minSpend - totalSpend) : 0

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Tiered Pricing</h2>

      {/* Current Tier */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Tier</p>
              <p className="text-2xl font-bold text-foreground capitalize">{currentTier}</p>
            </div>
            <Badge className="bg-primary text-primary-foreground capitalize">{currentTier}</Badge>
          </div>
          {nextTier && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">${totalSpend.toFixed(0)} / ${nextTier.minSpend} spent</span>
                <span className="text-muted-foreground">${spendToNext.toFixed(0)} to next tier</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Benefits */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-sm">Tier Benefits</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Min Spend</TableHead>
                <TableHead>Benefits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tierThresholds.map(t => (
                <TableRow key={t.tier} className={t.tier === currentTier ? "bg-primary/5" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{t.label}</span>
                      {t.tier === currentTier && <Badge variant="outline" className="text-xs">Current</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">${t.minSpend.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{t.benefits}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Product Pricing */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Your Pricing (Selected Products)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead className="text-right">Your Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products ?? []).flatMap(p =>
                p.product_variants.map(v => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{v.name}</TableCell>
                    <TableCell className="text-right font-bold text-primary">${Number(v.price).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
