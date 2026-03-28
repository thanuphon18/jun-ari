import { Leaf, Truck, FlaskConical, ShieldCheck, Award, Heart, Star, Shield, Sparkles } from "lucide-react"
import type { TrustBadge } from "@/lib/cms/types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf,
  Truck,
  FlaskConical,
  ShieldCheck,
  Award,
  Heart,
  Star,
  Shield,
  Sparkles,
}

interface TrustBadgesBarProps {
  badges: TrustBadge[]
}

export function TrustBadgesBar({ badges }: TrustBadgesBarProps) {
  if (badges.length === 0) return null

  return (
    <section className="border-y border-border/30 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge) => {
            const Icon = iconMap[badge.icon_name] || Sparkles
            return (
              <div key={badge.id} className="flex flex-col items-center text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center">
                  <Icon className="h-6 w-6 text-foreground/60" />
                </div>
                <div>
                  <p className="text-xs tracking-[0.15em] uppercase font-medium text-foreground">{badge.title}</p>
                  {badge.description && (
                    <p className="text-xs text-muted-foreground mt-1 font-light">{badge.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
