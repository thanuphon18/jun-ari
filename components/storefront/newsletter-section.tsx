"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))
    setIsLoading(false)
    setEmail("")
    toast.success("Thank you for subscribing! | ขอบคุณที่สมัครรับข่าวสาร")
  }

  return (
    <section className="py-20 md:py-28 px-4 bg-secondary">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Stay Connected | เชื่อมต่อกับเรา
        </p>
        <h2 className="text-3xl md:text-4xl font-light mb-2">Join Our Community</h2>
        <p className="text-lg text-primary/80 font-sans mb-4">เข้าร่วมชุมชนของเรา</p>
        <p className="text-muted-foreground mb-10 font-light">
          Subscribe for exclusive wellness insights, new arrivals, and special offerings.
        </p>
        <p className="text-muted-foreground/80 text-sm mb-10 font-sans -mt-8">
          สมัครรับข้อมูลสุขภาพ สินค้าใหม่ และข้อเสนอพิเศษ
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Your email | อีเมลของคุณ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border-border/50 focus-visible:ring-primary/20 text-center sm:text-left"
            required
          />
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="shrink-0 tracking-widest uppercase text-xs px-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? "..." : "Subscribe | สมัคร"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-6">
          We respect your privacy. Unsubscribe anytime.
        </p>
        <p className="text-xs text-muted-foreground/70 font-sans">
          เราเคารพความเป็นส่วนตัวของคุณ ยกเลิกได้ทุกเมื่อ
        </p>
      </div>
    </section>
  )
}
