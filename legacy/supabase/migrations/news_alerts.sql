-- ═══════════════════════════════════════════════════════════
-- news_alerts — AI-detected government personnel changes
-- Referenced by admin/ai-manager.html Monitor tab
-- ═══════════════════════════════════════════════════════════

create table if not exists public.news_alerts (
  id              uuid primary key default gen_random_uuid(),
  official_name   text not null,
  old_role        text,
  new_role        text not null,
  tier            text,            -- federal_executive, state_executive, etc.
  state_code      text,            -- e.g. Lagos, FCT
  party           text,            -- e.g. APC, PDP
  change_type     text not null default 'appointed',  -- appointed | removed | resigned | died | suspended | impeached
  change_date     date,
  source          text,            -- news outlet or URL
  headline        text,
  confidence      text not null default 'medium',     -- high | medium | low
  is_processed    boolean not null default false,
  detected_at     timestamptz not null default now(),
  processed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indexes
create index if not exists idx_news_alerts_detected   on public.news_alerts(detected_at desc);
create index if not exists idx_news_alerts_type        on public.news_alerts(change_type, detected_at desc);
create index if not exists idx_news_alerts_processed   on public.news_alerts(is_processed, detected_at desc);
create index if not exists idx_news_alerts_name        on public.news_alerts(official_name);

-- Updated-at trigger (reuse existing function)
drop trigger if exists set_updated_at_news_alerts on public.news_alerts;
create trigger set_updated_at_news_alerts
before update on public.news_alerts
for each row execute function trg_set_updated_at_news();

-- RLS
alter table public.news_alerts enable row level security;

-- Authenticated users (admins) can read all alerts
drop policy if exists news_alerts_auth_read on public.news_alerts;
create policy news_alerts_auth_read on public.news_alerts
for select to authenticated
using (true);

-- Anon cannot see alerts (admin-only data)
-- No anon policy = implicit deny

-- Revoke write from authenticated (service-role only writes)
revoke insert, update, delete on public.news_alerts from anon;
revoke insert, update, delete on public.news_alerts from authenticated;
