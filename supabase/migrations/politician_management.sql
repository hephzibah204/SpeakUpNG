create extension if not exists pgcrypto;

create table if not exists political_parties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text null,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lower(name)),
  unique (lower(abbreviation))
);

create table if not exists offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null,
  region text null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lower(name), lower(level), coalesce(lower(region), ''))
);

create table if not exists politicians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  party_id uuid null references political_parties(id) on delete set null,
  state text null,
  politician_kind text not null default 'politician',
  current_status text not null default 'non-office',
  current_office_id uuid null references offices(id) on delete set null,
  relevance_score int not null default 0,
  featured_rank int not null default 999,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lower(full_name))
);

create table if not exists transition_batches (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  reason text not null,
  effective_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_transition_batches_created_at on transition_batches(created_at desc);

create table if not exists office_assignments (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references politicians(id) on delete restrict,
  office_id uuid not null references offices(id) on delete restrict,
  effective_from timestamptz not null,
  effective_to timestamptz null,
  batch_id uuid null references transition_batches(id) on delete set null,
  voided_at timestamptz null,
  voided_reason text null,
  created_at timestamptz not null default now(),
  constraint chk_assignment_range check (effective_to is null or effective_to > effective_from)
);
create index if not exists idx_assignments_politician on office_assignments(politician_id, effective_from desc);
create index if not exists idx_assignments_office on office_assignments(office_id, effective_from desc);
create index if not exists idx_assignments_batch on office_assignments(batch_id);

create unique index if not exists uq_office_current_assignment
  on office_assignments(office_id)
  where effective_to is null and voided_at is null;

create unique index if not exists uq_politician_current_assignment
  on office_assignments(politician_id)
  where effective_to is null and voided_at is null;

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  batch_id uuid null references transition_batches(id) on delete set null,
  before_json jsonb null,
  after_json jsonb null,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_entity on audit_events(entity_type, entity_id, created_at desc);
create index if not exists idx_audit_batch on audit_events(batch_id, created_at desc);

create or replace function trg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_political_parties on political_parties;
create trigger set_updated_at_political_parties
before update on political_parties
for each row execute function trg_set_updated_at();

drop trigger if exists set_updated_at_offices on offices;
create trigger set_updated_at_offices
before update on offices
for each row execute function trg_set_updated_at();

drop trigger if exists set_updated_at_politicians on politicians;
create trigger set_updated_at_politicians
before update on politicians
for each row execute function trg_set_updated_at();

create or replace function audit_log(p_action text, p_entity_type text, p_entity_id uuid, p_batch_id uuid, p_before jsonb, p_after jsonb)
returns void
language plpgsql
as $$
declare
  v_actor uuid;
begin
  v_actor := auth.uid();
  if v_actor is null then
    raise exception 'Not authenticated';
  end if;
  insert into audit_events(actor_user_id, action, entity_type, entity_id, batch_id, before_json, after_json)
  values (v_actor, p_action, p_entity_type, p_entity_id, p_batch_id, p_before, p_after);
end;
$$;

create or replace function rpc_transition_apply(p_transitions jsonb, p_effective_at timestamptz, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_batch_id uuid;
  v_rejected jsonb := '[]'::jsonb;
  v_applied int := 0;
  v_seen_offices text[] := array[]::text[];
  v_item jsonb;
  v_office_id uuid;
  v_winner_id uuid;
  v_office offices%rowtype;
  v_winner politicians%rowtype;
  v_prev_assign office_assignments%rowtype;
  v_new_assign office_assignments%rowtype;
  v_prev_pol politicians%rowtype;
begin
  v_actor := auth.uid();
  if v_actor is null then
    raise exception 'Not authenticated';
  end if;

  if p_transitions is null or jsonb_typeof(p_transitions) <> 'array' then
    return jsonb_build_object('batch_id', null, 'applied_count', 0, 'rejected', jsonb_build_array(jsonb_build_object('error','transitions must be a JSON array')));
  end if;
  if p_effective_at is null then
    return jsonb_build_object('batch_id', null, 'applied_count', 0, 'rejected', jsonb_build_array(jsonb_build_object('error','effective_at is required')));
  end if;
  if coalesce(nullif(trim(p_reason),''), '') = '' then
    return jsonb_build_object('batch_id', null, 'applied_count', 0, 'rejected', jsonb_build_array(jsonb_build_object('error','reason is required')));
  end if;

  for v_item in select * from jsonb_array_elements(p_transitions)
  loop
    begin
      v_office_id := null;
      v_winner_id := null;
      v_office_id := (v_item->>'office_id')::uuid;
      v_winner_id := (v_item->>'winner_politician_id')::uuid;

      if v_office_id is null or v_winner_id is null then
        v_rejected := v_rejected || jsonb_build_array(jsonb_build_object('office_id', v_item->>'office_id', 'winner_politician_id', v_item->>'winner_politician_id', 'error', 'office_id and winner_politician_id are required'));
        continue;
      end if;

      if array_position(v_seen_offices, v_office_id::text) is not null then
        v_rejected := v_rejected || jsonb_build_array(jsonb_build_object('office_id', v_office_id, 'winner_politician_id', v_winner_id, 'error', 'duplicate office_id in batch'));
        continue;
      end if;
      v_seen_offices := array_append(v_seen_offices, v_office_id::text);

      select * into v_office from offices where id = v_office_id and active = true;
      if not found then
        v_rejected := v_rejected || jsonb_build_array(jsonb_build_object('office_id', v_office_id, 'winner_politician_id', v_winner_id, 'error', 'office not found or inactive'));
        continue;
      end if;

      select * into v_winner from politicians where id = v_winner_id and active = true;
      if not found then
        v_rejected := v_rejected || jsonb_build_array(jsonb_build_object('office_id', v_office_id, 'winner_politician_id', v_winner_id, 'error', 'politician not found or inactive'));
        continue;
      end if;

      if exists(
        select 1
        from office_assignments a
        where a.politician_id = v_winner_id
          and a.effective_to is null
          and a.voided_at is null
      ) then
        v_rejected := v_rejected || jsonb_build_array(jsonb_build_object('office_id', v_office_id, 'winner_politician_id', v_winner_id, 'error', 'winner already holds an active office'));
        continue;
      end if;

    exception when others then
      v_rejected := v_rejected || jsonb_build_array(jsonb_build_object('office_id', v_item->>'office_id', 'winner_politician_id', v_item->>'winner_politician_id', 'error', sqlerrm));
      continue;
    end;
  end loop;

  if jsonb_array_length(v_rejected) > 0 then
    return jsonb_build_object('batch_id', null, 'applied_count', 0, 'rejected', v_rejected);
  end if;

  insert into transition_batches(actor_user_id, reason, effective_at)
  values (v_actor, p_reason, p_effective_at)
  returning id into v_batch_id;

  for v_item in select * from jsonb_array_elements(p_transitions)
  loop
    v_office_id := (v_item->>'office_id')::uuid;
    v_winner_id := (v_item->>'winner_politician_id')::uuid;

    select * into v_prev_assign
    from office_assignments
    where office_id = v_office_id
      and effective_to is null
      and voided_at is null
    limit 1;

    if found then
      if v_prev_assign.politician_id = v_winner_id then
        continue;
      end if;
      select * into v_prev_pol from politicians where id = v_prev_assign.politician_id;
      update office_assignments
        set effective_to = p_effective_at
        where id = v_prev_assign.id;
      perform audit_log('TRANSITION', 'OFFICE_ASSIGNMENT', v_prev_assign.id, v_batch_id, to_jsonb(v_prev_assign), to_jsonb((select a from office_assignments a where a.id = v_prev_assign.id)));
    end if;

    insert into office_assignments(politician_id, office_id, effective_from, batch_id)
    values (v_winner_id, v_office_id, p_effective_at, v_batch_id)
    returning * into v_new_assign;
    perform audit_log('TRANSITION', 'OFFICE_ASSIGNMENT', v_new_assign.id, v_batch_id, null, to_jsonb(v_new_assign));

    select * into v_winner from politicians where id = v_winner_id;
    update politicians
      set current_status = 'in-office', current_office_id = v_office_id
      where id = v_winner_id;
    perform audit_log('TRANSITION', 'POLITICIAN', v_winner_id, v_batch_id, to_jsonb(v_winner), to_jsonb((select p from politicians p where p.id = v_winner_id)));

    if v_prev_assign.id is not null and v_prev_assign.politician_id <> v_winner_id then
      select * into v_prev_pol from politicians where id = v_prev_assign.politician_id;
      update politicians
        set current_status = 'non-office', current_office_id = null
        where id = v_prev_assign.politician_id;
      perform audit_log('TRANSITION', 'POLITICIAN', v_prev_assign.politician_id, v_batch_id, to_jsonb(v_prev_pol), to_jsonb((select p from politicians p where p.id = v_prev_assign.politician_id)));
    end if;

    v_applied := v_applied + 1;
  end loop;

  return jsonb_build_object('batch_id', v_batch_id, 'applied_count', v_applied, 'rejected', '[]'::jsonb);
end;
$$;

create or replace function rpc_transition_rollback(p_batch_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_batch transition_batches%rowtype;
  v_count int := 0;
  v_assignment office_assignments%rowtype;
  v_prev office_assignments%rowtype;
  v_pol politicians%rowtype;
  v_prev_pol politicians%rowtype;
begin
  v_actor := auth.uid();
  if v_actor is null then
    raise exception 'Not authenticated';
  end if;
  if p_batch_id is null then
    raise exception 'batch_id is required';
  end if;

  select * into v_batch from transition_batches where id = p_batch_id;
  if not found then
    raise exception 'batch not found';
  end if;
  if coalesce(nullif(trim(p_reason),''), '') = '' then
    raise exception 'reason is required';
  end if;

  for v_assignment in
    select *
    from office_assignments
    where batch_id = p_batch_id
      and voided_at is null
    order by created_at desc
  loop
    if exists(
      select 1
      from office_assignments a
      where a.office_id = v_assignment.office_id
        and a.voided_at is null
        and a.effective_from > v_assignment.effective_from
    ) then
      raise exception 'cannot rollback: later assignments exist for an affected office';
    end if;

    select * into v_pol from politicians where id = v_assignment.politician_id;

    update office_assignments
      set voided_at = now(),
          voided_reason = p_reason,
          effective_to = coalesce(effective_to, effective_from)
      where id = v_assignment.id;
    perform audit_log('ROLLBACK', 'OFFICE_ASSIGNMENT', v_assignment.id, p_batch_id, to_jsonb(v_assignment), to_jsonb((select a from office_assignments a where a.id = v_assignment.id)));

    update politicians
      set current_status = 'non-office', current_office_id = null
      where id = v_assignment.politician_id;
    perform audit_log('ROLLBACK', 'POLITICIAN', v_assignment.politician_id, p_batch_id, to_jsonb(v_pol), to_jsonb((select p from politicians p where p.id = v_assignment.politician_id)));

    select * into v_prev
    from office_assignments
    where office_id = v_assignment.office_id
      and voided_at is null
      and effective_to = v_assignment.effective_from
    order by effective_from desc
    limit 1;

    if found then
      select * into v_prev_pol from politicians where id = v_prev.politician_id;
      update office_assignments set effective_to = null where id = v_prev.id;
      perform audit_log('ROLLBACK', 'OFFICE_ASSIGNMENT', v_prev.id, p_batch_id, to_jsonb(v_prev), to_jsonb((select a from office_assignments a where a.id = v_prev.id)));

      update politicians
        set current_status = 'in-office', current_office_id = v_prev.office_id
        where id = v_prev.politician_id;
      perform audit_log('ROLLBACK', 'POLITICIAN', v_prev.politician_id, p_batch_id, to_jsonb(v_prev_pol), to_jsonb((select p from politicians p where p.id = v_prev.politician_id)));
    end if;

    v_count := v_count + 1;
  end loop;

  return jsonb_build_object('batch_id', p_batch_id, 'rolled_back_count', v_count);
end;
$$;

grant execute on function rpc_transition_apply(jsonb, timestamptz, text) to authenticated;
grant execute on function rpc_transition_rollback(uuid, text) to authenticated;

alter table political_parties enable row level security;
alter table offices enable row level security;
alter table politicians enable row level security;
alter table transition_batches enable row level security;
alter table office_assignments enable row level security;
alter table audit_events enable row level security;

drop policy if exists parties_read on political_parties;
create policy parties_read on political_parties
for select to authenticated
using (true);

drop policy if exists parties_write on political_parties;
create policy parties_write on political_parties
for all to authenticated
using (true)
with check (true);

drop policy if exists offices_read on offices;
create policy offices_read on offices
for select to authenticated
using (true);

drop policy if exists offices_write on offices;
create policy offices_write on offices
for all to authenticated
using (true)
with check (true);

drop policy if exists politicians_read on politicians;
create policy politicians_read on politicians
for select to authenticated
using (true);

drop policy if exists politicians_write on politicians;
create policy politicians_write on politicians
for all to authenticated
using (true)
with check (true);

drop policy if exists batches_read on transition_batches;
create policy batches_read on transition_batches
for select to authenticated
using (true);

drop policy if exists batches_write on transition_batches;
create policy batches_write on transition_batches
for insert to authenticated
with check (actor_user_id = auth.uid());

drop policy if exists assignments_read on office_assignments;
create policy assignments_read on office_assignments
for select to authenticated
using (true);

drop policy if exists audit_read on audit_events;
create policy audit_read on audit_events
for select to authenticated
using (true);

revoke insert, update, delete on office_assignments from authenticated;
revoke insert, update, delete on audit_events from authenticated;

insert into political_parties(name, abbreviation, sort_order)
values
  ('Labour Party', 'LP', 1),
  ('New Nigeria Peoples Party', 'NNPP', 2),
  ('Peoples Democratic Party', 'PDP', 3),
  ('All Progressives Congress', 'APC', 4)
on conflict (lower(name)) do nothing;

insert into politicians(full_name, party_id, politician_kind, current_status, relevance_score, featured_rank)
select 'Peter Obi', p.id, 'aspirant', 'non-office', 100, 1
from political_parties p where lower(p.abbreviation) = 'lp'
on conflict (lower(full_name)) do nothing;

insert into politicians(full_name, party_id, politician_kind, current_status, relevance_score, featured_rank)
select 'Rabiu Musa Kwankwaso', p.id, 'aspirant', 'non-office', 95, 2
from political_parties p where lower(p.abbreviation) = 'nnpp'
on conflict (lower(full_name)) do nothing;

insert into politicians(full_name, party_id, politician_kind, current_status, relevance_score, featured_rank)
select 'Atiku Abubakar', p.id, 'aspirant', 'non-office', 90, 3
from political_parties p where lower(p.abbreviation) = 'pdp'
on conflict (lower(full_name)) do nothing;

