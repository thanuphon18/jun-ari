import { createHmac, timingSafeEqual } from "crypto"

/**
 * Verifies X-Beam-Signature per https://docs.beamcheckout.com/webhook/webhook
 * HMAC-SHA256 of the raw JSON body, using the base64-decoded webhook key from Lighthouse.
 */
export function verifyBeamWebhookSignature(
  rawBody: string,
  headerSignatureBase64: string | null,
  webhookKeyBase64: string
): boolean {
  if (!headerSignatureBase64?.trim()) return false
  let keyBytes: Buffer
  try {
    keyBytes = Buffer.from(webhookKeyBase64.trim(), "base64")
    if (keyBytes.length === 0) return false
  } catch {
    return false
  }

  const expected = createHmac("sha256", keyBytes).update(rawBody, "utf8").digest("base64")
  const received = headerSignatureBase64.trim()

  try {
    const a = Buffer.from(expected, "base64")
    const b = Buffer.from(received, "base64")
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
