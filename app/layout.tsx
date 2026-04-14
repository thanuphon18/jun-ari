import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter, Sarabun } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { Toaster } from 'sonner'
import { JsonLd } from '@/components/seo/json-ld'
import { generateOrganizationSchema, generateWebsiteSchema, generateLocalBusinessSchema } from '@/lib/seo'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant" 
})

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
})

// Thai font for bilingual support
const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun"
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jun-ari.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Jun-Ari | Support You with Purity - Premium Wellness Products',
    template: '%s | Jun-Ari',
  },
  description: 'Premium wellness products from Earth\'s creation. Jun-Ari (จุน-อารี) provides pure, natural health and wellness solutions in Thailand. Free shipping on orders over ฿2,000.',
  keywords: [
    // English keywords
    'Jun-Ari', 'wellness products', 'health supplements', 'natural products', 
    'holistic health', 'pure ingredients', 'Thailand wellness', 'Bangkok health store',
    'organic supplements', 'natural wellness', 'health and beauty', 'self care products',
    // Thai keywords
    'จุน-อารี', 'ผลิตภัณฑ์สุขภาพ', 'อาหารเสริม', 'ผลิตภัณฑ์ธรรมชาติ',
    'สุขภาพองค์รวม', 'ส่วนผสมบริสุทธิ์', 'สุขภาพดี', 'ร้านสุขภาพกรุงเทพ',
    'อาหารเสริมออร์แกนิค', 'สุขภาพธรรมชาติ', 'ความงามและสุขภาพ', 'ดูแลตัวเอง',
  ],
  authors: [{ name: 'Jun-Ari Co., Ltd.', url: BASE_URL }],
  creator: 'Jun-Ari',
  publisher: 'Jun-Ari Co., Ltd.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'th_TH',
    url: BASE_URL,
    siteName: 'Jun-Ari',
    title: 'Jun-Ari | Support You with Purity',
    description: 'Premium wellness products from Earth\'s creation. Pure, natural health and wellness solutions.',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Jun-Ari - Support You with Purity',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jun-Ari | Support You with Purity',
    description: 'Premium wellness products from Earth\'s creation.',
    images: [`${BASE_URL}/og-image.jpg`],
    creator: '@junari_th',
    site: '@junari_th',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en': `${BASE_URL}/en`,
      'th': `${BASE_URL}/th`,
      'x-default': BASE_URL,
    },
  },
  category: 'health',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f6f3' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* JSON-LD Structured Data */}
        <JsonLd data={generateOrganizationSchema()} />
        <JsonLd data={generateWebsiteSchema()} />
        <JsonLd data={generateLocalBusinessSchema()} />
      </head>
      <body className={`${cormorant.variable} ${inter.variable} ${sarabun.variable} font-serif antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
