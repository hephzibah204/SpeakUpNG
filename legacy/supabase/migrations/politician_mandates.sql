begin;

alter table public.official_promises
  add column if not exists politician_id uuid references public.politicians(id) on delete cascade;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'official_promises_owner_xor_chk'
      and conrelid = 'public.official_promises'::regclass
  ) then
    alter table public.official_promises
      add constraint official_promises_owner_xor_chk
      check (
        (official_id is not null and politician_id is null)
        or
        (official_id is null and politician_id is not null)
      );
  end if;
end $$;

create index if not exists idx_official_promises_politician_id on public.official_promises(politician_id);
create index if not exists idx_official_promises_politician_status on public.official_promises(politician_id, status);

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
where official_id is not null
group by official_id;

create or replace view public.politician_mandate_scores as
select
  politician_id,
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
where politician_id is not null
group by politician_id;

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
where p.official_id is not null
group by p.official_id;

create or replace view public.politician_people_mandate_scores as
select
  p.politician_id,
  count(distinct p.id) as total_promises,
  count(c.promise_id) as scored_promises,
  round(avg(c.completion_score), 2) as mandate_score,
  sum(c.total_votes) as total_votes,
  max(c.last_vote_at) as last_vote_at
from public.official_promises p
left join public.promise_public_completion c on c.promise_id = p.id
where p.politician_id is not null
group by p.politician_id;

grant select on public.politician_mandate_scores to anon, authenticated;
grant select on public.politician_people_mandate_scores to anon, authenticated;

commit;
