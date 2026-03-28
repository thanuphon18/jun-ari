import { getSiteSettings } from "@/lib/cms/queries"
import { ContactForm } from "@/components/storefront/contact-form"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export const metadata = {
  title: "Contact Us | Jun-Ari",
  description: "Get in touch with Jun-Ari. We are here to support you with purity.",
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  const email = settings.contact_email || "contact@jun-ari.com"
  const phone = settings.contact_phone || "+66 2 XXX XXXX"
  const address = settings.address || "Bangkok, Thailand"

  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Get in Touch</p>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light">
            Have a question or need help? We are here for you. Reach out and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-lg tracking-[0.15em] uppercase text-muted-foreground mb-6">Our Details</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground/60 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm tracking-[0.1em] uppercase text-muted-foreground mb-1">Email</p>
                  <a href={`mailto:${email}`} className="text-foreground hover:opacity-70 transition-opacity">
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground/60 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm tracking-[0.1em] uppercase text-muted-foreground mb-1">Phone</p>
                  <a href={`tel:${phone}`} className="text-foreground hover:opacity-70 transition-opacity">
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground/60 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm tracking-[0.1em] uppercase text-muted-foreground mb-1">Address</p>
                  <p className="text-foreground">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground/60 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm tracking-[0.1em] uppercase text-muted-foreground mb-1">Business Hours</p>
                  <p className="text-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-lg tracking-[0.15em] uppercase text-muted-foreground mb-6">Send a Message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
