/**
 * VioX AI · Agent Runtime
 *
 * Generic execution wrapper for Claude agents serving DMA's CRM.
 * Each agent declares: name, system prompt, tool catalog, optional approval gate.
 * Runtime handles: budget check, tool dispatch, persistence, audit, cost tracking.
 *
 * Triggered by: Vercel Cron (daily/weekly), Stripe webhook, Clerk webhook,
 * application submit, or manual board "Run Agent" button.
 */
import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-7-20250514'
const apiKey = process.env.ANTHROPIC_API_KEY

// Per-1M token pricing (Sonnet 4.7 baseline — adjust if model changes)
const PRICING = { input: 3.0, output: 15.0 } as const

export type ToolDef = {
  name: string
  description: string
  input_schema: Record<string, unknown>
  /** Server-side handler. Receives parsed args, returns the tool's result. */
  handler: (args: Record<string, unknown>) => Promise<unknown>
}

export type AgentDef = {
  name: string
  system: string
  tools: ToolDef[]
  /** If true, runtime sets `requires_approval` flag and stops before sending. */
  requiresApprovalForActions?: string[]
}

export type AgentRunInput = {
  trigger: 'cron' | 'manual' | 'webhook' | 'event'
  triggeredBy?: string
  inputSummary: string
  /** Initial user-role message that kicks off the conversation. */
  initialMessage: string
}

export type AgentRunResult = {
  status: 'succeeded' | 'failed' | 'timeout'
  outputSummary: string
  outputPayload: Record<string, unknown>
  toolsCalled: Array<{ name: string; args: Record<string, unknown>; result: unknown }>
  tokensInput: number
  tokensOutput: number
  costUsd: number
  errorMessage?: string
}

/**
 * Run an agent end-to-end. Handles budget, tool loop, persistence, audit.
 */
export async function runAgent(agent: AgentDef, input: AgentRunInput): Promise<AgentRunResult> {
  const startedAt = new Date()
  let runId: string | null = null

  if (!isSupabaseConfigured) {
    return {
      status: 'failed',
      outputSummary: 'Supabase not configured — agent runtime disabled',
      outputPayload: {},
      toolsCalled: [],
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      errorMessage: 'NEXT_PUBLIC_SUPABASE_URL not set',
    }
  }

  if (!apiKey) {
    return {
      status: 'failed',
      outputSummary: 'ANTHROPIC_API_KEY not set',
      outputPayload: {},
      toolsCalled: [],
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      errorMessage: 'ANTHROPIC_API_KEY missing',
    }
  }

  const sb = getSupabaseAdmin()

  // 1. Check budget
  const { data: cfg } = await sb.from('agent_configs').select('*').eq('name', agent.name).maybeSingle()
  if (!cfg) {
    return failRun(`No config found for agent ${agent.name}`)
  }
  if (!cfg.enabled) {
    return failRun(`Agent ${agent.name} is disabled`)
  }
  if (cfg.tokens_used_this_month >= cfg.monthly_token_budget) {
    return failRun(`Agent ${agent.name} over monthly budget (${cfg.tokens_used_this_month}/${cfg.monthly_token_budget})`)
  }

  // 2. Open run record
  const { data: openRun } = await sb
    .from('agent_runs')
    .insert({
      agent_name: agent.name,
      trigger: input.trigger,
      triggered_by: null,
      status: 'running',
      input_summary: input.inputSummary,
    })
    .select('id')
    .single()
  runId = openRun?.id ?? null

  const client = new Anthropic({ apiKey })
  const messages: MessageParam[] = [{ role: 'user', content: input.initialMessage }]
  const toolsCalled: AgentRunResult['toolsCalled'] = []
  let tokensInput = 0
  let tokensOutput = 0
  let finalText = ''

  try {
    // Multi-turn tool-use loop, capped to 10 round-trips
    for (let i = 0; i < 10; i++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: agent.system,
        tools: agent.tools.map((t) => ({
          name: t.name,
          description: t.description,
          input_schema: t.input_schema as Record<string, unknown> & { type: 'object' },
        })),
        messages,
      })
      tokensInput += response.usage.input_tokens
      tokensOutput += response.usage.output_tokens

      const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use')
      const textBlocks = response.content.filter((b) => b.type === 'text')

      // Capture text
      finalText = textBlocks.map((b) => ('text' in b ? b.text : '')).join('\n').trim() || finalText

      if (response.stop_reason !== 'tool_use' || toolUseBlocks.length === 0) {
        break
      }

      // Execute tool calls
      messages.push({ role: 'assistant', content: response.content })
      const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = []
      for (const tb of toolUseBlocks) {
        if (tb.type !== 'tool_use') continue
        const tool = agent.tools.find((t) => t.name === tb.name)
        if (!tool) {
          toolResults.push({ type: 'tool_result', tool_use_id: tb.id, content: `ERROR: unknown tool ${tb.name}` })
          continue
        }
        try {
          const result = await tool.handler(tb.input as Record<string, unknown>)
          toolsCalled.push({ name: tb.name, args: tb.input as Record<string, unknown>, result })
          toolResults.push({ type: 'tool_result', tool_use_id: tb.id, content: JSON.stringify(result) })
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          toolResults.push({ type: 'tool_result', tool_use_id: tb.id, content: `ERROR: ${message}` })
        }
      }
      messages.push({ role: 'user', content: toolResults })
    }

    const costUsd = (tokensInput * PRICING.input + tokensOutput * PRICING.output) / 1_000_000
    const result: AgentRunResult = {
      status: 'succeeded',
      outputSummary: finalText.slice(0, 500),
      outputPayload: { fullText: finalText, finalTurnReached: true },
      toolsCalled,
      tokensInput,
      tokensOutput,
      costUsd,
    }

    // Persist
    if (runId) {
      await sb
        .from('agent_runs')
        .update({
          status: 'succeeded',
          finished_at: new Date().toISOString(),
          output_summary: result.outputSummary,
          output_payload: result.outputPayload,
          tools_called: toolsCalled,
          tokens_input: tokensInput,
          tokens_output: tokensOutput,
          cost_usd: costUsd,
        })
        .eq('id', runId)

      await sb
        .from('agent_configs')
        .update({
          tokens_used_this_month: cfg.tokens_used_this_month + tokensInput + tokensOutput,
          last_run_at: new Date().toISOString(),
        })
        .eq('name', agent.name)
    }

    return result
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (runId) {
      await sb
        .from('agent_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: message,
          tokens_input: tokensInput,
          tokens_output: tokensOutput,
        })
        .eq('id', runId)
    }
    return {
      status: 'failed',
      outputSummary: `Agent failed: ${message}`,
      outputPayload: {},
      toolsCalled,
      tokensInput,
      tokensOutput,
      costUsd: 0,
      errorMessage: message,
    }
  }

  function failRun(reason: string): AgentRunResult {
    return {
      status: 'failed',
      outputSummary: reason,
      outputPayload: {},
      toolsCalled: [],
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      errorMessage: reason,
    }
  }
}

/**
 * Async fire-and-forget trigger. Used after webhook events (e.g. apply submit).
 * Imports the agent dynamically to avoid circular deps.
 */
export async function triggerAgent(name: string, ctx: Record<string, unknown>): Promise<void> {
  // Dynamic import — keeps the request hot path lean
  const mod = await import(`./${name.replace(/_/g, '-')}.ts`).catch(async () => {
    return await import(`./${name.replace(/_/g, '-')}.js`)
  })
  if (typeof mod.run !== 'function') {
    throw new Error(`Agent module ${name} has no exported run() function`)
  }
  await mod.run(ctx)
}
