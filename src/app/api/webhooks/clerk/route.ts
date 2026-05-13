import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type ClerkEvent = {
  type: string
  data: {
    id: string
    email_addresses?: Array<{ email_address: string; id: string }>
    primary_email_address_id?: string
    first_name?: string
    last_name?: string
    image_url?: string
    public_metadata?: { role?: string }
  }
}

export async function POST(req: NextRequest) {
  const SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!SECRET) return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 })
  if (!isSupabaseConfigured) return NextResponse.json({ ok: true, skipped: 'supabase not configured' })

  const h = await headers()
  const svixId = h.get('svix-id')
  const svixTs = h.get('svix-timestamp')
  const svixSig = h.get('svix-signature')
  if (!svixId || !svixTs || !svixSig) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await req.text()
  let evt: ClerkEvent
  try {
    const wh = new Webhook(SECRET)
    evt = wh.verify(body, { 'svix-id': svixId, 'svix-timestamp': svixTs, 'svix-signature': svixSig }) as ClerkEvent
  } catch (err) {
    console.error('[clerk webhook] verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const sb = getSupabaseAdmin()

  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    const u = evt.data
    const primary = u.email_addresses?.find((e) => e.id === u.primary_email_address_id) ?? u.email_addresses?.[0]
    if (!primary) return NextResponse.json({ ok: true, skipped: 'no email' })

    const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || null
    const role = u.public_metadata?.role ?? 'public'

    const { error } = await sb
      .from('profiles')
      .upsert(
        {
          clerk_user_id: u.id,
          email: primary.email_address,
          full_name: fullName,
          avatar_url: u.image_url ?? null,
          role,
        },
        { onConflict: 'clerk_user_id' }
      )
    if (error) {
      console.error('[clerk webhook] upsert profile error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    await sb.from('audit_log').insert({
      actor_type: 'webhook',
      actor_id: 'clerk',
      action: `profile.${evt.type === 'user.created' ? 'created' : 'updated'}`,
      resource_type: 'profile',
      resource_id: u.id,
      after: { email: primary.email_address, role, fullName },
    })
  }

  if (evt.type === 'user.deleted') {
    const u = evt.data
    await sb.from('profiles').delete().eq('clerk_user_id', u.id)
    await sb.from('audit_log').insert({
      actor_type: 'webhook',
      actor_id: 'clerk',
      action: 'profile.deleted',
      resource_type: 'profile',
      resource_id: u.id,
    })
  }

  return NextResponse.json({ ok: true })
}
