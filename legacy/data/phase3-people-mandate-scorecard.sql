begin;

create table if not exists public.promise_assessments (
  id uuid primary key default gen_random_uuid(),
  promise_id uuid references public.official_promises(id) on delete cascade,
  user_id uuid references auth.users(id),
  device_hash text not null,
  anon_id text,
  fulfilled boolean not null,
  completion_percent int check (completion_percent between 0 and 100),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_promise_assessments_promise_id on public.promise_assessments(promise_id);
create index if not exists idx_promise_assessments_created_at on public.promise_assessments(created_at);
create unique index if not exists uq_promise_assessments_promise_device on public.promise_assessments(promise_id, device_hash);
create unique index if not exists uq_promise_assessments_promise_user on public.promise_assessments(promise_id, user_id);

create table if not exists public.mandate_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  promise_id uuid,
  record_table text not null,
  record_id uuid,
  actor_user_id uuid,
  actor_device_hash text,
  anon_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_mandate_audit_events_promise_id on public.mandate_audit_events(promise_id);
create index if not exists idx_mandate_audit_events_created_at on public.mandate_audit_events(created_at);

create or replace function public.nr_set_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_promise_assessments_updated_at on public.promise_assessments;
create trigger trg_promise_assessments_updated_at
before update on public.promise_assessments
for each row execute function public.nr_set_updated_at();

create or replace function public.nr_audit_promise_assessments() returns trigger
language plpgsql
as $$
declare
  v_event text;
  v_payload jsonb;
begin
  if (tg_op = 'INSERT') then
    v_event := 'promise_assessment_insert';
    v_payload := jsonb_build_object(
      'fulfilled', new.fulfilled,
      'completion_percent', new.completion_percent,
      'has_comment', (new.comment is not null and length(new.comment) > 0)
    );
  else
    v_event := 'promise_assessment_update';
    v_payload := jsonb_build_object(
      'fulfilled_from', old.fulfilled,
      'fulfilled_to', new.fulfilled,
      'completion_from', old.completion_percent,
      'completion_to', new.completion_percent,
      'comment_changed', (coalesce(old.comment,'') <> coalesce(new.comment,''))
    );
  end if;

  insert into public.mandate_audit_events (
    event_type, promise_id, record_table, record_id, actor_user_id, actor_device_hash, anon_id, payload
  ) values (
    v_event,
    new.promise_id,
    'promise_assessments',
    new.id,
    new.user_id,
    new.device_hash,
    new.anon_id,
    v_payload
  );

  return new;
end $$;

drop trigger if exists trg_audit_promise_assessments_insert on public.promise_assessments;
create trigger trg_audit_promise_assessments_insert
after insert on public.promise_assessments
for each row execute function public.nr_audit_promise_assessments();

drop trigger if exists trg_audit_promise_assessments_update on public.promise_assessments;
create trigger trg_audit_promise_assessments_update
after update on public.promise_assessments
for each row execute function public.nr_audit_promise_assessments();

create table if not exists public.promise_ai_verifications (
  id uuid primary key default gen_random_uuid(),
  promise_id uuid references public.official_promises(id) on delete cascade,
  evidence_original_url text not null,
  evidence_canonical_url text not null,
  evidence_url_hash text not null,
  model text not null,
  verdict text not null check (verdict in ('supports','contradicts','unclear')),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  explanation text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_promise_ai_verifications_promise_id on public.promise_ai_verifications(promise_id);
create unique index if not exists uq_promise_ai_verify_unique on public.promise_ai_verifications(promise_id, evidence_url_hash, model);

create or replace function public.nr_audit_ai_verifications() returns trigger
language plpgsql
as $$
begin
  insert into public.mandate_audit_events (
    event_type, promise_id, record_table, record_id, actor_user_id, payload
  ) values (
    'ai_verification_insert',
    new.promise_id,
    'promise_ai_verifications',
    new.id,
    new.created_by,
    jsonb_build_object(
      'model', new.model,
      'verdict', new.verdict,
      'confidence', new.confidence,
      'evidence_url_hash', new.evidence_url_hash
    )
  );
  return new;
end $$;

drop trigger if exists trg_audit_ai_verifications_insert on public.promise_ai_verifications;
create trigger trg_audit_ai_verifications_insert
after insert on public.promise_ai_verifications
for each row execute function public.nr_audit_ai_verifications();

alter table public.promise_assessments enable row level security;
alter table public.mandate_audit_events enable row level security;
alter table public.promise_ai_verifications enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_assessments' and policyname='public_read') then
    create policy public_read on public.promise_assessments for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_assessments' and policyname='public_upsert') then
    create policy public_upsert on public.promise_assessments
      for insert to anon, authenticated
      with check (
        device_hash is not null
        and length(device_hash) >= 16
        and fulfilled is not null
        and (
          (fulfilled = true and completion_percent is not null and completion_percent between 0 and 100)
          or (fulfilled = false and completion_percent is null)
        )
        and (comment is null or length(comment) <= 800)
        and (user_id is null or user_id = auth.uid())
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_assessments' and policyname='auth_update_own') then
    create policy auth_update_own on public.promise_assessments
      for update to authenticated
      using (user_id = auth.uid())
      with check (
        device_hash is not null
        and length(device_hash) >= 16
        and fulfilled is not null
        and (
          (fulfilled = true and completion_percent is not null and completion_percent between 0 and 100)
          or (fulfilled = false and completion_percent is null)
        )
        and (comment is null or length(comment) <= 800)
        and user_id = auth.uid()
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='mandate_audit_events' and policyname='public_read') then
    create policy public_read on public.mandate_audit_events for select to anon, authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_ai_verifications' and policyname='public_read') then
    create policy public_read on public.promise_ai_verifications for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_ai_verifications' and policyname='auth_insert') then
    create policy auth_insert on public.promise_ai_verifications
      for insert to authenticated
      with check (
        promise_id is not null
        and length(evidence_url_hash) >= 16
        and model is not null
        and verdict in ('supports','contradicts','unclear')
        and confidence >= 0 and confidence <= 1
        and (created_by is null or created_by = auth.uid())
      );
  end if;
end $$;

grant select on public.promise_assessments to anon, authenticated;
grant insert on public.promise_assessments to anon, authenticated;
grant update on public.promise_assessments to authenticated;
grant select on public.mandate_audit_events to anon, authenticated;
grant select on public.promise_ai_verifications to anon, authenticated;
grant insert on public.promise_ai_verifications to authenticated;

create or replace view public.promise_public_completion as
select
  promise_id,
  count(*) as total_votes,
  sum(case when fulfilled then 1 else 0 end) as yes_votes,
  sum(case when fulfilled then 0 else 1 end) as no_votes,
  round((sum(case when fulfilled then 1 else 0 end)::numeric / nullif(count(*),0)) * 100, 2) as fulfilled_rate,
  round(avg(case when fulfilled then completion_percent::numeric else null end), 2) as avg_completion_yes,
  round(
    (
      (sum(case when fulfilled then 1 else 0 end)::numeric / nullif(count(*),0))
      * (avg(case when fulfilled then completion_percent::numeric else null end) / 100)
      * 100
    )
  , 2) as completion_score,
  max(created_at) as last_vote_at
from public.promise_assessments
group by promise_id;

grant select on public.promise_public_completion to anon, authenticated;

create or replace view public.official_people_mandate_scores as
select
  p.official_id,
  count(distinct p.id) as total_promises,
  count(c.promise_id) as scored_promises,
  round(avg(c.completion_score), 2) as mandate_score,
  sum(c.total_votes) as total_votes,
  max(c.last_vote_at) as last_vote_at
from public.official_promises p
left join public.promise_public_completion c on c.promise_id = p.id
group by p.official_id;

grant select on public.official_people_mandate_scores to anon, authenticated;

commit;
