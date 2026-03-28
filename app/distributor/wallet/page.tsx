"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"
import { toast } from "sonner"
import { Wallet, Gift, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import type { PointsLedgerEntry } from "@/lib/types"

const giftCatalog = [
  { name: "GreenLeaf Tote Bag", points: 200, image: "T" },
  { name: "Wellness Gift Box", points: 500, image: "W" },
  { name: "Premium Water Bottle", points: 300, image: "B" },
  { name: "Organic Tea Set", points: 400, image: "O" },
]

export default function WalletPage() {
  const { user, distributorProfile } = useAuth()
  const supabase = createClient()
  const [redeemAmount, setRedeemAmount] = useState([0])

  const totalPoints = distributorProfile?.total_points ?? 0

  const { data: history, isLoading } = useSWR<PointsLedgerEntry[]>(
    user ? `points-${user.id}` : null,
    async () => {
      const { data } = await supabase
        .from("points_ledger")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
      return (data ?? []) as PointsLedgerEntry[]
    }
  )

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Wallet & Points</h2>

      {/* Points Balance */}
      <Card className="mb-6 bg-primary text-primary-foreground">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20">
            <Wallet className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm opacity-80">Points Balance</p>
            <p className="text-4xl font-bold">{totalPoints.toLocaleString()}</p>
          </div>
          <div className="ml-auto">
            <p className="text-sm opacity-80">Wallet Balance</p>
            <p className="text-2xl font-bold">${Number(distributorProfile?.wallet_balance ?? 0).toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Redeem Points */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Redeem Points on Next Order</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Apply up to {Math.min(totalPoints, 500)} points as a discount ($1 per 10 points).
            </p>
            <Slider
              value={redeemAmount}
              onValueChange={setRedeemAmount}
              max={Math.min(totalPoints, 500)}
              step={10}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{redeemAmount[0]} points</span>
              <span className="font-medium text-foreground">-${(redeemAmount[0] / 10).toFixed(2)} off</span>
            </div>
            <Button
              onClick={() => toast.success(`${redeemAmount[0]} points will be applied to your next order`)}
              disabled={redeemAmount[0] === 0}
            >
              Apply to Next Order
            </Button>
          </CardContent>
        </Card>

        {/* Gift Catalog */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Gift className="h-4 w-4" /> Points Catalog</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {giftCatalog.map(gift => (
                <div key={gift.name} className="flex flex-col items-center gap-2 rounded-lg border p-3 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    {gift.image}
                  </div>
                  <p className="text-xs font-medium text-foreground">{gift.name}</p>
                  <Badge variant="secondary" className="text-xs">{gift.points} pts</Badge>
                  <Button
                    size="sm" variant="outline" className="h-7 text-xs w-full"
                    disabled={totalPoints < gift.points}
                    onClick={() => toast.success(`Redeemed ${gift.name}!`)}
                  >
                    Redeem
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-sm">Points History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history ?? []).map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-foreground">{entry.description || entry.type}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{entry.type}</Badge></TableCell>
                    <TableCell className="text-right">
                      <span className={`flex items-center justify-end gap-1 font-medium ${entry.points > 0 ? "text-primary" : "text-destructive"}`}>
                        {entry.points > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {entry.points > 0 ? "+" : ""}{entry.points}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
