begin;

create table if not exists public.official_promises (
  id uuid primary key default gen_random_uuid(),
  official_id uuid references public.officials(id) on delete cascade,
  promise_title text not null,
  promise_detail text,
  promise_source text,
  promise_date date,
  promise_category text,
  status text default 'pending' check (status in ('pending','in_progress','fulfilled','broken','disputed')),
  progress_percent int default 0 check (progress_percent between 0 and 100),
  evidence_url text,
  evidence_note text,
  verified_by text default 'ai_agent',
  last_updated timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.promise_milestones (
  id uuid primary key default gen_random_uuid(),
  promise_id uuid references public.official_promises(id) on delete cascade,
  milestone_title text not null,
  target_date date,
  achieved boolean default false,
  note text
);

create table if not exists public.promise_evidence_submissions (
  id uuid primary key default gen_random_uuid(),
  promise_id uuid references public.official_promises(id) on delete cascade,
  submitted_by uuid references auth.users(id),
  evidence_url text not null,
  note text,
  stance text check (stance in ('supports','contradicts')),
  created_at timestamptz default now()
);

create index if not exists idx_official_promises_official_id on public.official_promises(official_id);
create index if not exists idx_official_promises_status on public.official_promises(status);
create index if not exists idx_promise_milestones_promise_id on public.promise_milestones(promise_id);
create index if not exists idx_promise_evidence_promise_id on public.promise_evidence_submissions(promise_id);

create or replace view public.official_mandate_scores as
select
  official_id,
  count(*) as total_promises,
  sum(case when status = 'fulfilled' then 1 else 0 end) as fulfilled,
  sum(case when status = 'in_progress' then 1 else 0 end) as in_progress,
  sum(case when status = 'broken' then 1 else 0 end) as broken,
  sum(case when status = 'disputed' then 1 else 0 end) as disputed,
  (
    (
      sum(case when status = 'fulfilled' then 1 else 0 end)
      + sum(case when status = 'in_progress' then 0.4 else 0 end)
    )
    / nullif(count(*), 0) * 100
  ) as mandate_score
from public.official_promises
group by official_id;

alter table public.official_promises enable row level security;
alter table public.promise_milestones enable row level security;
alter table public.promise_evidence_submissions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='official_promises' and policyname='public_read') then
    create policy public_read on public.official_promises for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='official_promises' and policyname='auth_write') then
    create policy auth_write on public.official_promises for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_milestones' and policyname='public_read') then
    create policy public_read on public.promise_milestones for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_milestones' and policyname='auth_write') then
    create policy auth_write on public.promise_milestones for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_evidence_submissions' and policyname='public_read') then
    create policy public_read on public.promise_evidence_submissions for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_evidence_submissions' and policyname='auth_write') then
    create policy auth_write on public.promise_evidence_submissions for all to authenticated using (true) with check (true);
  end if;
end $$;

commit;
