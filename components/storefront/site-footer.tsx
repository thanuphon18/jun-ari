import Link from "next/link"
import { Facebook, Instagram, MessageCircle } from "lucide-react"
import type { NavMenuItem } from "@/lib/cms/types"

interface SiteFooterProps {
  navItems: NavMenuItem[]
  settings: Record<string, string>
}

export function SiteFooter({ navItems, settings }: SiteFooterProps) {
  const companyName = settings.company_name || "Jun-Ari Co., Ltd."
  const tagline = settings.tagline || "Support You with Purity"
  const email = settings.contact_email || "contact@jun-ari.com"
  const phone = settings.contact_phone || "+66 2 123 4567"
  const address = settings.address || ""
  const facebookUrl = settings.facebook_url
  const instagramUrl = settings.instagram_url
  const lineId = settings.line_id

  const footerLinks = {
    shop: [
      { en: "All Products", th: "สินค้าทั้งหมด", href: "/shop" },
      { en: "New Arrivals", th: "สินค้าใหม่", href: "/shop?sort=newest" },
      { en: "Best Sellers", th: "สินค้าขายดี", href: "/shop?sort=popular" },
      { en: "Subscribe & Save", th: "สมัครสมาชิก", href: "/subscribe" },
    ],
    support: [
      { en: "About Us", th: "เกี่ยวกับเรา", href: "/about" },
      { en: "FAQ", th: "คำถามที่พบบ่อย", href: "/faq" },
      { en: "Shipping", th: "การจัดส่ง", href: "/shipping" },
      { en: "Track Order", th: "ติดตามพัสดุ", href: "/track" },
      { en: "Contact", th: "ติดต่อเรา", href: "/contact" },
    ],
  }

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl md:text-3xl font-serif tracking-wide text-background">
                jun-ari
              </span>
            </Link>
            <p className="text-background/70 text-sm mb-1 font-light tracking-wide">{tagline}</p>
            <p className="text-background/50 text-sm mb-1 font-sans">สนับสนุนคุณด้วยความบริสุทธิ์</p>
            <p className="text-background/40 text-xs mb-8 font-sans mt-4">บริษัท จุน-อารี จำกัด</p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full border border-background/20 flex items-center justify-center hover:border-background/40 hover:bg-background/10 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full border border-background/20 flex items-center justify-center hover:border-background/40 hover:bg-background/10 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {lineId && (
                <a
                  href={`https://line.me/ti/p/${lineId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full border border-background/20 flex items-center justify-center hover:border-background/40 hover:bg-background/10 transition-all"
                  aria-label="LINE"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-background/50">
              Shop | สินค้า
            </h4>
            <ul className="space-y-4">
              {footerLinks.shop.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-background/60 hover:text-background transition-colors font-light block"
                  >
                    {item.en}
                    <span className="text-background/40 font-sans text-xs ml-2">{item.th}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-background/50">
              Support | ช่วยเหลือ
            </h4>
            <ul className="space-y-4">
              {footerLinks.support.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-background/60 hover:text-background transition-colors font-light block"
                  >
                    {item.en}
                    <span className="text-background/40 font-sans text-xs ml-2">{item.th}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-background/50">
              Contact | ติดต่อ
            </h4>
            <ul className="space-y-4 text-sm text-background/60 font-light">
              <li>
                <a href={`mailto:${email}`} className="hover:text-background transition-colors">
                  {email}
                </a>
              </li>
              <li>
                <a href={`tel:${phone}`} className="hover:text-background transition-colors">
                  {phone}
                </a>
              </li>
              {address && <li className="leading-relaxed">{address}</li>}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/40 font-light">
            © {new Date().getFullYear()} {companyName}. All rights reserved. | สงวนลิขสิทธิ์
          </p>
          <div className="flex gap-8 text-xs text-background/40">
            <Link href="/privacy" className="hover:text-background transition-colors font-light">
              Privacy | ความเป็นส่วนตัว
            </Link>
            <Link href="/terms" className="hover:text-background transition-colors font-light">
              Terms | ข้อกำหนด
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
