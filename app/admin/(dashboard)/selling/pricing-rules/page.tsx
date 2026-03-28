import { getPricingRules } from "@/lib/erp/queries"
import { PricingRulesClient } from "@/components/erp/pricing-rules-client"

export default async function PricingRulesPage() {
  const rules = await getPricingRules()
  return <PricingRulesClient rules={rules} />
}
