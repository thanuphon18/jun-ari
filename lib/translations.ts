// Bilingual translations for Jun-Ari (Thai/English)

export const translations = {
  // Navigation
  nav: {
    shop: { en: "Shop", th: "สินค้า" },
    learn: { en: "Learn", th: "เรียนรู้" },
    loyalty: { en: "Loyalty Program", th: "โปรแกรมสมาชิก" },
    subscribe: { en: "Subscribe & Save", th: "สมัครสมาชิก" },
    cart: { en: "Cart", th: "ตะกร้า" },
    account: { en: "Account", th: "บัญชี" },
    signIn: { en: "Sign In", th: "เข้าสู่ระบบ" },
    signOut: { en: "Sign Out", th: "ออกจากระบบ" },
  },

  // Product
  product: {
    addToCart: { en: "Add to Cart", th: "เพิ่มลงตะกร้า" },
    outOfStock: { en: "Out of Stock", th: "สินค้าหมด" },
    inStock: { en: "In Stock", th: "มีสินค้า" },
    quantity: { en: "Quantity", th: "จำนวน" },
    price: { en: "Price", th: "ราคา" },
    total: { en: "Total", th: "รวม" },
    description: { en: "Description", th: "รายละเอียด" },
    ingredients: { en: "Ingredients", th: "ส่วนประกอบ" },
    howToUse: { en: "How to Use", th: "วิธีใช้" },
    benefits: { en: "Benefits", th: "ประโยชน์" },
  },

  // Cart & Checkout
  cart: {
    yourCart: { en: "Your Cart", th: "ตะกร้าของคุณ" },
    emptyCart: { en: "Your cart is empty", th: "ตะกร้าของคุณว่างเปล่า" },
    continueShopping: { en: "Continue Shopping", th: "เลือกซื้อสินค้าต่อ" },
    checkout: { en: "Checkout", th: "ชำระเงิน" },
    subtotal: { en: "Subtotal", th: "ยอดรวมสินค้า" },
    shipping: { en: "Shipping", th: "ค่าจัดส่ง" },
    freeShipping: { en: "Free Shipping", th: "จัดส่งฟรี" },
    orderTotal: { en: "Order Total", th: "ยอดรวมทั้งหมด" },
    remove: { en: "Remove", th: "ลบ" },
  },

  // Shipping
  shipping: {
    selectMethod: { en: "Select Shipping Method", th: "เลือกวิธีการจัดส่ง" },
    estimatedDelivery: { en: "Estimated Delivery", th: "ระยะเวลาจัดส่ง" },
    trackOrder: { en: "Track Order", th: "ติดตามพัสดุ" },
    trackingNumber: { en: "Tracking Number", th: "หมายเลขติดตาม" },
  },

  // Common
  common: {
    loading: { en: "Loading...", th: "กำลังโหลด..." },
    error: { en: "Error", th: "เกิดข้อผิดพลาด" },
    success: { en: "Success", th: "สำเร็จ" },
    save: { en: "Save", th: "บันทึก" },
    cancel: { en: "Cancel", th: "ยกเลิก" },
    edit: { en: "Edit", th: "แก้ไข" },
    delete: { en: "Delete", th: "ลบ" },
    search: { en: "Search", th: "ค้นหา" },
    filter: { en: "Filter", th: "ตัวกรอง" },
    sortBy: { en: "Sort By", th: "เรียงตาม" },
    all: { en: "All", th: "ทั้งหมด" },
    viewAll: { en: "View All", th: "ดูทั้งหมด" },
    readMore: { en: "Read More", th: "อ่านเพิ่มเติม" },
    learnMore: { en: "Learn More", th: "เรียนรู้เพิ่มเติม" },
    shopNow: { en: "Shop Now", th: "ช้อปเลย" },
  },

  // Homepage sections
  home: {
    bestsellers: { en: "Bestsellers", th: "สินค้าขายดี" },
    newArrivals: { en: "New Arrivals", th: "สินค้าใหม่" },
    featuredProducts: { en: "Featured Products", th: "สินค้าแนะนำ" },
    shopByCategory: { en: "Shop by Category", th: "เลือกซื้อตามหมวดหมู่" },
    customerReviews: { en: "Customer Reviews", th: "รีวิวจากลูกค้า" },
    newsletter: { en: "Stay Updated", th: "รับข่าวสาร" },
    newsletterDesc: { 
      en: "Subscribe to receive updates, access to exclusive deals, and more.", 
      th: "สมัครรับข่าวสาร โปรโมชั่น และสิทธิพิเศษก่อนใคร" 
    },
    emailPlaceholder: { en: "Enter your email", th: "กรอกอีเมลของคุณ" },
    subscribe: { en: "Subscribe", th: "สมัครรับข่าวสาร" },
  },

  // Brand difference section
  brand: {
    title: { en: "The Jun-Ari Difference", th: "ความแตกต่างของ จุน-อารี" },
    pureIngredients: { en: "Pure Ingredients", th: "ส่วนผสมบริสุทธิ์" },
    pureIngredientsDesc: { 
      en: "Sourced from nature's finest, every ingredient meets our strict purity standards.", 
      th: "คัดสรรจากธรรมชาติ ทุกส่วนผสมผ่านมาตรฐานความบริสุทธิ์" 
    },
    scientificApproach: { en: "Scientific Approach", th: "หลักการทางวิทยาศาสตร์" },
    scientificApproachDesc: { 
      en: "Backed by research and formulated for optimal bioavailability.", 
      th: "ผ่านการวิจัย พัฒนาสูตรเพื่อการดูดซึมสูงสุด" 
    },
    sustainable: { en: "Sustainable Sourcing", th: "การจัดหาอย่างยั่งยืน" },
    sustainableDesc: { 
      en: "Committed to ethical practices and environmental responsibility.", 
      th: "มุ่งมั่นในหลักจริยธรรมและความรับผิดชอบต่อสิ่งแวดล้อม" 
    },
    holisticWellness: { en: "Holistic Wellness", th: "สุขภาพองค์รวม" },
    holisticWellnessDesc: { 
      en: "Supporting your complete wellbeing journey, body and mind.", 
      th: "สนับสนุนสุขภาพครบวงจร ทั้งกายและใจ" 
    },
  },

  // Footer
  footer: {
    tagline: { en: "Support You with Purity", th: "สนับสนุนคุณด้วยความบริสุทธิ์" },
    companyName: { en: "Jun-Ari Co., Ltd.", th: "บริษัท จุน-อารี จำกัด" },
    quickLinks: { en: "Quick Links", th: "ลิงก์ด่วน" },
    customerService: { en: "Customer Service", th: "บริการลูกค้า" },
    followUs: { en: "Follow Us", th: "ติดตามเรา" },
    contact: { en: "Contact", th: "ติดต่อเรา" },
    about: { en: "About Us", th: "เกี่ยวกับเรา" },
    faq: { en: "FAQ", th: "คำถามที่พบบ่อย" },
    shipping: { en: "Shipping & Returns", th: "การจัดส่งและคืนสินค้า" },
    privacy: { en: "Privacy Policy", th: "นโยบายความเป็นส่วนตัว" },
    terms: { en: "Terms & Conditions", th: "ข้อกำหนดและเงื่อนไข" },
    allRightsReserved: { en: "All rights reserved", th: "สงวนลิขสิทธิ์" },
  },

  // Order status
  orderStatus: {
    pending: { en: "Pending", th: "รอดำเนินการ" },
    confirmed: { en: "Confirmed", th: "ยืนยันแล้ว" },
    processing: { en: "Processing", th: "กำลังเตรียมสินค้า" },
    shipped: { en: "Shipped", th: "จัดส่งแล้ว" },
    delivered: { en: "Delivered", th: "ส่งถึงแล้ว" },
    cancelled: { en: "Cancelled", th: "ยกเลิก" },
  },

  // Trust badges
  trustBadges: {
    purity: { en: "100% Pure", th: "บริสุทธิ์ 100%" },
    natural: { en: "All Natural", th: "ธรรมชาติ 100%" },
    tested: { en: "Lab Tested", th: "ผ่านการทดสอบ" },
    freeShipping: { en: "Free Shipping over ฿2,000", th: "ส่งฟรีเมื่อซื้อครบ 2,000 บาท" },
    fastDelivery: { en: "Fast Delivery", th: "จัดส่งรวดเร็ว" },
    securePayment: { en: "Secure Payment", th: "ชำระเงินปลอดภัย" },
  },
} as const

// Helper function to get bilingual text
export function t(
  key: string, 
  section: keyof typeof translations
): { en: string; th: string } {
  const sectionData = translations[section] as Record<string, { en: string; th: string }>
  return sectionData[key] || { en: key, th: key }
}

// Helper to get text in specific language
export function getText(
  text: { en: string; th: string }, 
  lang: 'en' | 'th' = 'en'
): string {
  return text[lang]
}

// Bilingual text component helper - returns both languages
export function bilingual(text: { en: string; th: string }): string {
  return `${text.en} | ${text.th}`
}

// Format currency in Thai Baht
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format price with both English and Thai
export function formatPriceBilingual(amount: number): string {
  const formatted = formatPrice(amount)
  return formatted
}
