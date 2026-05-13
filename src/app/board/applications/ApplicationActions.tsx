'use client'

import { useState, useTransition } from 'react'
import { approveApplication, rejectApplication, requestMoreInfo } from './actions'

type Props = { applicationId: string; status: string }

export function ApplicationActions({ applicationId, status }: Props) {
  const [pending, start] = useTransition()
  const [feedback, setFeedback] = useState<string>('')
  const [error, setError] = useState<string>('')

  if (status === 'approved') {
    return <div className="eyebrow text-palm text-[10px]">✓ Approved · member created</div>
  }
  if (status === 'rejected') {
    return <div className="eyebrow text-crimson text-[10px]">Rejected</div>
  }

  function handleApprove() {
    setError('')
    setFeedback('approving…')
    start(async () => {
      const r = await approveApplication(applicationId)
      if (r.ok) {
        setFeedback('approved · member created')
      } else {
        setError(r.error ?? 'failed')
        setFeedback('')
      }
    })
  }

  function handleReject() {
    const reason = window.prompt('Brief rejection note (optional, sent in audit log):') ?? undefined
    if (reason === null) return
    setError('')
    setFeedback('rejecting…')
    start(async () => {
      const r = await rejectApplication(applicationId, reason)
      if (r.ok) {
        setFeedback('rejected')
      } else {
        setError(r.error ?? 'failed')
        setFeedback('')
      }
    })
  }

  function handleMoreInfo() {
    const message = window.prompt('What additional information do you need from the applicant?')
    if (!message) return
    setError('')
    setFeedback('queued for follow-up…')
    start(async () => {
      const r = await requestMoreInfo(applicationId, message)
      if (r.ok) {
        setFeedback('queued for follow-up')
      } else {
        setError(r.error ?? 'failed')
        setFeedback('')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleApprove}
        disabled={pending}
        className="btn-primary text-xs px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Approve
      </button>
      <button
        type="button"
        onClick={handleMoreInfo}
        disabled={pending}
        className="btn-outline text-xs px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Request More Info
      </button>
      <button
        type="button"
        onClick={handleReject}
        disabled={pending}
        className="text-xs px-5 py-2.5 rounded-full font-eyebrow uppercase tracking-eyebrow text-crimson border border-crimson hover:bg-crimson hover:text-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Reject
      </button>
      {feedback && <span className="eyebrow text-[10px] text-palm">{feedback}</span>}
      {error && <span className="eyebrow text-[10px] text-crimson">{error}</span>}
    </div>
  )
}
