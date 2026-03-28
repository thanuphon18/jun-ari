import { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jun-ari.com'

interface SEOProps {
  title: string
  titleTh?: string
  description: string
  descriptionTh?: string
  keywords?: string[]
  keywordsTh?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  locale?: 'en' | 'th'
  noIndex?: boolean
  product?: {
    price: number
    currency: string
    availability: 'in_stock' | 'out_of_stock' | 'preorder'
    brand: string
    category: string
  }
}

export function generateSEOMetadata({
  title,
  titleTh,
  description,
  descriptionTh,
  keywords = [],
  keywordsTh = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  locale = 'en',
  noIndex = false,
  product,
}: SEOProps): Metadata {
  const fullTitle = `${title} | Jun-Ari`
  const fullTitleTh = titleTh ? `${titleTh} | จุน-อารี` : fullTitle
  const ogImage = image || `${BASE_URL}/og-image.jpg`
  const pageUrl = url ? `${BASE_URL}${url}` : BASE_URL

  // Default keywords for wellness/health in both languages
  const defaultKeywords = [
    'Jun-Ari', 'จุน-อารี', 'wellness', 'สุขภาพ', 'health', 'natural products',
    'ผลิตภัณฑ์ธรรมชาติ', 'holistic', 'องค์รวม', 'Thailand', 'ประเทศไทย',
    'Bangkok', 'กรุงเทพ', 'pure ingredients', 'ส่วนผสมบริสุทธิ์'
  ]
  const allKeywords = [...defaultKeywords, ...keywords, ...keywordsTh]

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: author ? [{ name: author }] : [{ name: 'Jun-Ari Co., Ltd.' }],
    creator: 'Jun-Ari',
    publisher: 'Jun-Ari Co., Ltd.',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: pageUrl,
      languages: {
        'en': `${BASE_URL}/en${url || ''}`,
        'th': `${BASE_URL}/th${url || ''}`,
        'x-default': pageUrl,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: pageUrl,
      siteName: 'Jun-Ari',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'th' ? 'th_TH' : 'en_US',
      alternateLocale: locale === 'th' ? 'en_US' : 'th_TH',
      type: type === 'product' ? 'website' : type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@junari_th',
      site: '@junari_th',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      nocache: noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      // Add other verifications as needed
    },
    category: 'health',
    classification: 'Health & Wellness',
  }

  // Add article-specific metadata
  if (type === 'article' && (publishedTime || modifiedTime)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : ['Jun-Ari'],
    }
  }

  return metadata
}

// Generate JSON-LD structured data for Organization
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Jun-Ari',
    alternateName: ['จุน-อารี', 'Jun-Ari Co., Ltd.', 'บริษัท จุน-อารี จำกัด'],
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Premium wellness products from Earth\'s creation. Support You with Purity.',
    foundingDate: '2020',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bangkok',
      addressCountry: 'TH',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+66-2-XXX-XXXX',
      contactType: 'customer service',
      availableLanguage: ['English', 'Thai'],
    },
    sameAs: [
      'https://www.facebook.com/junari',
      'https://www.instagram.com/junari',
      'https://line.me/ti/p/@junari',
    ],
  }
}

// Generate JSON-LD structured data for Product
export function generateProductSchema(product: {
  name: string
  nameTh?: string
  description: string
  descriptionTh?: string
  image: string
  price: number
  compareAtPrice?: number
  currency?: string
  sku: string
  availability: boolean
  brand?: string
  category?: string
  rating?: number
  reviewCount?: number
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    alternateName: product.nameTh,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Jun-Ari',
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}${product.url}`,
      priceCurrency: product.currency || 'THB',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.availability 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Jun-Ari',
      },
    },
    ...(product.rating && product.reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }
}

// Generate JSON-LD structured data for BreadcrumbList
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  }
}

// Generate JSON-LD structured data for FAQPage
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Generate JSON-LD structured data for LocalBusiness
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: 'Jun-Ari',
    alternateName: 'จุน-อารี',
    image: `${BASE_URL}/storefront.jpg`,
    '@id': BASE_URL,
    url: BASE_URL,
    telephone: '+66-2-XXX-XXXX',
    priceRange: '฿฿',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: 'Bangkok',
      postalCode: '10110',
      addressCountry: 'TH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.7563,
      longitude: 100.5018,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    acceptsReservations: false,
    paymentAccepted: 'Cash, Credit Card, PromptPay, Bank Transfer',
    currenciesAccepted: 'THB',
  }
}

// Generate JSON-LD structured data for WebSite with SearchAction
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Jun-Ari',
    alternateName: 'จุน-อารี',
    url: BASE_URL,
    inLanguage: ['en', 'th'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
