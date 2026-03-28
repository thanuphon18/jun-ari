import { createBrowserClient } from '@supabase/ssr'
import { processLock } from '@supabase/auth-js'

/**
 * Browser Supabase client.
 *
 * Use in-process `processLock` instead of the default Web Locks API (`navigatorLock`).
 * That avoids noisy `AbortError: Lock broken by another request with the 'steal' option`
 * in dev (e.g. React Strict Mode double-mount) while session work stays serialized per tab.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        lock: processLock,
      },
    },
  )
}
