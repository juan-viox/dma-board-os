'use client'

import { useState, useTransition, FormEvent } from 'react'
import { createMember } from './actions'

export function AddMemberDialog() {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string>('')

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const payload = Object.fromEntries(fd.entries())
    start(async () => {
      const r = await createMember(payload)
      if (r.ok) {
        setOpen(false)
      } else {
        setError(r.error ?? 'failed')
      }
    })
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        + Add Member
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-navy-dark/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-cream rounded-md max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <header className="bg-navy text-cream p-6 rounded-t-md flex items-center justify-between">
              <div>
                <p className="eyebrow text-saffron text-[10px] mb-1">Manual Entry</p>
                <h2 className="font-display text-2xl">Add Member</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-cream/70 hover:text-cream text-2xl leading-none"
              >
                ×
              </button>
            </header>
            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <Field name="full_name" label="Full Name *" required />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field name="email" type="email" label="Email *" required />
                <Field name="phone" type="tel" label="Phone" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field name="npi" label="NPI (10 digits)" placeholder="e.g. 1234567890" pattern="\d{10}" />
                <Field name="country_of_training" label="Country of Training" placeholder="e.g. Dominican Republic" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field name="specialty" label="Specialty" placeholder="e.g. Internal Medicine" />
                <Field name="hospital_affiliation" label="Hospital Affiliation" placeholder="e.g. Mount Sinai" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block eyebrow text-crimson text-[10px] mb-1">Borough</span>
                  <select name="borough" className="w-full px-3 py-2 bg-parchment border border-stone rounded text-sm text-navy">
                    <option value="">—</option>
                    <option value="Manhattan">Manhattan</option>
                    <option value="Bronx">Bronx</option>
                    <option value="Brooklyn">Brooklyn</option>
                    <option value="Queens">Queens</option>
                    <option value="Staten Island">Staten Island</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block eyebrow text-crimson text-[10px] mb-1">Tier *</span>
                  <select name="member_tier" required defaultValue="active" className="w-full px-3 py-2 bg-parchment border border-stone rounded text-sm text-navy">
                    <option value="active">Active Physician — $200/yr</option>
                    <option value="resident">Resident — $50/yr</option>
                    <option value="student">Medical Student — Free</option>
                    <option value="sponsor">Sponsor — $1,000/yr</option>
                    <option value="honorary">Honorary</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="block eyebrow text-crimson text-[10px] mb-1">Notes</span>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full px-3 py-2 bg-parchment border border-stone rounded text-sm text-navy"
                />
              </label>

              {error && (
                <div className="bg-crimson/10 border border-crimson rounded p-3 text-xs text-crimson">{error}</div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
                  {pending ? 'Saving…' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function Field({
  name,
  label,
  type = 'text',
  required,
  placeholder,
  pattern,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  placeholder?: string
  pattern?: string
}) {
  return (
    <label className="block">
      <span className="block eyebrow text-crimson text-[10px] mb-1">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        className="w-full px-3 py-2 bg-parchment border border-stone rounded text-sm text-navy focus:outline-none focus:border-saffron"
      />
    </label>
  )
}
