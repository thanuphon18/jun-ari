import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Percent, Truck, Calendar, CheckCircle, Clock, Gift } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Subscribe & Save | Jun-Ari",
  description: "Save up to 15% on your favorite Jun-Ari products with our subscription program. Free shipping, flexible delivery, cancel anytime.",
}

const benefits = [
  {
    icon: Percent,
    title: "Save 15%",
    description: "Get 15% off every subscription order, automatically applied at checkout.",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Enjoy free shipping on all subscription orders, no minimum required.",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description: "Choose delivery every 30, 60, or 90 days. Adjust anytime.",
  },
  {
    icon: RefreshCw,
    title: "Easy Management",
    description: "Skip, pause, or cancel your subscription at any time with no fees.",
  },
]

const howItWorks = [
  {
    step: "1",
    title: "Choose Your Products",
    description: "Select from our range of wellness essentials and choose 'Subscribe & Save' at checkout.",
  },
  {
    step: "2",
    title: "Set Your Schedule",
    description: "Pick how often you want your products delivered - every 30, 60, or 90 days.",
  },
  {
    step: "3",
    title: "Save & Enjoy",
    description: "Your products arrive on schedule with 15% savings. Manage or cancel anytime.",
  },
]

export default function SubscribePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-stone-100 to-background py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10">
              <RefreshCw className="h-12 w-12 text-primary" />
            </div>
          </div>
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-4">
            Never Run Out
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
            Subscribe & Save
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Get your favorite wellness essentials delivered automatically and save 15% 
            on every order. Free shipping, flexible scheduling, and the freedom to 
            cancel anytime.
          </p>
          <Button size="lg" className="font-medium" asChild>
            <Link href="/shop">Start Subscribing</Link>
          </Button>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-3">
              Why Subscribe
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">
              Subscription Benefits
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-3">
              Getting Started
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-serif text-primary">{item.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Perks */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-3">
                  Full Control
                </p>
                <h2 className="text-3xl font-serif text-foreground mb-6">
                  Manage Your Way
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Skip a delivery</span>
                      <p className="text-sm text-muted-foreground">Going on holiday? Skip your next order with one click.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Change frequency</span>
                      <p className="text-sm text-muted-foreground">Adjust how often you receive deliveries anytime.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Gift className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Add or swap products</span>
                      <p className="text-sm text-muted-foreground">Try new products or change your selection easily.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <RefreshCw className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Cancel anytime</span>
                      <p className="text-sm text-muted-foreground">No commitments, no fees. Cancel whenever you want.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-stone-100 rounded-2xl p-8 text-center">
                <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase mb-2">Save Up To</p>
                <p className="text-6xl font-serif text-primary mb-2">15%</p>
                <p className="text-muted-foreground mb-6">on every subscription order</p>
                <Button className="w-full" asChild>
                  <Link href="/shop">Browse Products</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif text-foreground mb-4">
            Have Questions?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Learn more about how our subscription program works and find answers to common questions.
          </p>
          <Button variant="outline" asChild>
            <Link href="/faq">View FAQ</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
