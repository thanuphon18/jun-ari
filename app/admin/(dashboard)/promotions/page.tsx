import { getAllDiscountCodes } from "@/lib/queries"
import { AdminPromotionsClient } from "@/components/admin/promotions-client"

export default async function AdminPromotionsPage() {
  const discountCodes = await getAllDiscountCodes()
  return <AdminPromotionsClient discountCodes={discountCodes} />
}
