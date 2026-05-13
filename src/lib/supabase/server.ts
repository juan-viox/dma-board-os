import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieToSet = { name: string; value: string; options?: CookieOptions }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

/** Server-side Supabase client bound to the request's cookies (RLS-aware). */
export async function getSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          /* ignore: route handler context */
        }
      },
    },
  })
}

/** Service-role client. Never import in a client component. Bypasses RLS — use only in trusted server code. */
export function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    throw new Error('Supabase service role not configured')
  }
  // Use the same SSR createServerClient with empty cookie handlers + service-role key
  return createServerClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    cookies: { getAll: () => [], setAll: () => {} },
  })
}

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY)
