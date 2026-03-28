"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, ArrowRight } from "lucide-react"

const tables = [
  {
    name: "profiles",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "email", type: "TEXT" },
      { name: "full_name", type: "TEXT" },
      { name: "role", type: "TEXT", desc: "customer | distributor | admin" },
      { name: "phone", type: "TEXT" },
      { name: "avatar_url", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
    relations: [],
  },
  {
    name: "distributor_profiles",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "UUID", fk: "profiles.id" },
      { name: "company_name", type: "TEXT" },
      { name: "tier", type: "TEXT", desc: "bronze | silver | gold | platinum" },
      { name: "credit_limit", type: "NUMERIC" },
      { name: "wallet_balance", type: "NUMERIC" },
      { name: "total_points", type: "INT" },
      { name: "tax_id", type: "TEXT" },
    ],
    relations: ["profiles"],
  },
  {
    name: "products",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "name", type: "TEXT" },
      { name: "slug", type: "TEXT" },
      { name: "description", type: "TEXT" },
      { name: "category", type: "TEXT" },
      { name: "image_url", type: "TEXT" },
      { name: "base_price", type: "NUMERIC" },
      { name: "is_active", type: "BOOLEAN" },
      { name: "tags", type: "TEXT[]" },
    ],
    relations: [],
  },
  {
    name: "product_variants",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "product_id", type: "UUID", fk: "products.id" },
      { name: "sku", type: "TEXT" },
      { name: "name", type: "TEXT" },
      { name: "price", type: "NUMERIC" },
      { name: "cost", type: "NUMERIC" },
      { name: "weight_grams", type: "INT" },
      { name: "attributes", type: "JSONB" },
      { name: "is_active", type: "BOOLEAN" },
    ],
    relations: ["products"],
  },
  {
    name: "inventory",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "variant_id", type: "UUID", fk: "product_variants.id" },
      { name: "warehouse", type: "TEXT" },
      { name: "qty_on_hand", type: "INT" },
      { name: "qty_reserved", type: "INT" },
      { name: "reorder_level", type: "INT" },
      { name: "reorder_qty", type: "INT" },
    ],
    relations: ["product_variants"],
  },
  {
    name: "orders",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "order_number", type: "TEXT" },
      { name: "user_id", type: "UUID", fk: "profiles.id" },
      { name: "channel", type: "TEXT", desc: "b2c | b2b" },
      { name: "status", type: "TEXT", desc: "pending | confirmed | processing | shipped | delivered | cancelled | returned" },
      { name: "payment_status", type: "TEXT" },
      { name: "subtotal", type: "NUMERIC" },
      { name: "discount_amount", type: "NUMERIC" },
      { name: "tax_amount", type: "NUMERIC" },
      { name: "shipping_amount", type: "NUMERIC" },
      { name: "total", type: "NUMERIC" },
      { name: "shipping_address", type: "JSONB" },
      { name: "po_number", type: "TEXT" },
    ],
    relations: ["profiles"],
  },
  {
    name: "order_items",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "order_id", type: "UUID", fk: "orders.id" },
      { name: "variant_id", type: "UUID", fk: "product_variants.id" },
      { name: "product_name", type: "TEXT" },
      { name: "variant_name", type: "TEXT" },
      { name: "sku", type: "TEXT" },
      { name: "quantity", type: "INT" },
      { name: "unit_price", type: "NUMERIC" },
      { name: "total_price", type: "NUMERIC" },
    ],
    relations: ["orders", "product_variants"],
  },
  {
    name: "points_ledger",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "UUID", fk: "profiles.id" },
      { name: "order_id", type: "UUID", fk: "orders.id" },
      { name: "points", type: "INT" },
      { name: "type", type: "TEXT", desc: "earned | redeemed | adjusted | expired" },
      { name: "description", type: "TEXT" },
    ],
    relations: ["profiles", "orders"],
  },
  {
    name: "discount_codes",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "code", type: "TEXT" },
      { name: "discount_type", type: "TEXT", desc: "percentage | fixed" },
      { name: "discount_value", type: "NUMERIC" },
      { name: "min_order_amount", type: "NUMERIC" },
      { name: "max_uses", type: "INT" },
      { name: "current_uses", type: "INT" },
      { name: "is_active", type: "BOOLEAN" },
      { name: "valid_until", type: "TIMESTAMPTZ" },
    ],
    relations: [],
  },
  {
    name: "stock_adjustments",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "variant_id", type: "UUID", fk: "product_variants.id" },
      { name: "adjusted_by", type: "UUID", fk: "profiles.id" },
      { name: "previous_qty", type: "INT" },
      { name: "new_qty", type: "INT" },
      { name: "reason", type: "TEXT" },
    ],
    relations: ["product_variants", "profiles"],
  },
]

export default function AdminSchemaPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Database className="h-5 w-5 text-primary" /> Database Schema Reference
        </h2>
        <p className="text-sm text-muted-foreground">Live Supabase schema - read-only reference</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {tables.map(table => (
          <Card key={table.name}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-primary">{table.name}</code>
                {table.relations.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3" />
                    {table.relations.map(r => (
                      <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>
                    ))}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-lg border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">Column</th>
                      <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">Type</th>
                      <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map(col => (
                      <tr key={col.name} className="border-b last:border-0">
                        <td className="px-3 py-1.5 font-mono text-foreground">
                          {col.name}
                          {"desc" in col && col.desc && <span className="ml-1 text-muted-foreground">({col.desc})</span>}
                        </td>
                        <td className="px-3 py-1.5 text-muted-foreground">{col.type}</td>
                        <td className="px-3 py-1.5">
                          {"pk" in col && col.pk && <Badge className="text-[10px]">PK</Badge>}
                          {"fk" in col && col.fk && (
                            <Badge variant="outline" className="text-[10px]">{`FK: ${col.fk}`}</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
