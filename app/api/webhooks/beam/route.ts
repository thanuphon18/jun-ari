import { NextRequest, NextResponse } from "next/server"
import { verifyBeamWebhookSignature } from "@/lib/beam/webhook-verify"
import {
  persistBeamPaidPaymentLink,
  type BeamPaymentLinkWebhookPayload,
} from "@/lib/beam/payment-link-webhook"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const beamEvent = request.headers.get("x-beam-event")
  const beamSignature = request.headers.get("x-beam-signature")

  const webhookSecret = process.env.BEAM_WEBHOOK_SECRET?.trim()

  if (webhookSecret) {
    if (!verifyBeamWebhookSignature(rawBody, beamSignature, webhookSecret)) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 })
    }
  }

  const webhookToken = process.env.BEAM_WEBHOOK_TOKEN
  const headerToken = request.headers.get("x-webhook-token")
  if (webhookToken && headerToken !== webhookToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized webhook" }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  switch (beamEvent) {
    case "payment_link.paid": {
      const body = payload as BeamPaymentLinkWebhookPayload
      const supabase = await createClient()
      const result = await persistBeamPaidPaymentLink(supabase, body)
      if (!result.ok) {
        console.error("[beam-webhook] payment_link.paid:", result.message)
      }
      break
    }

    default:
      if (beamEvent) {
        console.log("[beam-webhook] unhandled event:", beamEvent)
      }
  }
  return NextResponse.json({ ok: true })
}
