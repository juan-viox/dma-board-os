'use client'

import { useState, useTransition } from 'react'
import { runAgentNow, toggleAgentEnabled } from './actions'

export function AgentRunButton({ name, disabled }: { name: string; disabled?: boolean }) {
  const [pending, start] = useTransition()
  const [feedback, setFeedback] = useState<string>('')
  const [error, setError] = useState<string>('')

  function handleRun() {
    setError('')
    setFeedback('starting…')
    start(async () => {
      const r = await runAgentNow(name)
      if (r.ok) {
        setFeedback('done · ' + (r.output ?? 'run complete'))
      } else {
        setError(r.error ?? 'failed')
        setFeedback('')
      }
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRun}
        disabled={pending || disabled}
        className="btn-outline w-full justify-center text-xs px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Running…' : 'Run Now'}
      </button>
      {feedback && <div className="text-xs text-palm mt-2 truncate">{feedback}</div>}
      {error && <div className="text-xs text-crimson mt-2 truncate">{error}</div>}
    </div>
  )
}

export function AgentToggle({ name, enabled }: { name: string; enabled: boolean }) {
  const [pending, start] = useTransition()
  const [state, setState] = useState(enabled)
  const [error, setError] = useState<string>('')

  function flip() {
    setError('')
    const next = !state
    setState(next)
    start(async () => {
      const r = await toggleAgentEnabled(name, next)
      if (!r.ok) {
        setState(!next)
        setError(r.error ?? 'failed')
      }
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={flip}
        disabled={pending}
        className={`eyebrow text-[10px] px-3 py-1 rounded-full border transition-colors disabled:opacity-50 ${
          state ? 'bg-palm/15 text-palm border-palm hover:bg-palm/25' : 'bg-stone text-ink border-stone hover:bg-saffron/15'
        }`}
      >
        {state ? 'enabled' : 'disabled'}
      </button>
      {error && <div className="text-[10px] text-crimson mt-1">{error}</div>}
    </div>
  )
}
