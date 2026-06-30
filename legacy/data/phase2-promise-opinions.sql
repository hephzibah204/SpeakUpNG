begin;

create table if not exists public.promise_opinions (
  id uuid primary key default gen_random_uuid(),
  promise_id uuid references public.official_promises(id) on delete cascade,
  device_hash text not null,
  anon_id text,
  stance text not null check (stance in ('supports','contradicts')),
  comment text,
  created_at timestamptz default now()
);

create index if not exists idx_promise_opinions_promise_id on public.promise_opinions(promise_id);
create unique index if not exists promise_opinion_one_per_device on public.promise_opinions(promise_id, device_hash);

alter table public.promise_opinions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_opinions' and policyname='public_read') then
    create policy public_read on public.promise_opinions for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_opinions' and policyname='public_insert') then
    create policy public_insert on public.promise_opinions
      for insert to anon, authenticated
      with check (
        device_hash is not null
        and length(device_hash) >= 16
        and stance in ('supports','contradicts')
        and (comment is null or length(comment) <= 800)
      );
  end if;
end $$;

grant select on public.promise_opinions to anon, authenticated;
grant insert on public.promise_opinions to anon, authenticated;

create or replace view public.promise_public_sentiment as
select
  promise_id,
  count(*) as total_reviews,
  sum(case when stance = 'supports' then 1 else 0 end) as supports,
  sum(case when stance = 'contradicts' then 1 else 0 end) as contradicts,
  round(
    (
      (
        (
          (sum(case when stance = 'supports' then 1 else 0 end)
           - sum(case when stance = 'contradicts' then 1 else 0 end))::numeric
          / nullif(count(*), 0)
        ) + 1
      ) / 2 * 100
    )::numeric
  , 2) as sentiment_score
from public.promise_opinions
group by promise_id;

grant select on public.promise_public_sentiment to anon, authenticated;

create or replace view public.official_public_sentiment as
select
  p.official_id,
  count(o.id) as total_reviews,
  sum(case when o.stance = 'supports' then 1 else 0 end) as supports,
  sum(case when o.stance = 'contradicts' then 1 else 0 end) as contradicts,
  round(
    (
      (
        (
          (sum(case when o.stance = 'supports' then 1 else 0 end)
           - sum(case when o.stance = 'contradicts' then 1 else 0 end))::numeric
          / nullif(count(o.id), 0)
        ) + 1
      ) / 2 * 100
    )::numeric
  , 2) as public_sentiment_score
from public.official_promises p
left join public.promise_opinions o on o.promise_id = p.id
group by p.official_id;

grant select on public.official_public_sentiment to anon, authenticated;

commit;
