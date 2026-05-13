-- Row-Level Security policies for VioX AI · DMA CRM
--
-- Strategy: every table is RLS-on. Service-role (used by server actions and
-- the agent runtime) bypasses RLS by design; the SSR cookie-bound client uses
-- a custom claim 'role' from Clerk's JWT template to scope access.
--
-- Note: Clerk JWT template should include:
--   { "role": "{{user.public_metadata.role}}", "user_id": "{{user.id}}" }
-- and Supabase JWT secret should be set to Clerk's instance JWT key.

alter table public.profiles            enable row level security;
alter table public.members             enable row level security;
alter table public.applications        enable row level security;
alter table public.directory_listings  enable row level security;
alter table public.events              enable row level security;
alter table public.event_rsvps         enable row level security;
alter table public.donations           enable row level security;
alter table public.agent_configs       enable row level security;
alter table public.agent_runs          enable row level security;
alter table public.audit_log           enable row level security;

-- Helper: current role from JWT
create or replace function public.current_role_safe() returns text as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', 'public');
$$ language sql stable;

-- ── profiles: user reads/updates self; staff reads all ─────────────────────
create policy "self read profile" on public.profiles for select
  using (clerk_user_id = current_setting('request.jwt.claims', true)::jsonb->>'user_id');
create policy "staff read all profiles" on public.profiles for select
  using (public.current_role_safe() in ('super_admin','board_member','institution_manager'));
create policy "self update profile" on public.profiles for update
  using (clerk_user_id = current_setting('request.jwt.claims', true)::jsonb->>'user_id');
create policy "super admin update profiles" on public.profiles for update
  using (public.current_role_safe() = 'super_admin');

-- ── members: physician_member sees self; staff sees all ────────────────────
create policy "members staff full" on public.members for all
  using (public.current_role_safe() in ('super_admin','board_member','institution_manager'))
  with check (public.current_role_safe() in ('super_admin','board_member','institution_manager'));
create policy "members self read" on public.members for select
  using (
    profile_id in (select id from public.profiles where clerk_user_id = current_setting('request.jwt.claims', true)::jsonb->>'user_id')
  );

-- ── applications: anyone may insert via API; staff can read/update ────────
create policy "applications anon insert" on public.applications for insert with check (true);
create policy "applications staff read" on public.applications for select
  using (public.current_role_safe() in ('super_admin','board_member','institution_manager'));
create policy "applications staff update" on public.applications for update
  using (public.current_role_safe() in ('super_admin','board_member','institution_manager'));

-- ── directory_listings: public reads only public=true; staff full ─────────
create policy "directory public read" on public.directory_listings for select using (public = true);
create policy "directory staff full" on public.directory_listings for all
  using (public.current_role_safe() in ('super_admin','board_member','institution_manager'))
  with check (public.current_role_safe() in ('super_admin','board_member','institution_manager'));

-- ── events: public reads published; staff full ────────────────────────────
create policy "events public read" on public.events for select using (status = 'published');
create policy "events staff full" on public.events for all
  using (public.current_role_safe() in ('super_admin','board_member','institution_manager'))
  with check (public.current_role_safe() in ('super_admin','board_member','institution_manager'));

-- ── event_rsvps: anyone may insert (RSVP); staff reads all ────────────────
create policy "rsvp insert" on public.event_rsvps for insert with check (true);
create policy "rsvp staff read" on public.event_rsvps for select
  using (public.current_role_safe() in ('super_admin','board_member','institution_manager'));

-- ── donations: staff only ─────────────────────────────────────────────────
create policy "donations staff" on public.donations for all
  using (public.current_role_safe() in ('super_admin','board_member','institution_manager'))
  with check (public.current_role_safe() in ('super_admin','board_member','institution_manager'));

-- ── agent_configs: super_admin write, staff read ──────────────────────────
create policy "agent_configs staff read" on public.agent_configs for select
  using (public.current_role_safe() in ('super_admin','board_member','institution_manager'));
create policy "agent_configs super write" on public.agent_configs for all
  using (public.current_role_safe() = 'super_admin')
  with check (public.current_role_safe() = 'super_admin');

-- ── agent_runs: staff read; service role writes ───────────────────────────
create policy "agent_runs staff read" on public.agent_runs for select
  using (public.current_role_safe() in ('super_admin','board_member','institution_manager'));

-- ── audit_log: staff read only; nobody updates/deletes (service role inserts) ─
create policy "audit_log staff read" on public.audit_log for select
  using (public.current_role_safe() in ('super_admin','board_member','institution_manager'));
