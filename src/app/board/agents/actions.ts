'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/roles'
import { triggerAgent } from '@/lib/agents/runtime'

const VALID_AGENTS = new Set([
  'membership_renewal',
  'application_triage',
  'npi_verification',
  'newsletter_drafter',
  'voice_agent_analyst',
  'donation_acknowledgment',
  'event_reminder',
  'mission_coordinator',
])

type Result = { ok: boolean; error?: string; output?: string }

async function getActorProfileId() {
  const { userId } = await auth()
  if (!userId) return null
  const sb = getSupabaseAdmin()
  const { data } = await sb.from('profiles').select('id').eq('clerk_user_id', userId).maybeSingle()
  return data?.id ?? null
}

/** Manually trigger an agent run from the board UI. */
export async function runAgentNow(name: string): Promise<Result> {
  try {
    await requireRole('institution_manager')
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unauthorized' }
  }
  if (!VALID_AGENTS.has(name)) return { ok: false, error: `Unknown agent: ${name}` }

  const sb = getSupabaseAdmin()
  await sb.from('audit_log').insert({
    actor_type: 'user',
    actor_id: await getActorProfileId(),
    action: 'agent.manual_run_started',
    resource_type: 'agent',
    resource_id: name,
  })

  try {
    const result = await triggerAgent(name, { trigger: 'manual' })
    revalidatePath('/board/agents')
    revalidatePath('/board')
    return {
      ok: true,
      output: typeof result === 'object' && result && 'outputSummary' in result
        ? String((result as { outputSummary: string }).outputSummary)
        : 'Run completed',
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }
}

/** Toggle whether an agent is enabled (cron + manual triggers respect this). */
export async function toggleAgentEnabled(name: string, enabled: boolean): Promise<Result> {
  try {
    await requireRole('super_admin')
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unauthorized' }
  }
  if (!VALID_AGENTS.has(name)) return { ok: false, error: `Unknown agent: ${name}` }

  const sb = getSupabaseAdmin()
  const { error } = await sb.from('agent_configs').update({ enabled }).eq('name', name)
  if (error) return { ok: false, error: error.message }

  await sb.from('audit_log').insert({
    actor_type: 'user',
    actor_id: await getActorProfileId(),
    action: enabled ? 'agent.enabled' : 'agent.disabled',
    resource_type: 'agent',
    resource_id: name,
  })

  revalidatePath('/board/agents')
  return { ok: true }
}

/** Reset monthly token usage counter (super_admin only — for end-of-month rollover). */
export async function resetTokenBudget(name: string): Promise<Result> {
  try {
    await requireRole('super_admin')
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unauthorized' }
  }
  const sb = getSupabaseAdmin()
  const { error } = await sb.from('agent_configs').update({ tokens_used_this_month: 0 }).eq('name', name)
  if (error) return { ok: false, error: error.message }

  await sb.from('audit_log').insert({
    actor_type: 'user',
    actor_id: await getActorProfileId(),
    action: 'agent.budget_reset',
    resource_type: 'agent',
    resource_id: name,
  })

  revalidatePath('/board/agents')
  return { ok: true }
}
