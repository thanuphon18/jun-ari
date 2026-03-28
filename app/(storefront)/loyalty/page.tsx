import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, Star, Crown, Sparkles, CheckCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Loyalty Program | Jun-Ari",
  description: "Join the Jun-Ari Rewards program and earn points on every purchase. Exclusive benefits, early access, and special discounts.",
}

const tiers = [
  {
    name: "Member",
    icon: Star,
    points: "0 - 499",
    color: "bg-stone-100",
    benefits: [
      "Earn 1 point per ฿10 spent",
      "Birthday reward",
      "Exclusive member pricing",
      "Early access to sales",
    ],
  },
  {
    name: "Silver",
    icon: Sparkles,
    points: "500 - 1,499",
    color: "bg-stone-200",
    benefits: [
      "Earn 1.5 points per ฿10 spent",
      "Free shipping on all orders",
      "Exclusive Silver-only products",
      "Priority customer support",
    ],
  },
  {
    name: "Gold",
    icon: Crown,
    points: "1,500+",
    color: "bg-amber-100",
    benefits: [
      "Earn 2 points per ฿10 spent",
      "Free express shipping",
      "Early access to new products",
      "Exclusive Gold events & gifts",
    ],
  },
]

export default function LoyaltyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-stone-100 to-background py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10">
              <Gift className="h-12 w-12 text-primary" />
            </div>
          </div>
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-4">
            Rewards Program
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
            Jun-Ari Rewards
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our loyalty program and be rewarded for your wellness journey. 
            Earn points on every purchase, unlock exclusive benefits, and enjoy 
            special perks as you grow with us.
          </p>
          <Button size="lg" className="font-medium">
            Join Now - It&apos;s Free
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-3">
              Simple & Rewarding
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-serif text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-muted-foreground text-sm">
                Create your free account and automatically join our rewards program.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-serif text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Earn Points</h3>
              <p className="text-muted-foreground text-sm">
                Earn points on every purchase. The more you shop, the more you earn.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-serif text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Redeem Rewards</h3>
              <p className="text-muted-foreground text-sm">
                Use your points for discounts, free products, and exclusive perks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-3">
              Membership Tiers
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">
              Unlock More Benefits
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <Card key={tier.name} className="border-0 shadow-sm overflow-hidden">
                <div className={`${tier.color} p-6 text-center`}>
                  <tier.icon className="h-10 w-10 mx-auto mb-3 text-foreground/80" />
                  <h3 className="text-xl font-serif">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tier.points} points</p>
                </div>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
            Start Earning Today
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Join thousands of members who are already enjoying exclusive rewards and benefits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop">Shop Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
