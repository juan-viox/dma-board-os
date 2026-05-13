# VioX AI · DMA Board OS — Setup Runbook

> Live staging: **https://dma-board-os.vercel.app**
> GitHub: **https://github.com/juan-viox/dma-board-os**

This document is everything Juan (or whoever takes over operations) needs to flip the staging site into a fully-operational CRM with working AI agents.

Estimated end-to-end time: **40 minutes**.

---

## 1 · Create a Supabase project (8 min)

1. Go to https://supabase.com → New Project.
   - Name: `dma-ny`
   - Region: `us-east-1` (closest to NYC)
   - Database password: generate strong, save in 1Password
2. Wait ~2 min for project to provision.
3. SQL Editor → "New query" → paste the contents of `supabase/migrations/0001_initial.sql` → Run.
4. Run `supabase/migrations/0002_rls.sql` the same way.
5. Project Settings → API → copy three values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (treat like a password)

## 2 · Create a Clerk project (8 min)

1. Go to https://clerk.com → Create new application.
   - Name: `DMA Board OS`
   - Sign-in options: **Email** (magic link) + **Google OAuth**
2. API Keys → copy:
   - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`
3. Webhooks → Create webhook:
   - Endpoint URL: `https://dma-board-os.vercel.app/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** → `CLERK_WEBHOOK_SECRET`
4. JWT Templates → New template named `supabase`:
   ```json
   {
     "role": "{{user.public_metadata.role}}",
     "user_id": "{{user.id}}"
   }
   ```
   This lets Supabase RLS read the role claim.
5. Configure → Sessions → set the lifetime to 7 days.

## 3 · Get an Anthropic API key (3 min)

1. https://console.anthropic.com → API Keys → Create Key.
2. Name: `dma-board-os`
3. Copy → `ANTHROPIC_API_KEY`

## 4 · Generate a Cron secret (1 min)

```bash
openssl rand -hex 24
```

Save as `CRON_SECRET`. Vercel will call `/api/cron/agents?agent=...` with this secret in the Authorization header.

## 5 · Push all env vars to Vercel (5 min)

In your terminal:
```bash
cd /Users/juanalvarado/Library/CloudStorage/OneDrive-VioXAI/Claude/Projects/dma-board-os
export PATH="/Users/juanalvarado/local/node/bin:$PATH"

# Replace the placeholder Clerk values with the real ones
vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --yes
echo "pk_live_xxx" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --force
vercel env rm CLERK_SECRET_KEY production --yes
echo "sk_live_xxx" | vercel env add CLERK_SECRET_KEY production --force

# Add the rest
echo "whsec_xxx"  | vercel env add CLERK_WEBHOOK_SECRET production --force
echo "https://xxxxx.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --force
echo "eyJxxx_anon"  | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --force
echo "eyJxxx_service" | vercel env add SUPABASE_SERVICE_ROLE_KEY production --force
echo "sk-ant-xxx"  | vercel env add ANTHROPIC_API_KEY production --force
echo "$(openssl rand -hex 24)" | vercel env add CRON_SECRET production --force

# Trigger a redeploy to pick up the new env
vercel --yes --prod --name dma-board-os
```

## 6 · Promote yourself to super_admin (2 min)

After your first sign-in via `/sign-in`:

1. Open Clerk dashboard → Users → click your user.
2. Public Metadata → edit:
   ```json
   { "role": "super_admin" }
   ```
3. Refresh `/board` — you should now have full access.

## 7 · Connect Stripe for membership dues (10 min, optional)

If you want online membership signup + auto-renewal (vs admitting members manually):

1. https://dashboard.stripe.com → Developers → API keys → copy `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Products → create three Recurring prices:
   - "DMA Active Physician" — $200/year → copy price id → `STRIPE_MEMBERSHIP_PRICE_ACTIVE`
   - "DMA Resident" — $50/year → `STRIPE_MEMBERSHIP_PRICE_RESIDENT`
   - "DMA Sponsor" — $1000/year → `STRIPE_MEMBERSHIP_PRICE_SPONSOR`
3. Webhooks → endpoint `https://dma-board-os.vercel.app/api/webhooks/stripe` → events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted` → copy `STRIPE_WEBHOOK_SECRET`.
4. Push these env vars to Vercel via the same pattern as step 5.

The Stripe webhook handler isn't built yet — it's in the next phase. Until then, members must be added via the board admin (Members tab → + Add Member).

## 8 · Add the first board members (5 min)

Once you're in `/board`:

1. **Members tab** → + Add Member → start with Dr. Douglas Mendez:
   - Name, email, NPI, hospital affiliation, country of training, tier `active`
2. **Directory** tab → mark Dr. Mendez's listing `public: true` so he appears at `/directory` on the public site.
3. **Agents** tab → click "Run Now" on **NPI Verification** to verify his NPI immediately.
4. Repeat for Dr. Casilda Balmaceda, Dr. Rafael Peralta, etc. once you have their info.

## 9 · Set custom domain (5 min, when ready)

When you're ready to point the public site at `dmanewyork.com`:

1. Migrate the existing site by either:
   - **Option A:** redirect `dominican-medical-association.vercel.app` → new app, point `dmanewyork.com` at `dma-board-os.vercel.app`.
   - **Option B:** add `dmanewyork.com` as an additional domain to the existing Vercel project. (Recommended only if you keep the old single-page site live.)
2. `vercel domains add dmanewyork.com` (in `dma-board-os` project).
3. DNS: `A` `@` → `76.76.21.21` and `CNAME` `www` → `cname.vercel-dns.com`.

---

## What's working today (staging)

- ✅ Multi-page public site (home + about + 6 programs + directory + events + get-involved + apply + contact)
- ✅ Bilingual EN/ES toggle on every page (localStorage-persisted)
- ✅ Caribbean-Modernist Civic design system (Fraunces + Inter + Cormorant + Jost)
- ✅ Cinematic scroll-driven canvas hero (121 frames @ 24fps, DMA-branded)
- ✅ ElevenLabs Dr. Asistente voice agent embedded on every page
- ✅ Public membership application form (`/apply`) → posts to `/api/applications`
- ✅ Application Triage Agent code (Claude Sonnet) — fires on submit, drafts board memo
- ✅ Membership Renewal Agent code (Claude Sonnet) — daily cron via Vercel
- ✅ Generic agent runtime: budget caps, tool dispatch, audit log, cost tracking
- ✅ Board admin layout + dashboard + members + applications + agents pages
- ✅ Clerk auth + role-based access (super_admin / board_member / institution_manager / physician_member)
- ✅ Supabase schema (10 tables) + RLS policies
- ✅ Vercel cron config for 5 scheduled agents
- ✅ Webhook handlers for Clerk user sync + (stub) public application submit

## Coming in the next phase (let me know when to start)

- 🔲 Stripe Connect for membership dues + tiered donations + tax receipts
- 🔲 Donation Acknowledgment Agent (auto-send for ≤$1K, queue for board approval above)
- 🔲 NPI Verification Agent implementation (handler currently stubbed)
- 🔲 Newsletter Drafter Agent (¡Escucha Esto! biweekly draft)
- 🔲 Voice Agent Analyst (daily ElevenLabs transcript review)
- 🔲 Event Reminder Agent (bilingual SMS via Twilio + email via Resend)
- 🔲 Mission Trip Coordinator Agent (specialty matching + itinerary)
- 🔲 Members CRUD modals (Add/Edit/Delete with full form)
- 🔲 Application approve/reject server actions (currently buttons are visual only)
- 🔲 News & Spotlights CMS (MDX-based)
- 🔲 Resend integration for outbound member emails
- 🔲 Twilio SMS for bilingual event reminders
- 🔲 Audit Log explorer view
- 🔲 Donations ledger view
