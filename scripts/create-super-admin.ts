#!/usr/bin/env tsx
/**
 * VioX AI · DMA Board OS — Super Admin Provisioning
 *
 * Creates a Clerk user with email+password, sets role=super_admin in
 * publicMetadata, then optionally upserts the matching profile row in Supabase.
 *
 * Usage (after you've created a Clerk project + run the SQL migrations):
 *
 *   CLERK_SECRET_KEY=sk_live_xxx \
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJxxx \
 *   pnpm tsx scripts/create-super-admin.ts \
 *     --email juan@viox.ai \
 *     --password 'DMA-Saffron-7421-Inwood!' \
 *     --first-name Juan --last-name Alvarado
 *
 * Idempotent: re-running with the same email updates the existing user.
 */
import { createClerkClient } from '@clerk/backend'
import { createClient } from '@supabase/supabase-js'

type Args = {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

function parseArgs(): Args {
  const args = process.argv.slice(2)
  const out: Partial<Args> = {}
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i].replace(/^--/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    out[k as keyof Args] = args[i + 1]
  }
  if (!out.email || !out.password) {
    console.error('Usage: pnpm tsx scripts/create-super-admin.ts --email X --password Y [--first-name F --last-name L]')
    process.exit(1)
  }
  return out as Args
}

async function main() {
  const args = parseArgs()
  const clerkSecret = process.env.CLERK_SECRET_KEY
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!clerkSecret) {
    console.error('CLERK_SECRET_KEY env var is required.')
    process.exit(1)
  }

  console.log(`Provisioning super_admin: ${args.email}`)

  const clerk = createClerkClient({ secretKey: clerkSecret })

  // 1. Create or update Clerk user
  let user
  const existing = await clerk.users.getUserList({ emailAddress: [args.email] })
  if (existing.data.length > 0) {
    user = existing.data[0]
    console.log(`  ↳ found existing Clerk user ${user.id}; updating`)
    user = await clerk.users.updateUser(user.id, {
      firstName: args.firstName ?? user.firstName ?? undefined,
      lastName: args.lastName ?? user.lastName ?? undefined,
      password: args.password,
      skipPasswordChecks: true,
      publicMetadata: { ...(user.publicMetadata as object), role: 'super_admin' },
    })
  } else {
    console.log('  ↳ creating new Clerk user')
    user = await clerk.users.createUser({
      emailAddress: [args.email],
      password: args.password,
      firstName: args.firstName,
      lastName: args.lastName,
      skipPasswordChecks: true,
      skipPasswordRequirement: false,
      publicMetadata: { role: 'super_admin' },
    })
  }
  console.log(`  ✓ Clerk user id: ${user.id}`)
  console.log(`  ✓ role set to super_admin in publicMetadata`)

  // 2. Mirror into Supabase profiles (if configured)
  if (supabaseUrl && supabaseService) {
    const sb = createClient(supabaseUrl, supabaseService, { auth: { persistSession: false } })
    const { error } = await sb
      .from('profiles')
      .upsert(
        {
          clerk_user_id: user.id,
          email: args.email,
          full_name: [args.firstName, args.lastName].filter(Boolean).join(' ') || null,
          avatar_url: user.imageUrl ?? null,
          role: 'super_admin',
        },
        { onConflict: 'clerk_user_id' }
      )
    if (error) {
      console.warn(`  ⚠ Supabase profile upsert error: ${error.message} (continuing — Clerk webhook will sync on next event)`)
    } else {
      console.log('  ✓ Supabase profile upserted with role=super_admin')
    }

    // Audit
    await sb.from('audit_log').insert({
      actor_type: 'system',
      actor_id: 'create-super-admin-script',
      action: 'profile.super_admin_provisioned',
      resource_type: 'profile',
      resource_id: user.id,
      after: { email: args.email, role: 'super_admin' },
    })
  } else {
    console.log('  ℹ Skipping Supabase mirror (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set)')
  }

  console.log('\n─────────────────────────────────────────────')
  console.log('  SUPER ADMIN READY')
  console.log('─────────────────────────────────────────────')
  console.log(`  Email:    ${args.email}`)
  console.log(`  Password: ${args.password}`)
  console.log(`  Role:     super_admin`)
  console.log(`  Sign in:  https://dma-board-os.vercel.app/sign-in`)
  console.log('─────────────────────────────────────────────\n')
  console.log('Save this password in 1Password, then change it after first sign-in via Clerk\'s account management.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
