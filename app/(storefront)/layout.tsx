import { AnnouncementBar, SiteHeader, SiteFooter } from "@/components/storefront"
import {
  getAnnouncementText,
  getNavMenuItems,
  getSiteSettings,
} from "@/lib/cms/queries"

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [announcement, headerNav, footerNav, settings] = await Promise.all([
    getAnnouncementText(),
    getNavMenuItems("header"),
    getNavMenuItems("footer"),
    getSiteSettings(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar text={announcement} />
      <SiteHeader navItems={headerNav} />
      <main className="flex-1">{children}</main>
      <SiteFooter navItems={footerNav} settings={settings} />
    </div>
  )
}
