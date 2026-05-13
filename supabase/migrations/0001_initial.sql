-- ─────────────────────────────────────────────────────────────────────────────
-- VioX AI · DMA CRM · Initial schema
--
-- Tables
--   1. profiles            — mirror of Clerk user, role, contact
--   2. members             — physician records (MD, NPI, hospital, dues)
--   3. applications        — public membership-application submissions
--   4. directory_listings  — opt-in public profiles for the doctor directory
--   5. events              — board-managed event calendar
--   6. event_rsvps         — RSVPs to events (linked to profile or anonymous email)
--   7. donations           — Stripe-synced donation ledger
--   8. agent_configs       — per-agent settings (enabled, schedule, prompt overrides)
--   9. agent_runs          — every agent execution + result + tokens used
--  10. audit_log           — immutable record of every state change made by humans + agents
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── 1. profiles ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text not null default 'public'
    check (role in ('super_admin','board_member','institution_manager','physician_member','public')),
  preferred_language text not null default 'en' check (preferred_language in ('en','es')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles(role);

-- ── 2. members ───────────────────────────────────────────────────────────────
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  npi text,                                   -- 10 digits
  npi_verified_at timestamptz,
  npi_verification_status text default 'unverified'
    check (npi_verification_status in ('unverified','verified','revoked','not_applicable')),
  specialty text,
  sub_specialty text,
  hospital_affiliation text,
  borough text,                               -- Manhattan, Bronx, Brooklyn, Queens, Staten Island, Other
  languages text[] default array[]::text[],
  insurance_accepted text[] default array[]::text[],
  country_of_training text,
  member_tier text not null default 'active'
    check (member_tier in ('active','resident','student','sponsor','honorary')),
  member_since date not null default current_date,
  dues_status text not null default 'pending'
    check (dues_status in ('pending','active','grace','expired','exempt')),
  dues_expires_at date,
  stripe_customer_id text,
  stripe_subscription_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists members_dues_status_idx on public.members(dues_status, dues_expires_at);
create index if not exists members_country_idx on public.members(country_of_training);
create index if not exists members_specialty_idx on public.members(specialty);

-- ── 3. applications ──────────────────────────────────────────────────────────
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  country_of_training text not null,
  npi text,
  specialty text not null,
  hospital_affiliation text,
  languages text[] default array[]::text[],
  tier text not null check (tier in ('active','resident','student','sponsor')),
  motivation text not null,
  status text not null default 'submitted'
    check (status in ('submitted','triaged','board_review','approved','rejected','duplicate')),
  triage_memo text,                           -- written by Application Triage Agent
  triage_score numeric(3,1),                  -- 0.0–10.0 fit score
  triage_red_flags text[] default array[]::text[],
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  member_id uuid references public.members(id), -- set when approved
  source text default 'web',
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists applications_status_idx on public.applications(status, created_at desc);

-- ── 4. directory_listings ────────────────────────────────────────────────────
create table if not exists public.directory_listings (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  name text not null,
  specialty text not null,
  hospital text,
  borough text,
  languages text[] default array[]::text[],
  origin text,
  insurance text[] default array[]::text[],
  image_url text,
  bio_en text,
  bio_es text,
  walking_distance_subway text,
  public boolean not null default false,
  npi_verified boolean not null default false,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists directory_public_idx on public.directory_listings(public);

-- ── 5. events ────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  title_es text,
  subtitle_en text,
  subtitle_es text,
  body_en text,
  body_es text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  capacity int,
  status text not null default 'draft'
    check (status in ('draft','published','cancelled','completed')),
  cme_credits numeric(3,1),
  is_member_only boolean not null default false,
  cover_image_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_status_start_idx on public.events(status, start_at);

-- ── 6. event_rsvps ───────────────────────────────────────────────────────────
create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  email text not null,
  full_name text,
  party_size int not null default 1,
  notes text,
  reminder_sent_7d_at timestamptz,
  reminder_sent_1d_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

-- ── 7. donations ─────────────────────────────────────────────────────────────
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_email text not null,
  donor_name text,
  amount_cents int not null check (amount_cents > 0),
  currency text not null default 'usd',
  intent text,                                -- e.g. 'general', 'mock_interview', 'mission_day'
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  receipt_sent_at timestamptz,
  thank_you_drafted_at timestamptz,
  thank_you_drafted_by_agent boolean default false,
  thank_you_approved_by uuid references public.profiles(id),
  thank_you_approved_at timestamptz,
  thank_you_sent_at timestamptz,
  receipt_pdf_url text,
  created_at timestamptz not null default now()
);
create index if not exists donations_email_idx on public.donations(donor_email);

-- ── 8. agent_configs ─────────────────────────────────────────────────────────
create table if not exists public.agent_configs (
  name text primary key,                      -- 'membership_renewal', 'application_triage', etc.
  display_name text not null,
  description text,
  enabled boolean not null default true,
  schedule_cron text,                         -- e.g. '0 9 * * *' (daily 9 AM ET)
  monthly_token_budget int not null default 200000,
  tokens_used_this_month int not null default 0,
  approval_threshold_cents int default 100000, -- spends/sends above this require board approval
  prompt_override text,                       -- per-tenant tweak to the agent's system prompt
  last_run_at timestamptz,
  next_run_at timestamptz,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- ── 9. agent_runs ────────────────────────────────────────────────────────────
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null references public.agent_configs(name),
  trigger text not null check (trigger in ('cron','manual','webhook','event')),
  triggered_by uuid references public.profiles(id),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running'
    check (status in ('running','succeeded','failed','timeout','cancelled')),
  input_summary text,                         -- short human-readable description of what triggered it
  output_summary text,                        -- short human-readable result description
  output_payload jsonb,                       -- structured output (drafts, IDs, etc.)
  tools_called jsonb,                         -- array of {name, args, result}
  tokens_input int,
  tokens_output int,
  cost_usd numeric(10,6),
  error_message text,
  requires_approval boolean default false,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz
);
create index if not exists agent_runs_agent_started_idx on public.agent_runs(agent_name, started_at desc);

-- ── 10. audit_log ────────────────────────────────────────────────────────────
create table if not exists public.audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  actor_type text not null check (actor_type in ('user','agent','system','webhook')),
  actor_id text,                              -- profile id (uuid as text) or agent name
  action text not null,                       -- e.g. 'application.approved', 'member.tier_changed'
  resource_type text not null,                -- e.g. 'application', 'member', 'event'
  resource_id text,
  before jsonb,
  after jsonb,
  ip_address text,
  user_agent text
);
create index if not exists audit_log_resource_idx on public.audit_log(resource_type, resource_id);
create index if not exists audit_log_at_idx on public.audit_log(at desc);

-- ── Updated_at triggers ──────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  for t in select unnest(array['profiles','members','applications','directory_listings','events']) loop
    execute format('
      drop trigger if exists touch_updated_at_%I on public.%I;
      create trigger touch_updated_at_%I before update on public.%I
        for each row execute function public.touch_updated_at();
    ', t, t, t, t);
  end loop;
end$$;

-- ── Seed agent configs ───────────────────────────────────────────────────────
insert into public.agent_configs (name, display_name, description, schedule_cron, monthly_token_budget) values
  ('membership_renewal',     'Membership Renewal Agent',     'Drafts bilingual renewal emails 30/14/7 days before dues expire.', '0 14 * * *',  300000),
  ('application_triage',     'Application Triage Agent',     'Reads new applications, verifies NPI, scores fit, drafts board memo.', null,         200000),
  ('npi_verification',       'NPI Verification Agent',       'Monthly re-check of every member NPI against CMS NPPES.',           '0 5 1 * *',   150000),
  ('newsletter_drafter',     'Newsletter Drafter Agent',     'Biweekly bilingual ¡Escucha Esto! draft from latest news + events.', '0 16 1,15 * *', 250000),
  ('voice_agent_analyst',    'Voice Agent Analyst',          'Daily review of Dr. Asistente transcripts, suggests KB updates.',   '0 17 * * *',   180000),
  ('donation_acknowledgment','Donation Acknowledgment Agent','Drafts personal thank-you on Stripe webhook (auto < $1K).',          null,         200000),
  ('event_reminder',         'Event Reminder Agent',         'Bilingual SMS+email 7d/1d/3hr before published events.',             '0 10 * * *',   220000),
  ('mission_coordinator',    'Mission Trip Coordinator',     'Builds DR mission roster, matches specialty to clinic needs.',       null,         150000)
on conflict (name) do nothing;
