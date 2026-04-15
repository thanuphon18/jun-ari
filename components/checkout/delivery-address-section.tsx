"use client"

import { useCart } from "@/lib/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DeliveryAddressSection() {
  const { deliveryAddress, updateDeliveryAddress } = useCart()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Delivery address</CardTitle>
        <p className="text-sm text-muted-foreground">
          Where should we ship your order? Complete this section before paying.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="delivery-full-name">Full name</Label>
            <Input
              id="delivery-full-name"
              autoComplete="name"
              value={deliveryAddress.full_name}
              onChange={(e) => updateDeliveryAddress({ full_name: e.target.value })}
              placeholder="Recipient name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-phone">Phone</Label>
            <Input
              id="delivery-phone"
              type="tel"
              autoComplete="tel"
              value={deliveryAddress.phone}
              onChange={(e) => updateDeliveryAddress({ phone: e.target.value })}
              placeholder="08xxxxxxxx"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-postal">Postal code</Label>
            <Input
              id="delivery-postal"
              autoComplete="postal-code"
              value={deliveryAddress.postal_code}
              onChange={(e) => updateDeliveryAddress({ postal_code: e.target.value })}
              placeholder="10110"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="delivery-address">Street address</Label>
            <Input
              id="delivery-address"
              autoComplete="street-address"
              value={deliveryAddress.address}
              onChange={(e) => updateDeliveryAddress({ address: e.target.value })}
              placeholder="House / building, street, soi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-district">District / Khet</Label>
            <Input
              id="delivery-district"
              value={deliveryAddress.district}
              onChange={(e) => updateDeliveryAddress({ district: e.target.value })}
              placeholder="Watthana"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-province">Province</Label>
            <Input
              id="delivery-province"
              autoComplete="address-level1"
              value={deliveryAddress.province}
              onChange={(e) => updateDeliveryAddress({ province: e.target.value })}
              placeholder="Bangkok"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="delivery-country">Country</Label>
            <Input
              id="delivery-country"
              autoComplete="country-name"
              value={deliveryAddress.country}
              onChange={(e) => updateDeliveryAddress({ country: e.target.value })}
              placeholder="Thailand"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
